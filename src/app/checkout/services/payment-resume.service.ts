import { Injectable, WritableSignal, signal } from '@angular/core';
import { PaymentResumeState } from '../models/payment-resume-state.model';
import { PendingPayment } from '../models/pending-payment.model';

const PAYMENT_RESUME_STORAGE_KEY = 'weddingGift.pendingPayment';

@Injectable({ providedIn: 'root' })
export class PaymentResumeService {
  public readonly state: WritableSignal<PaymentResumeState> = signal<PaymentResumeState>({
    pending: null,
  });

  public constructor() {
    this.restore();
  }

  public save(pending: PendingPayment): void {
    this.patchState({ pending });
    this.write(pending);
  }

  public update(partialPayment: Partial<PendingPayment>): void {
    const currentPayment: PendingPayment | null = this.state().pending;

    if (!currentPayment)
      return;

    this.save({ ...currentPayment, ...partialPayment, updatedAt: new Date().toISOString() });
  }

  public clear(orderId?: string): void {
    const currentPayment: PendingPayment | null = this.state().pending;

    if (orderId && currentPayment?.orderId !== orderId)
      return;

    this.patchState({ pending: null });
    this.remove();
  }

  public patchState(partialState: Partial<PaymentResumeState>): void {
    this.state.update((currentState: PaymentResumeState): PaymentResumeState => ({ ...currentState, ...partialState }));
  }

  private restore(): void {
    const pending: PendingPayment | null = this.read();

    if (!pending)
      return;

    this.patchState({ pending });
  }

  private read(): PendingPayment | null {
    try {
      const rawPayment: string | null = localStorage.getItem(PAYMENT_RESUME_STORAGE_KEY);

      if (!rawPayment)
        return null;

      return JSON.parse(rawPayment) as PendingPayment;
    } catch {
      this.remove();
      return null;
    }
  }

  private write(pending: PendingPayment): void {
    try {
      localStorage.setItem(PAYMENT_RESUME_STORAGE_KEY, JSON.stringify(pending));
    } catch {
      return;
    }
  }

  private remove(): void {
    try {
      localStorage.removeItem(PAYMENT_RESUME_STORAGE_KEY);
    } catch {
      return;
    }
  }
}
