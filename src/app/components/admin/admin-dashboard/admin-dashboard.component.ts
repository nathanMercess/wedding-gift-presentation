import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  activeTab: 'gifts' | 'couple' = 'gifts';

  gifts: Gift[] = [];
  giftsLoading = false;
  giftsError = '';

  couple: Couple = { names: '', weddingDate: '', photo: '', message: '' };
  coupleLoading = false;
  coupleSaving = false;
  coupleSuccess = false;
  coupleError = '';

  showGiftForm = false;
  editingGift: Gift | null = null;
  giftForm: Partial<Gift> = {};
  giftSaving = false;
  giftError = '';

  constructor(
    private giftService: GiftService,
    private coupleService: CoupleService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGifts();
    this.loadCouple();
  }

  loadGifts(): void {
    this.giftsLoading = true;
    this.giftsError = '';
    this.giftService.getAdminGifts().subscribe({
      next: gifts => { this.gifts = gifts; this.giftsLoading = false; },
      error: () => { this.giftsError = 'Erro ao carregar presentes.'; this.giftsLoading = false; }
    });
  }

  loadCouple(): void {
    this.coupleLoading = true;
    this.coupleService.getCouple().subscribe({
      next: couple => { this.couple = { ...couple }; this.coupleLoading = false; },
      error: () => { this.coupleLoading = false; }
    });
  }

  openNewGift(): void {
    this.editingGift = null;
    this.giftForm = { category: 'cozinha', raised: 0 };
    this.giftError = '';
    this.showGiftForm = true;
  }

  openEditGift(gift: Gift): void {
    this.editingGift = gift;
    this.giftForm = { ...gift };
    this.giftError = '';
    this.showGiftForm = true;
  }

  cancelGiftForm(): void {
    this.showGiftForm = false;
    this.editingGift = null;
    this.giftForm = {};
  }

  saveGift(): void {
    this.giftSaving = true;
    this.giftError = '';
    const obs = this.editingGift
      ? this.giftService.updateGift(this.editingGift.id, this.giftForm)
      : this.giftService.createGift(this.giftForm);

    obs.subscribe({
      next: () => { this.giftSaving = false; this.showGiftForm = false; this.loadGifts(); },
      error: () => { this.giftError = 'Erro ao salvar presente.'; this.giftSaving = false; }
    });
  }

  deleteGift(id: number): void {
    if (!confirm('Tem certeza que deseja remover este presente?')) return;
    this.giftService.deleteGift(id).subscribe({
      next: () => this.loadGifts(),
      error: () => alert('Erro ao remover presente.')
    });
  }

  saveCouple(): void {
    this.coupleSaving = true;
    this.coupleSuccess = false;
    this.coupleError = '';
    this.coupleService.updateCouple(this.couple).subscribe({
      next: () => { this.coupleSuccess = true; this.coupleSaving = false; },
      error: () => { this.coupleError = 'Erro ao salvar informações do casal.'; this.coupleSaving = false; }
    });
  }

  logout(): void {
    this.auth.logout();
  }

  getProgressPercent(gift: Gift): number {
    return Math.min((gift.raised / gift.total) * 100, 100);
  }

  categories = [
    { id: 'cozinha', label: 'Cozinha' },
    { id: 'eletro', label: 'Eletrodomésticos' },
    { id: 'quarto', label: 'Quarto' },
    { id: 'banho', label: 'Banho' },
  ];
}
