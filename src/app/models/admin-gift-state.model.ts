import { Gift } from './gift.model';

export interface AdminGiftState {
  gifts: Gift[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  giftsLoading: boolean;
  giftsError: string;
  giftSaving: boolean;
  giftError: string;
  giftSaved: boolean;
  imageUploading: boolean;
  imageUploadError: string;
}
