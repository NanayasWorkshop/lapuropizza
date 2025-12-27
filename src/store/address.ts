export interface DeliveryAddress {
  address: string;
  placeId?: string;
  canDeliver: boolean;
  distance?: number;
  zone?: string;
  minimumOrder?: number;
  deliveryFee?: number;
  estimatedTime?: string;
  message?: string;
}

type Subscriber = () => void;

class AddressStore {
  private address: DeliveryAddress | null = null;
  private subscribers: Subscriber[] = [];

  constructor() {
    // Load from localStorage on init
    const saved = localStorage.getItem('deliveryAddress');
    if (saved) {
      try {
        this.address = JSON.parse(saved);
      } catch {
        this.address = null;
      }
    }
  }

  getAddress(): DeliveryAddress | null {
    return this.address;
  }

  setAddress(address: DeliveryAddress | null): void {
    this.address = address;
    if (address) {
      localStorage.setItem('deliveryAddress', JSON.stringify(address));
    } else {
      localStorage.removeItem('deliveryAddress');
    }
    this.notify();
  }

  clear(): void {
    this.setAddress(null);
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== fn);
    };
  }

  private notify(): void {
    this.subscribers.forEach((fn) => fn());
  }
}

export const addressStore = new AddressStore();
