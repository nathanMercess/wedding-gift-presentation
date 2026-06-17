import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../../models/gift.model';
import { Couple } from '../../../models/couple.model';
import { GiftService } from '../../../services/gift.service';
import { CoupleService } from '../../../services/couple.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AdminTab } from '../../../enums/admin-tab.enum';
import { GIFT_CATEGORIES } from '../../../constants/gift-categories.constant';

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
})
export class AdminDashboardComponent implements OnInit {
  public readonly AdminTab: typeof AdminTab = AdminTab;
  public readonly categories: typeof GIFT_CATEGORIES = GIFT_CATEGORIES;

  public activeTab: AdminTab = AdminTab.Gifts;
  public couple: Couple = { names: '', weddingDate: '', photo: '', message: '' };
  public showGiftForm: boolean = false;
  public editingGift: Gift | null = null;
  public giftForm: Partial<Gift> = {};
  public giftPendingDeletion: Gift | null = null;

  public constructor(
    public readonly giftService: GiftService,
    public readonly coupleService: CoupleService,
    public readonly auth: AuthService
  ) {
    effect((): void => {
      if (this.giftService.adminState().giftSaved) {
        this.showGiftForm = false;
        this.editingGift = null;
        this.giftForm = {};
        this.giftService.resetAdminGiftSaved();
      }
    });

    effect((): void => {
      const loadedCouple: Couple = this.coupleService.state().couple;
      this.couple = { ...loadedCouple };
    });
  }

  public ngOnInit(): void {
    this.loadGifts();
    this.loadCouple();
  }

  public loadGifts(): void {
    this.giftService.loadAdminGifts();
  }

  public loadCouple(): void {
    this.coupleService.loadCouple();
  }

  public openNewGift(): void {
    this.editingGift = null;
    this.giftForm = { category: GIFT_CATEGORIES[0].id, raised: 0, allowPartialContribution: true };
    this.giftService.clearAdminGiftError();
    this.giftService.resetAdminGiftSaved();
    this.showGiftForm = true;
    this.scrollToGiftForm();
  }

  public openEditGift(gift: Gift): void {
    this.editingGift = gift;
    this.giftForm = { ...gift };
    this.giftService.clearAdminGiftError();
    this.giftService.resetAdminGiftSaved();
    this.showGiftForm = true;
    this.scrollToGiftForm();
  }

  private scrollToGiftForm(): void {
    setTimeout((): void => {
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  public cancelGiftForm(): void {
    this.showGiftForm = false;
    this.editingGift = null;
    this.giftForm = {};
    this.giftService.clearAdminGiftError();
  }

  public saveGift(): void {
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
      (url: string): void => {
        this.giftForm = { ...this.giftForm, image: url };
      },
      (): void => {
        this.giftForm = { ...this.giftForm, image: previousImage };
      }
    );
  }

  public requestDeleteGift(gift: Gift): void {
    this.giftPendingDeletion = gift;
  }

  public confirmDeleteGift(): void {
    if (this.giftPendingDeletion)
      this.giftService.deleteAdminGift(this.giftPendingDeletion.id);

    this.giftPendingDeletion = null;
  }

  public cancelDeleteGift(): void {
    this.giftPendingDeletion = null;
  }

  public saveCouple(): void {
    this.coupleService.saveCouple(this.couple);
  }

  public logout(): void {
    this.auth.logout();
  }

  public getProgressPercent(gift: Gift): number {
    if (gift.total <= 0)
      return 0;

    return Math.min((gift.raised / gift.total) * 100, 100);
  }
}
