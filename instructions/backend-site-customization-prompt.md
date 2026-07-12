# Prompt para backend: customizacao do site por casal

Contexto: alguns casais querem personalizar a experiencia publica da lista de presentes sem alterar codigo: esconder categorias, remover filtros, ocultar progresso/estatisticas e ajustar textos. O frontend passara a ler `siteSettings` dentro do objeto publico/admin do casal. Implemente suporte persistente no backend mantendo defaults retrocompativeis.

## Objetivo

Permitir que cada casal controle o que aparece na vitrine publica e no checkout, com validacao no backend para que categorias ocultas tambem nao vazem via `GET /gifts`.

## Modelo

Adicionar ao casal um objeto `siteSettings`:

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

Categorias validas, exatamente:
- `Cozinha`
- `Eletrodomésticos`
- `Quarto`
- `Mesa`
- `Casa`

## Endpoints

1. `GET /couple`
   - Deve retornar `siteSettings`.
   - Se ainda nao houver configuracao salva, retornar os defaults acima.

2. `PUT /admin/couple`
   - Deve aceitar `siteSettings` parcial ou completo.
   - Deve normalizar/validar `enabledCategories`.
   - Deve rejeitar categorias desconhecidas com `VALIDATION_ERROR`.
   - Deve preservar defaults para campos ausentes.

3. `GET /gifts`
   - Deve respeitar `siteSettings.enabledCategories` quando `showGiftCategories` for true.
   - Presentes de categorias desabilitadas nao devem aparecer na vitrine publica.
   - Se `showGiftCategories` for false, a categoria nao precisa ser exposta no DTO publico, mas os presentes podem continuar aparecendo.
   - Se o request enviar `category`, validar se ela esta em `enabledCategories`; caso contrario retornar lista vazia ou erro de validacao claro.

4. `GET /admin/gifts`
   - Nao aplicar restricao de `enabledCategories`; admin precisa ver tudo.

## Regras de compatibilidade

1. Casais existentes sem `siteSettings` devem manter o comportamento atual.
2. Se `enabledCategories` vier vazio, interpretar como nenhuma categoria publica habilitada quando `showGiftCategories = true`.
3. Se `showCategoryFilter = false`, o frontend esconde o filtro, mas o backend ainda deve aplicar `enabledCategories`.
4. Configuracoes de visualizacao nao devem afetar regras de pagamento, salvo categorias ocultas na vitrine publica.

## Criterios de aceite

1. Admin consegue salvar configuracao parcial do site.
2. Publico recebe configuracao em `GET /couple`.
3. Vitrine publica nao mostra categorias desabilitadas.
4. Admin continua vendo todos os presentes.
5. Configuracoes ausentes usam defaults.
6. Categorias invalidas nunca sao persistidas.
