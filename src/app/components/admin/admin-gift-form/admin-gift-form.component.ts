import { Component, InputSignal, OutputEmitterRef, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Gift } from '../../../models/gift.model';
import { GiftService } from '../../../services/gift.service';
import { EndpointsUrls } from '../../../constants/api-endpoints';
import { HttpErrorUtil } from '../../../utils/http-error';
import { CreditCardFeeUtil } from '../../../checkout/utils/credit-card-fee.util';

interface GiftEnrichResponse {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  standalone: true,
  selector: 'app-admin-gift-form',
  templateUrl: './admin-gift-form.component.html',
  styleUrl: './admin-gift-form.component.scss',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AdminGiftFormComponent {
  public readonly editingGift: InputSignal<Gift | null> = input<Gift | null>(null);
  public readonly cancel: OutputEmitterRef<void> = output<void>();

  public readonly form: FormGroup;
  public enrichUrl: string = '';
  public enriching: boolean = false;
  public enrichError: string = '';
  public appliedSuggestionBaseAmount: number = 0;
  private raised: number = 0;

  public constructor(
    public readonly giftService: GiftService,
    public readonly http: HttpClient,
    public readonly endpoints: EndpointsUrls,
    public readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      total: [null, [Validators.required, Validators.min(0.01)]],
      image: [''],
      description: ['', [Validators.maxLength(1000)]],
      allowPartialContribution: [true],
    });

    effect((): void => {
      const gift: Gift | null = this.editingGift();

      this.raised = gift?.raised ?? 0;
      this.form.reset({
        name: gift?.name ?? '',
        total: gift?.total ?? null,
        image: gift?.image ?? '',
        description: gift?.description ?? '',
        allowPartialContribution: gift?.allowPartialContribution ?? true,
      });

      this.enrichUrl = '';
      this.enrichError = '';
      this.appliedSuggestionBaseAmount = 0;
      this.giftService.clearAdminGiftError();
      this.giftService.resetAdminGiftSaved();
    }, { allowSignalWrites: true });
  }

  public get imageUrl(): string {
    return this.form.get('image')!.value ?? '';
  }

  public get totalAmount(): number {
    return Number(this.form.get('total')!.value ?? 0);
  }

  public get suggestionApplied(): boolean {
    if (this.appliedSuggestionBaseAmount <= 0)
      return false;

    return Math.abs(this.totalAmount - CreditCardFeeUtil.calculateGrossAmount(this.appliedSuggestionBaseAmount)) <= 0.01;
  }

  public get creditCardPreviewAmount(): number {
    return CreditCardFeeUtil.calculateGrossAmount(this.creditCardPreviewBaseAmount);
  }

  public get creditCardInstallmentPreview(): number {
    return CreditCardFeeUtil.calculateInstallmentAmount(this.creditCardPreviewBaseAmount);
  }

  public get creditCardMaxInstallments(): number {
    return CreditCardFeeUtil.getMaxInstallments();
  }

  public get creditCardFeePercent(): number {
    return CreditCardFeeUtil.getTotalFeePercent();
  }

  public applySuggestedTotal(): void {
    if (this.creditCardPreviewAmount <= 0)
      return;

    this.appliedSuggestionBaseAmount = this.creditCardPreviewBaseAmount;
    this.form.patchValue({ total: this.creditCardPreviewAmount });
    this.form.get('total')!.markAsTouched();
    this.form.get('total')!.markAsDirty();
  }

  private get creditCardPreviewBaseAmount(): number {
    if (this.suggestionApplied)
      return this.appliedSuggestionBaseAmount;

    return this.totalAmount;
  }

  public enrichFromLink(): void {
    if (!this.enrichUrl.trim())
      return;

    this.enriching = true;
    this.enrichError = '';

    this.http.post<GiftEnrichResponse>(this.endpoints.adminGiftsEnrich, { url: this.enrichUrl }).subscribe({
      next: (data: GiftEnrichResponse): void => {
        this.enriching = false;
        if (data.name) this.form.get('name')!.setValue(data.name);
        if (data.description) this.form.get('description')!.setValue(data.description);
        if (data.price) this.form.get('total')!.setValue(data.price);
        if (data.imageUrl) this.form.get('image')!.setValue(data.imageUrl);
      },
      error: (err: HttpErrorResponse): void => {
        this.enriching = false;
        this.enrichError = HttpErrorUtil.extract(err, 'Não foi possível obter os dados do link.');
      },
    });
  }

  public save(): void {
    if (this.giftService.adminState().giftSaving)
      return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const giftId: string | null = this.editingGift() ? this.editingGift()!.id : null;
    const value = this.form.value;

    const payload: Partial<Gift> = {
      name: `${value.name ?? ''}`.trim(),
      total: Number(value.total),
      image: value.image ?? '',
      description: `${value.description ?? ''}`.trim(),
      allowPartialContribution: !!value.allowPartialContribution,
      raised: this.raised,
    };

    this.giftService.saveAdminGift(giftId, payload);
  }

  public onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = '';

    if (!file)
      return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.giftService.patchAdminState({ imageUploadError: 'Envie uma imagem JPG, PNG ou WEBP.' });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.giftService.patchAdminState({ imageUploadError: 'O tamanho máximo permitido é 20MB.' });
      return;
    }

    const previousImage: string = this.form.get('image')!.value ?? '';
    this.form.get('image')!.setValue(URL.createObjectURL(file));

    this.giftService.uploadGiftImage(
      file,
      (url: string): void => { this.form.get('image')!.setValue(url); },
      (): void => { this.form.get('image')!.setValue(previousImage); },
    );
  }
}
