import { CommonModule } from '@angular/common';
import { Component, InputSignal, OnDestroy, OnInit, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
  imports: [CommonModule],
})
export class CountdownComponent implements OnInit, OnDestroy {
  public readonly targetDate: InputSignal<Date | string> = input.required<Date | string>();

  public days: number = 0;
  public hours: number = 0;
  public minutes: number = 0;
  public seconds: number = 0;

  private timer: number = 0;

  public ngOnInit(): void {
    this.calculateCountdown();

    this.timer = window.setInterval((): void => {
      this.calculateCountdown();
    }, 1000);
  }

  public ngOnDestroy(): void {
    this.clearTimer();
  }

  private calculateCountdown(): void {
    const targetTime: number = new Date(this.targetDate()).getTime();
    const now: number = new Date().getTime();
    const difference: number = targetTime - now;

    if (difference > 0) {
      this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return;
    }

    this.days = 0;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timer === 0)
      return;

    clearInterval(this.timer);
    this.timer = 0;
  }
}
