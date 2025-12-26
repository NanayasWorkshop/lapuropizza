import type { Cart, CartItem, MenuItem, Topping } from '../types';

const CART_STORAGE_KEY = 'lapuropizza_cart';

class CartStore {
  private cart: Cart = { items: [], subtotal: 0 };
  private listeners: Set<(cart: Cart) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        this.cart = JSON.parse(saved);
        this.calculateSubtotal();
      }
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (e) {
      console.error('Failed to save cart to storage:', e);
    }
  }

  private calculateSubtotal(): void {
    this.cart.subtotal = this.cart.items.reduce(
      (sum, item) => sum + item.totalPrice * item.quantity,
      0
    );
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.cart));
  }

  getCart(): Cart {
    return { ...this.cart };
  }

  getItemCount(): number {
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  addItem(
    menuItem: MenuItem,
    size: 'small' | 'large' | 'regular',
    addedToppings: Topping[] = [],
    removedIngredients: string[] = []
  ): void {
    const basePrice =
      size === 'small'
        ? menuItem.prices.small
        : size === 'large'
          ? menuItem.prices.large
          : menuItem.prices.regular;

    if (basePrice === undefined) return;

    const toppingsPrice = addedToppings.reduce((sum, t) => sum + t.price, 0);
    const totalPrice = basePrice + toppingsPrice;

    const cartItem: CartItem = {
      id: this.generateId(),
      menuItem,
      size,
      quantity: 1,
      addedToppings,
      removedIngredients,
      totalPrice,
    };

    this.cart.items.push(cartItem);
    this.calculateSubtotal();
    this.saveToStorage();
    this.notifyListeners();
  }

  updateQuantity(itemId: string, quantity: number): void {
    const item = this.cart.items.find((i) => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
        this.calculateSubtotal();
        this.saveToStorage();
        this.notifyListeners();
      }
    }
  }

  removeItem(itemId: string): void {
    this.cart.items = this.cart.items.filter((i) => i.id !== itemId);
    this.calculateSubtotal();
    this.saveToStorage();
    this.notifyListeners();
  }

  clearCart(): void {
    this.cart = { items: [], subtotal: 0 };
    this.saveToStorage();
    this.notifyListeners();
  }

  subscribe(listener: (cart: Cart) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const cartStore = new CartStore();
