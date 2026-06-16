# Padrões de código — Angular

Estes padrões são obrigatórios para qualquer componente ou service novo/editado neste projeto.

## Referências base
- **Componentes**: seguir o padrão de [src/app/components/guest-view/guest-view.component.ts](src/app/components/guest-view/guest-view.component.ts)
- **Services**: seguir o padrão de [src/app/services/auth.service.ts](src/app/services/auth.service.ts)

## Ordem das propriedades no `@Component`

Sempre nesta ordem, com trailing comma em cada propriedade:

```ts
@Component({
  standalone: true,
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush, // só se usado
})
```

---

## Enums

Todo union type de strings deve virar enum — nunca usar `'value1' | 'value2'` diretamente em propriedades, parâmetros ou modelos. Cada enum em seu próprio arquivo:

```
src/app/enums/              → enums compartilhados (ModalStep, ButtonVariant, etc.)
src/app/checkout/enums/     → enums do domínio de pagamento (PaymentMethod, PaymentStatus, PixStep)
```

Para usar enums em templates Angular, expor o tipo no componente:
```ts
public readonly PaymentMethod: typeof PaymentMethod = PaymentMethod;
```

---

## Regras gerais

1. **Imports em uma única linha por statement.** Não quebrar imports do `@angular/core`, `@angular/forms` etc em múltiplas linhas, mesmo que fiquem longos.
   ```ts
   import { ChangeDetectionStrategy, Component, OnDestroy, OutputEmitterRef, inject, input, output } from '@angular/core';
   ```

2. **Modificadores de acesso explícitos.** Todo membro de classe (propriedade, método, getter, construtor) deve declarar `public` ou `private` — nunca deixar implícito.

3. **Tipos de retorno explícitos** em todos os métodos, incluindo `void`.

4. **Injeção de dependências no construtor** com `public readonly` (não usar `private` para deps de serviços/router, salvo casos pontuais de encapsulamento interno como `FormBuilder` quando não precisa ser exposto). Seguir exatamente o estilo do `auth.service.ts`:
   ```ts
   public constructor(public readonly http: HttpClient, public readonly router: Router) {}
   ```

5. **Signals para `@Input`/`@Output`/two-way binding** — nunca usar os decorators clássicos:
   - `@Input()` → `input<T>(default)` ou `input.required<T>()` quando obrigatório.
   - `@Output()` → `output<T>()`.
   - Binding bidirecional (quando o componente expõe um valor que o pai também escreve) → `model<T>(default)`.
   - Tipar a propriedade com `InputSignal<T>` / `OutputEmitterRef<T>` / `ModelSignal<T>`.
   - No template, sempre invocar como função: `gift()`, `coupleName()`, `disabled()`.

6. **Estado interno de UI** (que não é `@Input`/`@Output` nem vem de um service) permanece como propriedade pública simples (`public searchTerm: string = '';`), **não** precisa virar signal — só os services expõem estado via `signal()`/`WritableSignal`.

7. **Sincronizar com signals de services via `effect()`** no construtor do componente, como feito em `guest-view.component.ts` e `admin-dashboard.component.ts`.

8. **Services com estado** usam `WritableSignal<T>` + método `patchState()` que faz merge imutável:
   ```ts
   public readonly state: WritableSignal<MyState> = signal<MyState>({ ... });

   public patchState(partialState: Partial<MyState>): void {
     this.state.update((currentState: MyState): MyState => ({ ...currentState, ...partialState }));
   }
   ```

9. **Services sem estado** (ex: `payment.service.ts`) seguem a mesma estrutura de construtor `public readonly`, métodos `public`, tipos de retorno explícitos (`Observable<T>`), mesmo sem signals.

10. Não criar abstrações, comentários ou validações extras além do necessário — manter o código tão direto quanto os arquivos de referência.

11. **Sem `function` keyword e sem `const fn = () =>`** — utilitários são sempre **classe abstrata com métodos estáticos**:
    ```ts
    export abstract class HttpErrorUtil {
      public static extract(err: HttpErrorResponse, fallback: string): string { ... }
    }
    ```

12. **`if` sem `else`** — usar early returns. Nunca encadear `if/else if/else`. Formato obrigatório: condição na mesma linha do `if`, retorno na linha seguinte indentada, linha em branco após o bloco:
    ```ts
    if (err.status === 0)
      return 'Sem conexão.';

    const body = err.error;

    if (!body)
      return `${fallback} (${err.status})`;
    ```
    Chaves (`{}`) só quando o bloco tiver mais de uma instrução.

---

## Tratamento de erros HTTP em services

Todo handler `error:` de `HttpClient` deve usar `HttpErrorUtil.extract` de `src/app/utils/http-error.ts` em vez de string fixa. Lê `ProblemDetails`/`ValidationProblemDetails` em ordem: erros de validação campo-a-campo → `detail` → `title` → fallback com status HTTP.

```ts
import { HttpErrorUtil } from '../utils/http-error';

error: (err: HttpErrorResponse): void => {
  this.patchState({ error: HttpErrorUtil.extract(err, 'Mensagem de fallback.') });
}
```

Utilitários ficam em `src/app/utils/` como **classe abstrata com métodos estáticos públicos** — nunca `function`, nunca `const fn = () =>`, nunca método privado no service.

---

## Componentes de diálogo e confirmação

- Usar `ConfirmDialogComponent` (`src/app/components/confirm-dialog/`) para toda ação destrutiva — nunca `window.confirm()`.
- Inputs: `title`, `message`, `confirmLabel`, `cancelLabel`. Outputs: `(confirmed)`, `(cancelled)`.
- Controlar visibilidade com uma flag booleana no componente pai (`showXxxConfirm: boolean`).
- Fechar com `Esc` deve cancelar o diálogo (chamar o handler de `cancelled`).

---

## Categorias de presentes

Os valores válidos de categoria são exatamente (case-sensitive, como o backend armazena):
`Cozinha` | `Eletrodomésticos` | `Quarto` | `Mesa` | `Casa`

Qualquer select/filtro de categoria deve usar esses valores exatos como `id`.

---

## Deploy e infraestrutura

- Push em `main` dispara CI/CD automaticamente (GitHub Actions) para frontend e backend separadamente.
- O nginx da VM (`/etc/nginx/sites-enabled/davidmaira.com`) é a camada externa antes dos containers Docker — qualquer limite de upload ou header deve ser configurado lá via SSH (`gcloud compute ssh wedding-gift --zone southamerica-east1-c`).
- O nginx dentro do container Docker (`nginx.conf`) está atrás do nginx da VM.
- Migrations de banco são aplicadas automaticamente no startup da API (`MigrateAsync`).
- Bucket GCS: `weddinggift-uploads` (southamerica-east1) — fotos ficam em `gifts/{uuid}.ext`, URLs públicas `https://storage.googleapis.com/weddinggift-uploads/gifts/...`.
