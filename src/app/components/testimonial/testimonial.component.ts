import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.scss'
})
export class TestimonialComponent {
  @Input() image: string = '';
  @Input() names: string = '';
  @Input() date: string = '';
  @Input() text: string = '';
  @Input() rating: number = 5;

  get starsArray(): number[] {
    return Array.from({ length: this.rating }, (_, i) => i);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400';
  }
}
