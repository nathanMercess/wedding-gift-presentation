import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SITE_SETTINGS } from '../../../constants/default-site-settings.constant';
import { GiftCategory } from '../../../enums/gift-category.enum';
import { GiftDisplayMode } from '../../../enums/gift-display-mode.enum';
import { CarouselPhoto, Couple } from '../../../models/couple.model';
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
  public readonly GiftDisplayMode: typeof GiftDisplayMode = GiftDisplayMode;
  public readonly GiftCategory: typeof GiftCategory = GiftCategory;

  public couple: Couple = { names: '', weddingDate: '', photoUrl: '', message: '', eventLocation: '', primaryColor: '#000000', secondaryColor: '#d9d9d9', giftDisplayMode: GiftDisplayMode.Traditional, carouselPhotos: [], siteSettings: { ...DEFAULT_SITE_SETTINGS, enabledCategories: [...DEFAULT_SITE_SETTINGS.enabledCategories] } };
  public readonly categoryOptions: GiftCategory[] = [...DEFAULT_SITE_SETTINGS.enabledCategories];
  public carouselUploading: boolean = false;
  public carouselUploadError: string = '';
  public isDraggingFiles: boolean = false;

  private coupleSignature: string = '';

  public constructor(public readonly coupleService: CoupleService, public readonly theme: ThemeService) {
    effect((): void => {
      const loaded: Couple = this.coupleService.state().couple;
      const signature: string = `${loaded.names}|${loaded.weddingDate}|${loaded.photoUrl}|${loaded.message}|${loaded.eventLocation}|${loaded.primaryColor}|${loaded.secondaryColor}|${loaded.giftDisplayMode}|${JSON.stringify(loaded.siteSettings)}`;

      if (this.coupleSignature === signature)
        return;

      this.coupleSignature = signature;
      const primaryColor: string = loaded.primaryColor || '#000000';

      // Formatar a data para garantir a compatibilidade com o <input type="datetime-local">
      let formattedDate = loaded.weddingDate || '';
      if (formattedDate) {
        const d = new Date(formattedDate);
        if (!isNaN(d.getTime())) {
          formattedDate = `${d.getFullYear()}-${this.padDatePart(d.getMonth() + 1)}-${this.padDatePart(d.getDate())}T${this.padDatePart(d.getHours())}:${this.padDatePart(d.getMinutes())}`;
        }
      }

      this.couple = {
        ...loaded,
        weddingDate: formattedDate, // Usa a data formatada
        primaryColor,
        secondaryColor: loaded.secondaryColor || ColorUtil.lighten(primaryColor, 0.85),
        giftDisplayMode: loaded.giftDisplayMode || GiftDisplayMode.Traditional,
        carouselPhotos: loaded.carouselPhotos ?? [],
        siteSettings: loaded.siteSettings ?? { ...DEFAULT_SITE_SETTINGS, enabledCategories: [...DEFAULT_SITE_SETTINGS.enabledCategories] },
      };
    }, { allowSignalWrites: true });
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

    const previousPhoto = this.couple.photoUrl;
    this.couple = { ...this.couple, photoUrl: URL.createObjectURL(file) };

    this.coupleService.uploadCouplePhoto(
      file,
      (url: string): void => { this.couple = { ...this.couple, photoUrl: url }; },
      (): void => { this.couple = { ...this.couple, photoUrl: previousPhoto }; },
    );
  }

  public onCarouselPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.uploadCarouselFiles(files);
  }

  public onCarouselDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFiles = true;
  }

  public onCarouselDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFiles = false;
  }

  public onCarouselDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFiles = false;

    const files = Array.from(event.dataTransfer?.files ?? []).filter((file: File): boolean => file.type.startsWith('image/'));
    this.uploadCarouselFiles(files);
  }

  private uploadCarouselFiles(files: File[]): void {
    if (!files.length)
      return;

    this.carouselUploading = true;
    this.carouselUploadError = '';

    let remaining = files.length;

    files.forEach((file: File): void => {
      this.coupleService.uploadCouplePhoto(
        file,
        (url: string): void => {
          this.couple = { ...this.couple, carouselPhotos: [...(this.couple.carouselPhotos ?? []), { url, tag: '', title: '' }] };
          remaining--;
          if (remaining === 0) this.carouselUploading = false;
        },
        (): void => {
          this.carouselUploadError = 'Erro ao enviar uma ou mais fotos.';
          remaining--;
          if (remaining === 0) this.carouselUploading = false;
        },
      );
    });
  }

  public removeCarouselPhoto(index: number): void {
    const photos = [...(this.couple.carouselPhotos ?? [])];
    photos.splice(index, 1);
    this.couple = { ...this.couple, carouselPhotos: photos };
  }

  public moveCarouselPhoto(index: number, direction: number): void {
    const photos = [...(this.couple.carouselPhotos ?? [])];
    const target = index + direction;

    if (target < 0 || target >= photos.length)
      return;

    [photos[index], photos[target]] = [photos[target], photos[index]];
    this.couple = { ...this.couple, carouselPhotos: photos };
  }

  public save(): void {
    this.coupleService.saveCouple(this.couple);
  }

  public toggleCategory(category: GiftCategory): void {
    const enabledCategories: GiftCategory[] = this.couple.siteSettings.enabledCategories.includes(category)
      ? this.couple.siteSettings.enabledCategories.filter((item: GiftCategory): boolean => item !== category)
      : [...this.couple.siteSettings.enabledCategories, category];

    this.couple = {
      ...this.couple,
      siteSettings: {
        ...this.couple.siteSettings,
        enabledCategories,
      },
    };
  }

  public resetSiteSettings(): void {
    this.couple = { ...this.couple, siteSettings: { ...DEFAULT_SITE_SETTINGS, enabledCategories: [...DEFAULT_SITE_SETTINGS.enabledCategories] } };
  }

  public trackByCategory(_: number, category: GiftCategory): GiftCategory {
    return category;
  }

  private padDatePart(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
