export interface Gift {
  id: string;
  image: string;
  name: string;
  price: number;
  raised: number;
  total: number;
  fullyFunded: boolean;
  description?: string;
  available: boolean;
  allowPartialContribution: boolean;
}
