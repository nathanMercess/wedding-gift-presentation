import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../../models/gift.model';
import { GiftService } from '../../../services/gift.service';
import { GIFT_CATEGORIES } from '../../../constants/gift-categories.constant';

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  standalone: true,
  selector: 'app-admin-gift-form',
  templateUrl: './admin-gift-form.component.html',
  imports: [CommonModule, FormsModule],
})
export class AdminGiftFormComponent implements OnChanges {
  @Input() public editingGift: Gift | null = null;
  @Output() public readonly cancel = new EventEmitter<void>();

  public readonly categories: typeof GIFT_CATEGORIES = GIFT_CATEGORIES;
  public giftForm: Partial<Gift> = {};

  public constructor(public readonly giftService: GiftService) {}

  public ngOnChanges(): void {
    if (this.editingGift) {
      this.giftForm = { ...this.editingGift };
    } else {
      this.giftForm = { category: GIFT_CATEGORIES[0].id, raised: 0, allowPartialContribution: true };
    }
    this.giftService.clearAdminGiftError();
    this.giftService.resetAdminGiftSaved();
  }

  public save(): void {
    const giftId: string | null = this.editingGift ? this.editingGift.id : null;
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
