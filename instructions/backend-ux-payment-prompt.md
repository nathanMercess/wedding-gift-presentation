# Prompt para backend: UX completa de presenteamento e pagamento

Contexto: o frontend Angular da lista de presentes precisa oferecer uma experiencia confiavel para convidados que presenteiam o casal. O backend deve sustentar estados reais de pagamento, retomada, recibo, concorrencia de saldo, filtros publicos e idempotencia. Implemente as mudancas abaixo mantendo compatibilidade com os endpoints atuais quando possivel.

## Objetivo

Garantir que o convidado saiba exatamente o que aconteceu com o pagamento, possa retomar uma tentativa pendente, receba/comprove o presente realizado e nunca pague um valor invalido por concorrencia de saldo.

## Contrato de pagamento

1. Persistir uma intencao de pagamento por `orderId`, com os campos:
   - `orderId`
   - `giftId`
   - `giftName`
   - `amount`
   - `contributorName`
   - `message`
   - `method`
   - `status`
   - `statusDetail`
   - `mpOrderId`
   - `contributionCreated`
   - `createdAt`
   - `updatedAt`
   - `expiresAt`

2. O `orderId` deve ser idempotente:
   - Se o mesmo `orderId` for reenviado, nao criar pagamento/contribuicao duplicados.
   - Retornar a intencao existente com status atual.

3. Retornar estados distintos:
   - `approved`
   - `processed`
   - `pending`
   - `in_process`
   - `rejected`
   - `expired`
   - `cancelled`
   - `error`

4. Adicionar endpoint de retomada/recibo:
   - `GET /payment/order/{orderId}`
   - Deve retornar a intencao persistida, incluindo dados para recibo e status atual.

5. Manter/ajustar endpoint de status:
   - `GET /payment/status/{mpOrderId}`
   - Deve atualizar a intencao local antes de responder.
   - Deve retornar `orderId`, `mpOrderId`, `status`, `statusDetail`, `contributionCreated`, `message`.

## Concorrencia de saldo

1. Antes de criar Pix/cartao, revalidar:
   - presente existe;
   - esta disponivel;
   - valor e maior que zero;
   - valor nao passa do saldo restante quando o modo publico exige limite.

2. Implementar reserva temporaria de saldo:
   - Ao criar uma intencao `pending`/`in_process`, reservar o valor por alguns minutos.
   - Ignorar reservas expiradas ao calcular saldo restante.
   - Ao aprovar, converter reserva em contribuicao.
   - Ao rejeitar/expirar/cancelar, liberar reserva.

3. Quando o valor solicitado nao couber mais no saldo, responder com erro de negocio claro:
   - `INSUFFICIENT_AMOUNT`
   - incluir `remainingAmount` quando possivel.

## Recibo

1. Ao aprovar ou processar pagamento, retornar dados suficientes para comprovante:
   - `orderId`
   - `giftName`
   - `amount`
   - `status`
   - `statusDetail`
   - `paidAt` ou `updatedAt`
   - `contributorName`
   - `contributionCreated`

2. Opcional, mas recomendado:
   - Enviar e-mail de confirmacao quando houver e-mail do pagador.
   - Incluir mensagem enviada ao casal.

## Filtros publicos de presentes

1. `GET /gifts` deve aceitar:
   - `search`
   - `category`
   - `minTotal`
   - `maxTotal`
   - `onlyAvailable`
   - `orderBy`
   - `orderDir`
   - `page`
   - `pageSize`

2. O modelo publico de presente deve incluir:
   - `category`
   - `remaining`
   - `raised`
   - `total`
   - `available`
   - `fullyFunded`
   - `allowPartialContribution`

3. Categorias validas, exatamente:
   - `Cozinha`
   - `Eletrodomesticos`
   - `Quarto`
   - `Mesa`
   - `Casa`

## Webhooks/reconciliacao

1. Webhook do provedor deve atualizar a intencao de pagamento idempotentemente.
2. Se o webhook aprovar pagamento e a contribuicao ainda nao existir, criar contribuicao.
3. O endpoint admin de reconciliacao deve continuar existindo, mas a jornada do convidado nao deve depender de operacao manual.

## Criterios de aceite

1. Dois cliques ou dois envios com o mesmo `orderId` nao duplicam contribuicao.
2. Pix gerado pode ser retomado por `orderId`.
3. Cartao `pending`/`in_process` nao aparece como aprovado; aparece como "em analise".
4. Pagamento aprovado retorna recibo consultavel.
5. Tentativa acima do saldo restante retorna erro claro com saldo atual.
6. Filtros publicos funcionam com paginacao.
7. Webhook tardio cria/atualiza contribuicao corretamente sem duplicar.
