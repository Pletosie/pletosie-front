export type Variant = {
  id: string;
  color: string;
  hex: string;
  size: string;
  stock: number;
  price: number;
  image: string;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  material: string;
  care: string;
  price: number;
  image: string;
  published: boolean;
  videos?: string[];
  madeToOrder: boolean;
  variants: Variant[];
};
export type Line = {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  color: string;
  size: string;
  price: number;
  image: string;
};
export type User = { id: string; name: string; email: string; role: string };
export const money = (amount: number) =>
  new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
