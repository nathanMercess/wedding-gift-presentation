import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { GiftCardComponent } from '../gift-card/gift-card.component';
import { GiftDetailsModalComponent } from '../gift-details-modal/gift-details-modal.component';
import { Gift } from '../../models/gift.model';
import { Couple } from '../../models/couple.model';
import { GiftService } from '../../services/gift.service';
import { CoupleService } from '../../services/couple.service';

@Component({
  selector: 'app-guest-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, GiftCardComponent, GiftDetailsModalComponent],
  templateUrl: './guest-view.component.html',
  styleUrl: './guest-view.component.scss'
})
export class GuestViewComponent implements OnInit {
  searchTerm = '';
  selectedCategory = 'todos';
  showFilters = false;
  sortBy = 'name';
  selectedGift: Gift | null = null;

  allGifts: Gift[] = [];
  loading = false;
  error = '';

  couple: Couple = {
    names: '',
    weddingDate: '',
    photo: '',
    message: ''
  };

  quickCategories = [
    { id: 'todos', label: 'Todos' },
    { id: 'cozinha', label: 'Cozinha' },
    { id: 'eletro', label: 'Eletros' },
    { id: 'quarto', label: 'Quarto' },
    { id: 'banho', label: 'Banho' },
  ];

  constructor(private giftService: GiftService, private coupleService: CoupleService) {}

  ngOnInit(): void {
    this.loadCouple();
    this.loadGifts();
  }

  loadCouple(): void {
    this.coupleService.getCouple().subscribe({
      next: couple => this.couple = couple,
      error: () => {}
    });
  }

  loadGifts(): void {
    this.loading = true;
    this.error = '';
    this.giftService.getGifts().subscribe({
      next: gifts => {
        this.allGifts = gifts;
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar os presentes.';
        this.loading = false;
      }
    });
  }

  get categoriesWithCount() {
    return [
      { id: 'todos', label: 'Todos', count: this.allGifts.length },
      { id: 'cozinha', label: 'Cozinha', count: this.allGifts.filter(g => g.category === 'cozinha').length },
      { id: 'eletro', label: 'Eletrodomésticos', count: this.allGifts.filter(g => g.category === 'eletro').length },
      { id: 'quarto', label: 'Quarto', count: this.allGifts.filter(g => g.category === 'quarto').length },
      { id: 'banho', label: 'Banho', count: this.allGifts.filter(g => g.category === 'banho').length },
    ];
  }

  sortOptions = [
    { id: 'name', label: 'Nome (A-Z)' },
    { id: 'price-asc', label: 'Menor preço' },
    { id: 'price-desc', label: 'Maior preço' },
  ];

  get filteredGifts(): Gift[] {
    return this.allGifts
      .filter(g => {
        const matchCat = this.selectedCategory === 'todos' || g.category === this.selectedCategory;
        const matchSearch = !this.searchTerm || g.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (this.sortBy === 'price-asc') return a.price - b.price;
        if (this.sortBy === 'price-desc') return b.price - a.price;
        return a.name.localeCompare(b.name);
      });
  }

  get totalGifts(): number { return this.allGifts.length; }
  get completedGifts(): number { return this.allGifts.filter(g => g.raised >= g.total).length; }
  get totalRaised(): number { return this.allGifts.reduce((s, g) => s + g.raised, 0); }
  get totalGoal(): number { return this.allGifts.reduce((s, g) => s + g.total, 0); }
  get progressPercentage(): number { return this.totalGoal > 0 ? (this.totalRaised / this.totalGoal) * 100 : 0; }
}
