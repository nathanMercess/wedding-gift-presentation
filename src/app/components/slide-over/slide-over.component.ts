import { ChangeDetectionStrategy, Component, HostListener, InputSignal, OnDestroy, OnInit, OutputEmitterRef, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-slide-over',
  templateUrl: './slide-over.component.html',
  styleUrl: './slide-over.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideOverComponent implements OnInit, OnDestroy {
  public readonly title: InputSignal<string> = input<string>('');
  public readonly closed: OutputEmitterRef<void> = output<void>();

  public ngOnInit(): void {
    document.body.classList.add('modal-open');
  }

  public ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
  }

  @HostListener('document:keydown.escape')
  public onEscapePressed(): void {
    this.closed.emit();
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('slide-over-backdrop'))
      this.closed.emit();
  }

  public requestClose(): void {
    this.closed.emit();
  }
}
