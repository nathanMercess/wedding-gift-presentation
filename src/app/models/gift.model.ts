export interface Gift {
  id: string;
  image: string;
  name: string;
  price: number;
  raised: number;
  total: number;
  category: string;
  description?: string;
  available: boolean;
  allowPartialContribution: boolean;
}
