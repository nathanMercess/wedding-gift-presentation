import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../../models/gift.model';
import { Couple } from '../../../models/couple.model';
import { GiftService } from '../../../services/gift.service';
import { CoupleService } from '../../../services/couple.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  public activeTab: 'gifts' | 'couple' = 'gifts';
  public couple: Couple = { names: '', weddingDate: '', photo: '', message: '' };
  public showGiftForm: boolean = false;
  public editingGift: Gift | null = null;
  public giftForm: Partial<Gift> = {};
  public readonly categories: Array<{ id: string; label: string }> = [
    { id: 'cozinha', label: 'Cozinha' },
    { id: 'eletro', label: 'Eletrodomésticos' },
    { id: 'quarto', label: 'Quarto' },
    { id: 'banho', label: 'Banho' },
  ];

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
    this.giftForm = { category: 'cozinha', raised: 0 };
    this.giftService.clearAdminGiftError();
    this.giftService.resetAdminGiftSaved();
    this.showGiftForm = true;
  }

  public openEditGift(gift: Gift): void {
    this.editingGift = gift;
    this.giftForm = { ...gift };
    this.giftService.clearAdminGiftError();
    this.giftService.resetAdminGiftSaved();
    this.showGiftForm = true;
  }

  public cancelGiftForm(): void {
    this.showGiftForm = false;
    this.editingGift = null;
    this.giftForm = {};
    this.giftService.clearAdminGiftError();
  }

  public saveGift(): void {
    const giftId: number | null = this.editingGift ? this.editingGift.id : null;
    this.giftService.saveAdminGift(giftId, this.giftForm);
  }

  public deleteGift(id: number): void {
    if (!confirm('Tem certeza que deseja remover este presente?')) return;
    this.giftService.deleteAdminGift(id);
  }

  public saveCouple(): void {
    this.coupleService.saveCouple(this.couple);
  }

  public logout(): void {
    this.auth.logout();
  }

  public get gifts(): Gift[] {
    return this.giftService.adminState().gifts;
  }

  public get giftsLoading(): boolean {
    return this.giftService.adminState().giftsLoading;
  }

  public get giftsError(): string {
    return this.giftService.adminState().giftsError;
  }

  public get giftSaving(): boolean {
    return this.giftService.adminState().giftSaving;
  }

  public get giftError(): string {
    return this.giftService.adminState().giftError;
  }

  public get coupleLoading(): boolean {
    return this.coupleService.state().loading;
  }

  public get coupleSaving(): boolean {
    return this.coupleService.state().saving;
  }

  public get coupleSuccess(): boolean {
    return this.coupleService.state().success;
  }

  public get coupleError(): string {
    return this.coupleService.state().error;
  }

  public getProgressPercent(gift: Gift): number {
    if (gift.total <= 0) return 0;
    return Math.min((gift.raised / gift.total) * 100, 100);
  }
}
