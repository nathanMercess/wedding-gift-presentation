import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { GiftCardComponent } from '../gift-card/gift-card.component';
import { TestimonialComponent } from '../testimonial/testimonial.component';
import { FeatureCardComponent } from '../feature-card/feature-card.component';
import { Gift } from '../../models/gift.model';
import { GiftService } from '../../services/gift.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, GiftCardComponent, TestimonialComponent, FeatureCardComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit {
  @Output() viewGuestList = new EventEmitter<void>();

  mobileMenuOpen = false;
  selectedCategory = 'todos';
  email = '';

  categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'cozinha', label: 'Cozinha' },
    { id: 'eletro', label: 'Eletrodomésticos' },
    { id: 'quarto', label: 'Quarto' },
    { id: 'banho', label: 'Banho' },
  ];

  howItWorks = [
    {
      title: '1. Crie sua lista',
      text: 'Escolha os presentes que você deseja receber em poucos cliques',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`
    },
    {
      title: '2. Compartilhe',
      text: 'Envie o link da sua lista para seus convidados por WhatsApp, e-mail ou redes sociais',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`
    },
    {
      title: '3. Receba os presentes',
      text: 'Acompanhe em tempo real e receba seus presentes no endereço desejado',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`
    }
  ];

  features = [
    {
      title: 'Pagamento seguro',
      description: 'Todas as transações são protegidas e criptografadas',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    },
    {
      title: 'Entrega direta',
      description: 'Os presentes chegam no endereço que você escolher',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    },
    {
      title: 'Notificações automáticas',
      description: 'Receba confirmação por e-mail a cada presente',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
    },
    {
      title: 'Personalização total',
      description: 'Customize sua lista com suas cores e estilo',
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    }
  ];

  testimonials = [
    {
      image: 'https://images.unsplash.com/photo-1765350226723-a96ab0705403?w=400',
      names: 'Ana & Pedro',
      date: 'Casamento em Março 2026',
      text: 'A plataforma tornou tudo muito mais fácil! Nossos convidados adoraram a praticidade de escolher os presentes online.'
    },
    {
      image: 'https://images.unsplash.com/photo-1775126964598-214ae9eaa060?w=400',
      names: 'Julia & Roberto',
      date: 'Casamento em Janeiro 2026',
      text: 'Recebemos exatamente o que queríamos e ainda conseguimos acompanhar tudo em tempo real. Recomendo demais!'
    },
    {
      image: 'https://images.unsplash.com/photo-1762848565064-cc6328d6dc53?w=400',
      names: 'Mariana & Lucas',
      date: 'Casamento em Dezembro 2025',
      text: 'A melhor decisão que tomamos foi usar a ListaPerfeita. Tudo foi muito organizado e seguro.'
    }
  ];

  previewGifts: Gift[] = [];

  constructor(private giftService: GiftService, private router: Router) {}

  ngOnInit(): void {
    this.giftService.getGifts().subscribe({
      next: gifts => this.previewGifts = gifts,
      error: () => {}
    });
  }

  get filteredGifts(): Gift[] {
    const gifts = this.selectedCategory === 'todos'
      ? this.previewGifts.slice(0, 6)
      : this.previewGifts.filter(g => g.category === this.selectedCategory);
    return gifts;
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    this.mobileMenuOpen = false;
  }

  onCreateList(): void {
    this.router.navigate(['/admin/login']);
  }
}
