# Boas Praticas para Front Angular

Baseado nos padroes observados em:

`C:\influency.me\Influencer.Angular\src\app\+campaign-invite\+campaign-invite-detail\components\chat`

Use este guia como referencia de estilo, organizacao e manutencao para features Angular. Ele nao define regras de negocio; define como estruturar codigo para que a feature continue legivel, modular e facil de evoluir.

## Principios Gerais

- Separe a feature por responsabilidade: componente raiz, componentes internos, services, models e bases compartilhadas.
- Componentes devem coordenar UI; services devem concentrar estado, chamadas HTTP e regras de dados.
- Prefira composicao de componentes pequenos em vez de um componente grande com muitos blocos condicionais.
- Reutilize bases simples apenas quando houver repeticao real de contrato, estado ou inputs.
- Mantenha o codigo direto. Evite abstracoes antecipadas e helpers sem necessidade clara.
- Cada arquivo deve ter uma responsabilidade facil de nomear.

## Organizacao de Pastas

Organize features grandes em uma pasta propria:

```text
feature/
  feature.component.ts
  feature.component.html
  feature.component.scss
  feature.module.ts
  services/
  models/
  components/
    base/
    shared-component/
    domain-a/
    domain-b/
```

Boas praticas:

- `components/` guarda partes visuais da feature.
- `services/` guarda estado, HTTP e coordenacao de dados.
- `models/` guarda tipos usados apenas naquele recorte.
- `base/` so deve existir para contratos compartilhados pequenos e estaveis.
- Subpastas devem refletir subdominios reais, nao tipos genericos demais.

## Modulos Angular

Quando a feature usa `NgModule`, mantenha o modulo como ponto unico de composicao.

Boas praticas:

- Declare no modulo apenas componentes pertencentes aquela feature.
- Importe bibliotecas, directives, pipes e componentes externos usados pelos templates da feature.
- Exporte apenas o que precisa ser consumido fora da feature.
- Nao duplique imports em modulos superiores se eles pertencem somente a feature.
- Mantenha `imports`, `declarations` e `exports` agrupados de forma previsivel.

## Componentes

Componentes devem ser pequenos, declarativos e orientados a template.

Boas praticas:

- Use `ChangeDetectionStrategy.OnPush` por padrao.
- Injete services usados no template como `public readonly`.
- Injete dependencias internas como `private readonly` ou `protected readonly`.
- Exponha enums e constants para template como `public readonly Nome = Nome`.
- Inputs obrigatorios podem usar `input.required<T>()`.
- Para valores que precisam ser lidos e atualizados pelo componente pai, use `model<T>()` com `ModelSignal<T>` em vez de combinar `@Input()` e `@Output()`.
- Todo membro de classe deve ter modificador explicito (`public`, `private` ou `protected`).
- Todo metodo deve declarar tipo de retorno explicito, inclusive `void`.
- Propriedades nao devem usar union com `null` ou `undefined`; cada propriedade deve ter um unico tipo. Modele estado vazio com valor inicial do proprio tipo, enum de status ou objeto de estado dedicado.
- Evite construir payloads complexos, URLs ou regras de negocio dentro do componente.
- Use metodos pequenos para acoes do template.
- Use `computed()` quando um valor derivado depende de signals e e usado no template.

Exemplo de forma:

```ts
@Component({
  selector: 'app-feature-card',
  templateUrl: './feature-card.component.html',
  styleUrls: ['./feature-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureCardComponent {
  public readonly StatusEnum = StatusEnum;
  public readonly content = input.required<string>();

  public readonly parsedContent = computed<FeatureContent>(() =>
    JSON.parse(this.content()) as FeatureContent
  );

  constructor(public readonly featureService: FeatureService) { }
}
```

## Templates

Templates devem deixar o estado da tela claro sem esconder muita logica.

Boas praticas:

- Use `@if`, `@else`, `@switch` e `@for` em templates novos.
- Leia signals sempre como funcao: `service.loading()`, `state()`, `items()`.
- Use `track` em listas: `@for (item of items(); track item.id)`.
- Deixe estados visuais consistentes: loading, vazio, conteudo e erro.
- Mova condicoes complexas para `computed()` ou metodos nomeados.
- Evite expressoes longas e repetidas no HTML.
- Use slots/templates quando uma parte da UI precisa ser customizada sem acoplar componentes.

## Services e Estado

Services devem ser a fonte principal de estado compartilhado da feature.

Boas praticas:

- Use `signal()` para estado observavel no template.
- Exponha signals como `public readonly`.
- Mantenha loading, erro e dados separados.
- Use `set()` para troca direta e `update()` para merge imutavel.
- Resete erros ao iniciar uma nova acao.
- Services devem montar URLs e payloads, nao componentes.
- Services devem validar resposta antes de popular estado.
- Evite services com muitos dominios diferentes; divida por responsabilidade.
- Propriedades de estado devem ter tipo unico; evite `T | null` e `T | undefined`.

