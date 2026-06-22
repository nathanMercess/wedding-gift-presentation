import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit, OnDestroy {
  // Recebe a data do casamento (ex: '2027-05-15T15:00:00')
  @Input() targetDate!: Date | string; 

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  private timer: any;

  ngOnInit(): void {
    // Executa imediatamente para não ter um atraso de 1 segundo a aparecer no ecrã
    this.calculateCountdown(); 
    
    // Atualiza a cada segundo (1000ms)
    this.timer = setInterval(() => {
      this.calculateCountdown();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Limpa o temporizador quando o componente é destruído para evitar fugas de memória
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private calculateCountdown(): void {
    const targetTime = new Date(this.targetDate).getTime();
    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference > 0) {
      this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((difference % (1000 * 60)) / 1000);
    } else {
      // O casamento já chegou!
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      clearInterval(this.timer);
    }
  }
}