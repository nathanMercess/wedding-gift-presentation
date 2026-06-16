# Padrões de código — Angular

Estes padrões são obrigatórios para qualquer componente ou service novo/editado neste projeto.

## Referências base
- **Componentes**: seguir o padrão de [src/app/components/guest-view/guest-view.component.ts](src/app/components/guest-view/guest-view.component.ts)
- **Services**: seguir o padrão de [src/app/services/auth.service.ts](src/app/services/auth.service.ts)

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
