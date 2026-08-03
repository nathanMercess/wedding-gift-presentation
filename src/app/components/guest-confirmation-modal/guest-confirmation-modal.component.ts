import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OutputEmitterRef, ViewChild, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { GuestSource } from '../../enums/guest-source.enum';
import { GuestConfirmation, GuestConfirmationGuestRequest, GuestConfirmationRequest, GuestDraft, GuestSuggestion } from '../../models/guest.model';
import { GuestConfirmationService } from '../../services/guest-confirmation.service';

interface GuestSearchRequest {
  index: number;
  search: string;
}

@Component({
  standalone: true,
  selector: 'app-guest-confirmation-modal',
  templateUrl: './guest-confirmation-modal.component.html',
  styleUrl: './guest-confirmation-modal.component.scss',
  imports: [CommonModule, FormsModule],
})
export class GuestConfirmationModalComponent implements AfterViewInit, OnDestroy {
  public readonly GuestSource: typeof GuestSource = GuestSource;
  public readonly closed: OutputEmitterRef<void> = output<void>();
  public guests: GuestDraft[] = [this.newGuestDraft()];

  @ViewChild('submitterInput') public submitterInput?: ElementRef<HTMLInputElement>;
  @ViewChild('guestDialog') public guestDialog?: ElementRef<HTMLElement>;

  private readonly destroy$: Subject<void> = new Subject<void>();
  private readonly search$: Subject<GuestSearchRequest> = new Subject<GuestSearchRequest>();

  public constructor(public readonly guestConfirmationService: GuestConfirmationService) {
    this.guestConfirmationService.reset();
    document.body.classList.add('modal-open');
    this.search$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe((request: GuestSearchRequest): void => this.loadSuggestions(request));
  }

  public ngAfterViewInit(): void {
    this.submitterInput?.nativeElement.focus();
  }

  public ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get confirmation(): GuestConfirmation | null {
    return this.guestConfirmationService.state().confirmation;
  }

  public get submitLabel(): string {
    const count: number = this.guests.length;
    return `Confirmar ${count} presença${count === 1 ? '' : 's'}`;
  }

  public addCompanion(): void {
    if (this.guests.length >= 20)
      return;

    this.guests = [...this.guests, this.newGuestDraft()];
  }

  public removeCompanion(index: number): void {
    if (index === 0)
      return;

    this.guests = this.guests.filter((_: GuestDraft, guestIndex: number): boolean => guestIndex !== index);
  }

  public onNameInput(index: number): void {
    const guest: GuestDraft = this.guests[index];
    guest.guestInvitationId = null;
    guest.suggestions = [];
    guest.activeSuggestionIndex = -1;
    const search: string = guest.name.trim();

    if (search.length < 3) {
      guest.suggestionsOpen = false;
      return;
    }

    guest.suggestionsOpen = true;
    this.search$.next({ index, search });
  }

  public selectSuggestion(index: number, suggestion: GuestSuggestion): void {
    const guest: GuestDraft = this.guests[index];
    guest.name = suggestion.name;
    guest.guestInvitationId = suggestion.id;
    guest.suggestions = [];
    guest.suggestionsOpen = false;
    guest.activeSuggestionIndex = -1;
  }

  public onInputKeydown(event: KeyboardEvent, index: number): void {
    const guest: GuestDraft = this.guests[index];

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      guest.activeSuggestionIndex = Math.min(guest.activeSuggestionIndex + 1, guest.suggestions.length - 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      guest.activeSuggestionIndex = Math.max(guest.activeSuggestionIndex - 1, 0);
      return;
    }

    if (event.key === 'Enter' && guest.suggestionsOpen && guest.suggestions.length > 0) {
      event.preventDefault();
      const suggestionIndex: number = guest.activeSuggestionIndex < 0 ? 0 : guest.activeSuggestionIndex;
      this.selectSuggestion(index, guest.suggestions[suggestionIndex]);
      return;
    }

    if (event.key !== 'Escape')
      return;

    event.stopPropagation();
    guest.suggestionsOpen = false;
  }

  public submit(): void {
    const names: string[] = this.guests.map((guest: GuestDraft): string => this.normalizeName(guest.name));

    if (names.some((name: string): boolean => name.length === 0)) {
      this.guestConfirmationService.patchState({ error: 'Preencha o nome de todas as pessoas.' });
      return;
    }

    if (new Set(names).size !== names.length) {
      this.guestConfirmationService.patchState({ error: 'Não é possível adicionar nomes repetidos.' });
      return;
    }

    const request: GuestConfirmationRequest = {
      guests: this.guests.map((guest: GuestDraft, index: number): GuestConfirmationGuestRequest => ({
        guestInvitationId: guest.guestInvitationId,
        name: guest.name.trim(),
        isSubmitter: index === 0,
      })),
    };
    this.guestConfirmationService.confirm(request);
  }

  public sourceLabel(guest: GuestDraft): string {
    return guest.guestInvitationId ? 'Da lista' : 'Texto livre';
  }

  public confirmedSourceLabel(source: GuestSource): string {
    return source === GuestSource.RegisteredList ? 'Da lista' : 'Texto livre';
  }

  public close(): void {
    this.closed.emit();
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('guest-modal-backdrop'))
      this.close();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    const openGuest: GuestDraft | undefined = this.guests.find((guest: GuestDraft): boolean => guest.suggestionsOpen);

    if (openGuest) {
      openGuest.suggestionsOpen = false;
      return;
    }

    this.close();
  }

  @HostListener('document:keydown.tab', ['$event'])
  public keepFocusInside(event: KeyboardEvent): void {
    const dialog: HTMLElement | undefined = this.guestDialog?.nativeElement;

    if (!dialog)
      return;

    const focusable: HTMLElement[] = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'));

    if (focusable.length === 0)
      return;

    const first: HTMLElement = focusable[0];
    const last: HTMLElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (event.shiftKey || document.activeElement !== last)
      return;

    event.preventDefault();
    first.focus();
  }

  public trackByGuest(_: number, guest: GuestDraft): GuestDraft {
    return guest;
  }

  public trackBySuggestion(_: number, suggestion: GuestSuggestion): string {
    return suggestion.id;
  }

  private loadSuggestions(request: GuestSearchRequest): void {
    this.guestConfirmationService.getSuggestions(request.search).pipe(takeUntil(this.destroy$)).subscribe({
      next: (suggestions: GuestSuggestion[]): void => {
        const guest: GuestDraft | undefined = this.guests[request.index];

        if (!guest || guest.name.trim() !== request.search)
          return;

        guest.suggestions = suggestions;
        guest.suggestionsOpen = true;
        guest.activeSuggestionIndex = -1;
      },
      error: (): void => {
        const guest: GuestDraft | undefined = this.guests[request.index];

        if (guest)
          guest.suggestions = [];
      },
    });
  }

  private newGuestDraft(): GuestDraft {
    return { name: '', guestInvitationId: null, suggestions: [], suggestionsOpen: false, activeSuggestionIndex: -1 };
  }

  private normalizeName(value: string): string {
    return value.trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  }
}
