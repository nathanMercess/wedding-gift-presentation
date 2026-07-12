import { GiftDisplayMode } from '../enums/gift-display-mode.enum';

export interface CarouselPhoto {
  url: string;
  tag: string;
  title: string;
}

export interface Couple {
  names: string;
  weddingDate: string;
  photoUrl: string;
  message: string;
  eventLocation: string;
  primaryColor: string;
  secondaryColor: string;
  giftDisplayMode: GiftDisplayMode;
  carouselPhotos: CarouselPhoto[];
}
