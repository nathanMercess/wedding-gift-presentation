import { Injectable, WritableSignal, signal } from '@angular/core';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentResumeState } from '../models/payment-resume-state.model';
import { PendingPayment } from '../models/pending-payment.model';

const PAYMENT_RESUME_STORAGE_KEY = 'weddingGift.pendingPayment';
const PAYMENT_RESUME_TTL_MS = 24 * 60 * 60 * 1000;

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

      const parsedPayment: unknown = JSON.parse(rawPayment);

      if (!this.isValid(parsedPayment)) {
        this.remove();
        return null;
      }

      if (Date.now() - new Date(parsedPayment.updatedAt).getTime() > PAYMENT_RESUME_TTL_MS) {
        this.remove();
        return null;
      }

      return parsedPayment;
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

  private isValid(value: unknown): value is PendingPayment {
    if (!value || typeof value !== 'object')
      return false;

    const payment: Record<string, unknown> = value as Record<string, unknown>;
    const gift: Record<string, unknown> | null = payment['gift'] && typeof payment['gift'] === 'object' ? payment['gift'] as Record<string, unknown> : null;

    if (!gift || typeof gift['id'] !== 'string' || typeof gift['name'] !== 'string')
      return false;

    if (typeof payment['orderId'] !== 'string' || !payment['orderId'])
      return false;

    if (typeof payment['amount'] !== 'number' || !Number.isFinite(payment['amount']) || payment['amount'] <= 0)
      return false;

    if (typeof payment['contributorName'] !== 'string' || typeof payment['message'] !== 'string')
      return false;

    if (!Object.values(PaymentMethod).includes(payment['method'] as PaymentMethod))
      return false;

    if (!Object.values(PaymentStatus).includes(payment['status'] as PaymentStatus))
      return false;

    if (typeof payment['createdAt'] !== 'string' || !Number.isFinite(new Date(payment['createdAt']).getTime()))
      return false;

    if (typeof payment['updatedAt'] !== 'string' || !Number.isFinite(new Date(payment['updatedAt']).getTime()))
      return false;

    return typeof payment['contributionCreated'] === 'boolean';
  }
}
