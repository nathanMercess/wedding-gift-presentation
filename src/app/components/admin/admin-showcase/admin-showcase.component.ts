import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OutputEmitterRef, ViewChild, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShowcaseViewport } from '../../../enums/showcase-viewport.enum';
import { CoupleDraftService } from '../../../services/couple-draft.service';

@Component({
  standalone: true,
  selector: 'app-admin-showcase',
  templateUrl: './admin-showcase.component.html',
  styleUrl: './admin-showcase.component.scss',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShowcaseComponent {
  public readonly ShowcaseViewport: typeof ShowcaseViewport = ShowcaseViewport;
  public readonly editRequested: OutputEmitterRef<void> = output<void>();
  public activeViewport: ShowcaseViewport = ShowcaseViewport.Desktop;
  public hasDraft: boolean;

  @ViewChild('showcaseFrame') public showcaseFrame?: ElementRef<HTMLIFrameElement>;

  public constructor(public readonly draftService: CoupleDraftService) {
    this.hasDraft = this.draftService.exists();
  }

  public setViewport(viewport: ShowcaseViewport): void {
    this.activeViewport = viewport;
  }

  public refresh(): void {
    this.hasDraft = this.draftService.exists();
    const frame: HTMLIFrameElement | undefined = this.showcaseFrame?.nativeElement;

    if (!frame)
      return;

    frame.src = frame.src;
  }

  public edit(): void {
    this.editRequested.emit();
  }
}
