# Prompt para backend: operacao administrativa e continuidade do convidado

Contexto: o frontend Angular da lista de casamento ja possui catalogo publico, contribuicao parcial, pagamento por PIX/cartao, retomada local, recibo na tela, CRUD administrativo de presentes e dashboard tecnico de super-admin. A proxima etapa deve transformar o painel do casal em uma central operacional e permitir que o convidado recupere seu pedido em qualquer dispositivo.

Implemente as mudancas abaixo mantendo compatibilidade com os endpoints atuais, o envelope `ApiResponse<T>`, os codigos de erro existentes e a autenticacao por role. Nao exponha CPF, dados de cartao, tokens do Mercado Pago ou informacoes tecnicas no endpoint publico.

## 1. Categorias no CRUD administrativo

Os valores validos, case-sensitive, sao:

- `Cozinha`
- `Eletrodomésticos`
- `Quarto`
- `Mesa`
- `Casa`

Requisitos:

1. Aceitar `category` opcional e nullable em `POST /api/admin/gifts` e `PUT /api/admin/gifts/{id}`.
2. Quando preenchida, validar o valor contra a lista acima e retornar erro de validacao campo a campo para `category`.
3. Retornar `category` em `GET /api/gifts`, `GET /api/gifts/{id}` e endpoints administrativos.
4. `null` deve representar "Sem categoria" e deve permitir remover a categoria de um presente existente.
5. A coluna no banco deve ser nullable. Para registros antigos sem categoria, manter `null` sem quebrar a leitura e sem inventar categoria durante a migracao.

## 2. Central de contribuicoes do casal

Criar `GET /api/admin/contributions` com paginacao e filtros:

- `search`: nome do convidado, presente ou numero do pedido;
- `giftId`;
- `status`: `Pending`, `Paid`, `Cancelled`;
- `paymentMethod`: `Pix`, `CreditCard`, `DebitCard`;
- `hasMessage`;
- `fromUtc` e `toUtc`;
- `page` e `pageSize`;
- `orderDir`, com padrao decrescente por data.

Cada item deve retornar:

```json
{
  "id": "uuid",
  "orderId": "uuid",
  "giftId": "uuid",
  "giftName": "Air Fryer",
  "guestName": "Maria Silva",
  "guestEmail": "maria@example.com",
  "amount": 250.00,
  "message": "Felicidades!",
  "status": "Paid",
  "paymentMethod": "Pix",
  "paymentStatus": "Approved",
  "createdAtUtc": "2026-07-12T18:00:00Z",
  "paidAtUtc": "2026-07-12T18:03:00Z"
}
```

O admin comum so pode acessar contribuicoes do proprio casal. O super-admin pode consultar todas conforme o modelo de autorizacao atual.

## 3. Caixa de mensagens

Adicionar aos registros de contribuicao:

- `messageReadAtUtc`, nullable;
- `messageArchivedAtUtc`, nullable.

Endpoints:

- `PATCH /api/admin/contributions/{id}/message-read` com `{ "read": true | false }`;
- `PATCH /api/admin/contributions/{id}/message-archive` com `{ "archived": true | false }`.

As operacoes devem ser idempotentes. Incluir no dashboard do casal as contagens `unreadMessages` e `recentMessages`.

## 4. Central de pagamentos

Criar `GET /api/admin/payments` com os mesmos parametros de periodo, busca e paginacao, mais filtros por status e metodo. Retornar somente dados operacionais seguros:

- pedido, presente, convidado, e-mail mascarado quando apropriado;
- valor, metodo, status, detalhe amigavel, datas;
- identificador do provedor necessario para suporte;
- `correlationId` quando houver falha;
- indicador `contributionCreated`.

Reutilizar a conciliacao existente em `POST /api/admin/payments/reconcile-approved`, garantindo autorizacao de super-admin. Para o admin do casal, oferecer apenas consulta; nenhuma acao deve capturar, estornar ou alterar pagamentos sem um endpoint especifico e auditado.

## 5. Consulta publica segura de pedido

