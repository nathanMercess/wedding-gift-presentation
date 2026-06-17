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
  primaryColor: string;
  secondaryColor: string;
  carouselPhotos: CarouselPhoto[];
}
