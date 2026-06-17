import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Couple } from '../../../models/couple.model';
import { CoupleService } from '../../../services/couple.service';

@Component({
  standalone: true,
  selector: 'app-admin-couple-form',
  templateUrl: './admin-couple-form.component.html',
  styleUrl: './admin-couple-form.component.scss',
  imports: [CommonModule, FormsModule],
})
export class AdminCoupleFormComponent {
  public couple: Couple = { names: '', weddingDate: '', photo: '', message: '', primaryColor: '#C79A6D' };

  private coupleSignature: string = '';

  public constructor(public readonly coupleService: CoupleService) {
    effect((): void => {
      const loaded: Couple = this.coupleService.state().couple;
      const signature: string = `${loaded.names}|${loaded.weddingDate}|${loaded.photo}|${loaded.message}|${loaded.primaryColor}`;

      if (this.coupleSignature === signature)
        return;

      this.coupleSignature = signature;
      this.couple = { ...loaded, primaryColor: loaded.primaryColor || '#C79A6D' };
    });
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