Criar um fluxo sem login para recuperar pedido em outro dispositivo:

1. `POST /api/payment/order-lookup/request` recebe `{ "email": "...", "orderId": "..." }`.
2. Sempre retornar resposta neutra para evitar enumeracao de pedidos ou e-mails.
3. Quando houver correspondencia, enviar link de uso unico com token aleatorio, armazenado como hash e expiracao curta.
4. `GET /api/payment/order-lookup/{token}` retorna somente:
   - `orderId`;
   - nome e imagem do presente;
   - valor;
   - metodo;
   - status amigavel;
   - datas;
   - indicador de contribuicao criada.
5. O token deve expirar, ser revogavel e nao conter dados pessoais em JWT legivel pelo cliente.

Aplicar rate limit por IP e por hash de e-mail. Registrar tentativa e resultado sem armazenar o token puro em log.

## 6. Confirmacao por e-mail

Quando um pagamento mudar para aprovado:

1. Criar a contribuicao de forma idempotente antes de enfileirar o e-mail.
2. Enviar confirmacao contendo casal, presente, valor, metodo, pedido, data e mensagem registrada.
3. Incluir link seguro para consulta do pedido.
4. Nunca enviar CPF ou dados de cartao.
5. Usar outbox transacional ou fila persistente para que falha do provedor de e-mail nao reverta o pagamento.
6. Registrar status de envio, quantidade de tentativas e ultimo erro sanitizado.

O webhook e o polling podem observar o mesmo pagamento; o e-mail e a contribuicao devem continuar unicos por `orderId`.

## 7. Dashboard do casal

Criar `GET /api/admin/overview?days=30` para o admin comum, separado do dashboard tecnico do super-admin. Retornar:

- total arrecadado e meta;
- presentes totais, concluidos e sem contribuicao;
- contribuicoes aprovadas, pendentes e falhas;
- contribuidores unicos;
- mensagens nao lidas;
- cinco contribuicoes recentes;
- cinco pagamentos que precisam de atencao;
- serie diaria de valor aprovado no periodo.

Todos os calculos monetarios devem considerar apenas pagamentos aprovados e contribuicoes efetivamente criadas.

## 8. Exportacao

Criar `GET /api/admin/contributions/export.csv` respeitando os mesmos filtros da listagem. Gerar UTF-8 com BOM, cabecalhos em portugues e valores monetarios compativeis com Excel. Aplicar autorizacao e limitar o intervalo maximo para evitar consultas abusivas.

Colunas: pedido, presente, categoria, convidado, e-mail, valor, mensagem, status, metodo, data da contribuicao e data da aprovacao.

## 9. Auditoria e observabilidade

Registrar em auditoria:

- leitura/arquivamento de mensagens;
- exportacoes;
- conciliacoes;
- alteracoes de presente e categoria;
- geracao e consumo de link de consulta.

Logs devem usar `correlationId`, nunca conter CPF completo, token de consulta, payload de cartao ou codigo PIX copia-e-cola.

## 10. Testes obrigatorios

Cobrir pelo menos:

1. isolamento de dados entre casais;
2. validacao das cinco categorias;
3. paginacao e combinacao de filtros;
4. aprovacao concorrente/idempotente por `orderId`;
5. e-mail enfileirado uma unica vez;
6. token de consulta valido, expirado, reutilizado e inexistente;
7. resposta neutra contra enumeracao;
8. rate limit;
9. exportacao com caracteres acentuados;
10. dashboard excluindo pagamentos nao aprovados.

## Criterios de aceite

- Migrations aplicam automaticamente no startup via `MigrateAsync`.
- Endpoints administrativos exigem autenticacao e respeitam o casal do token.
- Endpoints publicos nao vazam dados pessoais ou existencia de pedido.
- Contratos usam UTC em ISO 8601 e valores monetarios decimais.
- Erros seguem `ProblemDetails`/`ValidationProblemDetails` e o envelope atual esperado pelo frontend.
- Swagger documenta filtros, respostas e roles.
- A implementacao continua compativel com o checkout atual durante a liberacao gradual do novo frontend.
