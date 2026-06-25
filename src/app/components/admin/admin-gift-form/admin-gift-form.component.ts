import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, effect, input, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EndpointsUrls } from '../../../constants/api-endpoints';
import { EMPTY_GIFT } from '../../../constants/empty-gift.constant';
import { CreditCardFeeUtil } from '../../../checkout/utils/credit-card-fee.util';
import { ApiResponse } from '../../../models/api-response.model';
import { Gift } from '../../../models/gift.model';
import { GiftService } from '../../../services/gift.service';
import { ApiResponseUtil } from '../../../utils/api-response.util';
import { HttpErrorUtil } from '../../../utils/http-error';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminGiftFormComponent {
  public readonly editingGift: InputSignal<Gift> = input.required<Gift>();
  public readonly cancel: OutputEmitterRef<void> = output<void>();

  public readonly form: FormGroup;
  public appliedSuggestionBaseAmount: number = 0;
  private raised: number = 0;

  public constructor(
    public readonly giftService: GiftService, 
    public readonly http: HttpClient, 
    public readonly endpoints: EndpointsUrls, 
    public readonly fb: FormBuilder) {
      
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      total: [null, [Validators.required, Validators.min(0.01)]],
      image: [''],
      description: ['', [Validators.maxLength(1000)]],
      allowPartialContribution: [true],
      avavailable: [true],
    });

    effect((): void => {
      const gift: Gift = this.editingGift();

      this.raised = gift.raised;
      this.form.reset({
        name: gift.name,
        total: this.isEditing ? gift.total : null,
        image: gift.image,
        description: gift.description ?? '',
        allowPartialContribution: gift.allowPartialContribution,
        available: gift.available,
      });

      this.appliedSuggestionBaseAmount = 0;
      this.giftService.clearAdminGiftError();
      this.giftService.resetAdminGiftSaved();
    }, { allowSignalWrites: true });
  }

  public get imageUrl(): string {
    return this.form.get('image')!.value ?? '';
  }

  public get isEditing(): boolean {
    return this.editingGift().id.trim().length > 0;
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

  public save(): void {
    if (this.giftService.adminState().giftSaving)
      return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const giftId: string = this.editingGift().id;
    const value = this.form.value;

    const payload: Partial<Gift> = {
      name: `${value.name ?? ''}`.trim(),
      total: Number(value.total),
      image: value.image ?? '',
      description: `${value.description ?? ''}`.trim(),
      allowPartialContribution: !!value.allowPartialContribution,
      available: !!value.available,
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
      this.giftService.patchAdminState({ imageUploadError: 'O tamanho maximo permitido e 20MB.' });
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
