# Prompt para backend: implementar `siteSettings`

Contexto: o frontend ja possui a configuracao `siteSettings` no modelo de casal para controlar, por casal, quais blocos da pagina publica aparecem e quais textos sao exibidos. Hoje essa configuracao precisa ser persistida e retornada pelo backend para que o admin consiga salvar a personalizacao e a vitrine publica respeite esses ajustes.

## Como o `siteSettings` funciona no frontend

O objeto `siteSettings` fica dentro do casal (`couple.siteSettings`) e e consumido em duas areas:

1. **Admin do casal**: o formulario de casal edita os campos de `siteSettings` junto com os dados gerais do casal. O admin pode ligar/desligar secoes, escolher categorias publicas e alterar textos da vitrine.
2. **Pagina publica**: a vitrine le `siteSettings` retornado em `GET /couple` para decidir se mostra contagem regressiva, local do evento, mensagem do casal, estatisticas, categorias, filtros, progresso de presentes, tipo de contribuicao e textos customizados.

Se o backend nao retornar `siteSettings`, o frontend usa defaults para manter o comportamento atual. Mesmo assim, o backend deve passar a persistir e devolver esse objeto para que as customizacoes sejam salvas de verdade.

## Objetivo da tarefa

Implementar suporte completo a `siteSettings` no backend, mantendo compatibilidade com casais ja existentes e garantindo que categorias desabilitadas tambem sejam respeitadas na listagem publica de presentes.

## Contrato esperado do modelo

Adicionar ao casal um objeto `siteSettings` com estes campos e defaults:

```json
{
  "showCountdown": true,
  "showEventLocation": true,
  "showCoupleMessage": true,
  "showGuestStats": true,
  "showGiftCategories": true,
  "showGiftProgress": true,
  "showContributionType": true,
  "showCategoryFilter": true,
  "showPriceFilter": true,
  "showAvailabilityFilter": true,
  "enabledCategories": ["Cozinha", "Eletrodomésticos", "Quarto", "Mesa", "Casa"],
  "giftSectionTitle": "Escolha seu presente",
  "giftSectionSubtitle": "",
  "searchPlaceholder": "Buscar presente...",
  "presentButtonLabel": "Presentear",
  "emptyStateTitle": "Nenhum presente encontrado",
  "emptyStateMessage": "Tente ajustar os filtros ou buscar por outro termo"
}
```

Categorias validas, exatamente como o backend armazena hoje:

- `Cozinha`
- `Eletrodomésticos`
- `Quarto`
- `Mesa`
- `Casa`

## Semantica de cada campo

- `showCountdown`: mostra/esconde a contagem regressiva do casamento.
- `showEventLocation`: mostra/esconde o local do evento.
- `showCoupleMessage`: mostra/esconde a mensagem/frase do casal.
- `showGuestStats`: mostra/esconde estatisticas publicas da lista, quando aplicavel ao modo de exibicao.
- `showGiftCategories`: mostra/esconde a categoria nos cards/detalhes. Quando `true`, o backend tambem deve filtrar a vitrine publica por `enabledCategories`.
- `showGiftProgress`: mostra/esconde progresso de cotas/contribuicoes dos presentes.
- `showContributionType`: mostra/esconde informacoes de tipo de contribuicao.
- `showCategoryFilter`: mostra/esconde o filtro de categoria no frontend. Mesmo quando `false`, o backend deve continuar respeitando `enabledCategories` se `showGiftCategories` for `true`.
- `showPriceFilter`: mostra/esconde filtros de preco minimo/maximo no frontend.
- `showAvailabilityFilter`: mostra/esconde filtro de disponibilidade no frontend.
- `enabledCategories`: lista de categorias publicas habilitadas. Se estiver vazia e `showGiftCategories` for `true`, nenhum presente categorizado deve aparecer na vitrine publica.
- `giftSectionTitle`: titulo da secao de presentes.
- `giftSectionSubtitle`: subtitulo da secao de presentes.
- `searchPlaceholder`: placeholder do campo de busca.
- `presentButtonLabel`: texto do botao de presentear.
- `emptyStateTitle`: titulo exibido quando nenhum presente e encontrado.
- `emptyStateMessage`: mensagem exibida quando nenhum presente e encontrado.

## Endpoints a ajustar

### `GET /couple`

- Deve retornar `siteSettings` dentro do casal publico.
- Se o casal ainda nao tiver configuracao salva, retornar os defaults acima.
- Nao retornar `null` para `siteSettings`.

### `PUT /admin/couple`

- Deve aceitar `siteSettings` parcial ou completo no payload.
- Deve fazer merge com defaults/cadastro atual para campos ausentes, sem apagar configuracoes ja salvas indevidamente.
- Deve validar `enabledCategories` contra a lista oficial de categorias.
- Deve rejeitar categorias desconhecidas com erro de validacao claro (`VALIDATION_ERROR`, se esse for o padrao atual da API).
- Deve persistir apenas categorias validas e os campos conhecidos de `siteSettings`.

### `GET /gifts`

- Deve aplicar a configuracao do casal na vitrine publica.
- Quando `showGiftCategories` for `true`, retornar apenas presentes sem categoria ou com categoria presente em `enabledCategories`.
- Quando `showGiftCategories` for `false`, os presentes podem continuar aparecendo, mas a categoria nao precisa ser exposta no DTO publico.
- Se o request publico enviar filtro `category`, validar se a categoria esta habilitada em `enabledCategories` quando `showGiftCategories` for `true`; caso contrario, retornar lista vazia ou erro de validacao claro.
- Os filtros existentes de busca, preco e disponibilidade devem continuar funcionando normalmente.

### `GET /admin/gifts`

- Nao aplicar restricao de `enabledCategories`.
- Admin deve continuar vendo todos os presentes, inclusive categorias ocultas para o publico.

## Regras de compatibilidade

1. Casais existentes sem `siteSettings` devem manter exatamente o comportamento atual usando os defaults.
2. Campos ausentes em payloads antigos nao devem quebrar a API.
3. `enabledCategories` vazio deve ser persistido e interpretado como nenhuma categoria publica habilitada quando `showGiftCategories` for `true`.
4. Configuracoes visuais nao devem alterar regras de pagamento/checkout, exceto pelo fato de presentes ocultos nao aparecerem na vitrine publica.
5. O backend deve preferir normalizacao centralizada para evitar divergencia entre `GET /couple`, `PUT /admin/couple` e `GET /gifts`.

## Criterios de aceite

1. Admin salva `siteSettings` completo e parcial pelo endpoint de casal.
2. `GET /couple` sempre retorna `siteSettings` completo com defaults preenchidos.
3. Categorias invalidas em `enabledCategories` sao rejeitadas e nunca persistidas.
4. `GET /gifts` nao mostra presentes de categorias desabilitadas quando `showGiftCategories` for `true`.
5. `GET /admin/gifts` continua retornando todos os presentes.
6. Casais sem configuracao salva continuam com a experiencia publica atual.
7. Testes cobrem defaults, atualizacao parcial, validacao de categorias e filtro publico de presentes.
