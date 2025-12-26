export type Category =
  | 'pizza'
  | 'pasta'
  | 'salat'
  | 'schiacciatine'
  | 'spezialitaeten'
  | 'snacks'
  | 'drinks'
  | 'desserts'
  | 'mittagsmenu'
  | 'pide'
  | 'tellergerichte';

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  category: Category;
  prices: {
    small?: number;
    large?: number;
    regular?: number;
  };
  image?: string;
  customizable?: boolean;
  ingredients?: string[];
}

export interface Topping {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  category: 'meat' | 'cheese' | 'vegetable' | 'sauce' | 'other';
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  size: 'small' | 'large' | 'regular';
  quantity: number;
  addedToppings: Topping[];
  removedIngredients: string[];
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  notes?: string;
}

export interface Order {
  id: string;
  cart: Cart;
  customer: CustomerInfo;
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: 'card' | 'cash';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
}

export type Language = 'de' | 'en';

export interface CategoryInfo {
  id: Category;
  name: string;
  nameEn: string;
  image: string;
}
