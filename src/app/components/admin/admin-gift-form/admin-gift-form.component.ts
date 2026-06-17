import { Component, InputSignal, OutputEmitterRef, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Gift } from '../../../models/gift.model';
import { GiftService } from '../../../services/gift.service';
import { EndpointsUrls } from '../../../constants/api-endpoints';
import { GIFT_CATEGORIES } from '../../../constants/gift-categories.constant';
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
  imports: [CommonModule, FormsModule],
})
export class AdminGiftFormComponent {
  public readonly editingGift: InputSignal<Gift | null> = input<Gift | null>(null);
  public readonly cancel: OutputEmitterRef<void> = output<void>();

  public readonly categories: typeof GIFT_CATEGORIES = GIFT_CATEGORIES;
  public giftForm: Partial<Gift> = {};
  public enrichUrl: string = '';
  public enriching: boolean = false;
  public enrichError: string = '';

  public constructor(
    public readonly giftService: GiftService,
    public readonly http: HttpClient,
    public readonly endpoints: EndpointsUrls,
  ) {
    effect((): void => {
      const gift: Gift | null = this.editingGift();

      if (gift) {
        this.giftForm = {
          ...gift,
          allowPartialContribution: gift.allowPartialContribution ?? true,
        };

        this.enrichUrl = '';
        this.enrichError = '';
        this.giftService.clearAdminGiftError();
        this.giftService.resetAdminGiftSaved();
        return;
      }

      this.giftForm = { category: GIFT_CATEGORIES[0].id, raised: 0, allowPartialContribution: true };
      this.enrichUrl = '';
      this.enrichError = '';
      this.giftService.clearAdminGiftError();
      this.giftService.resetAdminGiftSaved();
    });
  }

  public enrichFromLink(): void {
    if (!this.enrichUrl.trim())
      return;

    this.enriching = true;
    this.enrichError = '';

    this.http.post<GiftEnrichResponse>(this.endpoints.adminGiftsEnrich, { url: this.enrichUrl }).subscribe({
      next: (data: GiftEnrichResponse): void => {
        this.enriching = false;
        if (data.name) this.giftForm = { ...this.giftForm, name: data.name };
        if (data.description) this.giftForm = { ...this.giftForm, description: data.description };
        if (data.price) this.giftForm = { ...this.giftForm, total: data.price };
        if (data.imageUrl) this.giftForm = { ...this.giftForm, image: data.imageUrl };
      },
      error: (err: HttpErrorResponse): void => {
        this.enriching = false;
        this.enrichError = HttpErrorUtil.extract(err, 'Não foi possível obter os dados do link.');
      },
    });
  }

  public save(): void {
    const giftId: string | null = this.editingGift() ? this.editingGift()!.id : null;
    this.giftService.saveAdminGift(giftId, this.giftForm);
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

    const previousImage = this.giftForm.image ?? '';
    this.giftForm = { ...this.giftForm, image: URL.createObjectURL(file) };

    this.giftService.uploadGiftImage(
      file,
      (url: string): void => { this.giftForm = { ...this.giftForm, image: url }; },
      (): void => { this.giftForm = { ...this.giftForm, image: previousImage }; },
    );
  }
}
