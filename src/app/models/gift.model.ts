export interface Gift {
  id: string;
  image: string;
  name: string;
  price: number;
  raised: number;
  total: number;
  description?: string;
  available: boolean;
  allowPartialContribution: boolean;
}