Exemplo:

```ts
@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string>('');
  public readonly data = signal<FeatureData>(FeatureData.empty());

  public constructor(
    private readonly http: HttpCancelPreviousRequestService,
    private readonly url: Url
  ) { }
}
```

## HTTP

Chamadas HTTP devem ser tipadas, curtas e protegidas contra uso indevido da resposta.

Boas praticas:

- Tipar sempre a resposta HTTP.
- Centralizar URLs em um provider/service de URLs.
- Usar `take(1)` para requisicoes pontuais.
- Usar `finalize()` para desligar loading.
- Tratar erro no service e refletir no estado.
- Validar status/contrato antes de usar o payload.
- Evitar `subscribe()` em componentes quando a chamada altera estado compartilhado.
- Usar servico de cancelamento de request quando novas chamadas substituem chamadas antigas.

Exemplo:

```ts
this.loading.set(true);
this.error.set('');

this.http.get<HttpRequestResult<FeatureData>>(this.url.featureData(id))
  .pipe(take(1), finalize(() => this.loading.set(false)))
  .subscribe({
    next: (response): void => {
      if (response.StatusCode !== 200)
        return;

      this.data.set(response.Result);
    },
    error: (errorResponse: HttpErrorResponse): void => {
      this.error.set(errorResponse?.error?.ErrorMessage);
    }
  });
```

## Modais

Modais devem ter estado previsivel e independente do componente visual.

Boas praticas:

- Use um service de modal para `open`, `loading` e `error`.
- Componentes de modal devem apenas renderizar e disparar acoes.
- Fechar modal deve limpar erro local.
- Evite flags duplicadas no componente quando o service ja controla o estado.
- Use confirmacao reutilizavel para acoes destrutivas ou irreversiveis.
- Mantenha loading dentro do modal, nao espalhado pela pagina.

Base recomendada:

```ts
@Injectable({
  providedIn: 'root'
})
export class ModalBaseService {
  public readonly modalState = signal<ModalState>({ open: false, loading: false });
  public readonly error = signal<string>('');

  public startLoading(): void {
    this.modalState.update(state => ({ ...state, loading: true }));
  }

  public stopLoading(): void {
    this.modalState.update(state => ({ ...state, loading: false }));
  }

  public open(): void {
    this.modalState.update(state => ({ ...state, open: true }));
  }

  public close(): void {
    this.modalState.update(state => ({ ...state, open: false }));
    this.error.set('');
  }
}
```

## Componentes de Acao

Quando mensagens, cards ou eventos podem gerar diferentes acoes visuais, use um componente roteador.

Boas praticas:

- Parseie a entrada uma vez.
- Delegue cada tipo de acao para um componente especifico.
- Compartilhe inputs comuns por uma base pequena.
- Nao coloque renderizacao de todos os tipos em um unico componente gigante.
- Use `@switch` para deixar o mapeamento explicito no template.

Exemplo de base:

```ts
@Directive()
export abstract class GenericActionBase {
  public readonly ActionSubCodeConstants = ActionSubCodeConstants;

  public readonly subActionCode = input.required<string>();
  public readonly content = input.required<string>();
}
```

## Heranca e Bases

Use heranca com cuidado.

Boas praticas:

- Bases devem ser pequenas e estaveis.
- Uma base deve compartilhar contrato, estado ou comportamento realmente comum.
- Evite bases que conhecem detalhes de muitos subdominios.
- Components podem estender uma base apenas para evitar duplicacao clara de inputs ou helpers.
- Services base sao bons para estado comum de modal, chamadas padronizadas ou lifecycle compartilhado.

## Estilo Visual

O visual deve reaproveitar o design system antes de criar CSS novo.

Boas praticas:

- Reutilize componentes visuais existentes.
- Reutilize classes utilitarias do projeto.
- Use Font Awesome ou biblioteca de icones ja adotada.
- SCSS local deve ser curto e restrito ao componente.
- Evite estilos globais para resolver problemas locais.
- Mantenha nomes de classes por bloco visual: header, body, footer, status, actions.
- Cards e modais devem ter estados visuais consistentes.

## Regras de Qualidade

Antes de finalizar uma feature, confira:

- A feature esta modularizada por responsabilidade.
- O componente raiz nao concentra regra de negocio.
- Services controlam estado e HTTP.
- URLs nao aparecem hardcoded em componentes.
- Respostas HTTP sao tipadas e validadas.
- Loading e erro sao tratados de forma consistente.
- Metodos possuem modificador e tipo de retorno explicitos.
- Propriedades nao usam `| null` ou `| undefined`.
- Components usam `OnPush`.
- Templates nao tem expressoes complexas repetidas.
- Listas usam `track`.
- Modais possuem service de estado proprio.
- Acoes irreversiveis usam confirmacao reutilizavel.
- CSS novo e minimo e local.
