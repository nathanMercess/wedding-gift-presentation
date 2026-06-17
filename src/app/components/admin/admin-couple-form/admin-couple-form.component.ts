import { Component, OnInit } from '@angular/core';
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
export class AdminCoupleFormComponent implements OnInit {
  public couple: Couple = { names: '', weddingDate: '', photo: '', message: '', primaryColor: '#C79A6D' };

  public constructor(public readonly coupleService: CoupleService) {}

  public ngOnInit(): void {
    const loaded = this.coupleService.state().couple;
    this.couple = { ...loaded };
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
