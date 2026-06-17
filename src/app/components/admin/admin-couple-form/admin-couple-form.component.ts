import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Couple } from '../../../models/couple.model';
import { CoupleService } from '../../../services/couple.service';
import { ThemeService } from '../../../services/theme.service';
import { ColorUtil } from '../../../utils/color.util';

@Component({
  standalone: true,
  selector: 'app-admin-couple-form',
  templateUrl: './admin-couple-form.component.html',
  styleUrl: './admin-couple-form.component.scss',
  imports: [CommonModule, FormsModule],
})
export class AdminCoupleFormComponent {
  public couple: Couple = { names: '', weddingDate: '', photo: '', message: '', primaryColor: '#C79A6D', secondaryColor: '#F7F0EA' };

  private coupleSignature: string = '';

  public constructor(public readonly coupleService: CoupleService, private readonly theme: ThemeService) {
    effect((): void => {
      const loaded: Couple = this.coupleService.state().couple;
      const signature: string = `${loaded.names}|${loaded.weddingDate}|${loaded.photo}|${loaded.message}|${loaded.primaryColor}|${loaded.secondaryColor}`;

      if (this.coupleSignature === signature)
        return;

      this.coupleSignature = signature;
      const primaryColor: string = loaded.primaryColor || '#C79A6D';
      this.couple = {
        ...loaded,
        primaryColor,
        secondaryColor: loaded.secondaryColor || ColorUtil.lighten(primaryColor, 0.85),
      };
    });
  }

  public suggestSecondaryFromPrimary(): void {
    this.couple = { ...this.couple, secondaryColor: ColorUtil.lighten(this.couple.primaryColor, 0.85) };
    this.previewTheme();
  }

  public previewTheme(): void {
    this.theme.apply(this.couple.primaryColor, this.couple.secondaryColor);
  }

  public onCouplePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file)
      return;

    const previousPhoto = this.couple.photo;
    this.couple = { ...this.couple, photo: URL.createObjectURL(file) };

    this.coupleService.uploadCouplePhoto(
      file,
      (url: string): void => { this.couple = { ...this.couple, photo: url }; },
      (): void => { this.couple = { ...this.couple, photo: previousPhoto }; },
    );
  }

  public save(): void {
    this.coupleService.saveCouple(this.couple);
  }
}
