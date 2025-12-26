import { t, i18n } from '../i18n';
import { cartStore } from '../store/cart';
import { formatPrice } from '../utils/dom';

type DeliveryType = 'delivery' | 'pickup';
type PaymentMethod = 'card' | 'cash';

export class Checkout {
  private element: HTMLElement;
  private isOpen = false;
  private deliveryType: DeliveryType = 'delivery';
  private paymentMethod: PaymentMethod = 'card';
  private isProcessing = false;
  private orderComplete = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'checkout';
    this.render();

    i18n.subscribe(() => this.render());
    cartStore.subscribe(() => this.render());

    window.addEventListener('open-checkout', () => this.open());
  }

  private render(): void {
    const cart = cartStore.getCart();
    const deliveryFee = this.deliveryType === 'delivery' ? 5 : 0;
    const total = cart.subtotal + deliveryFee;

    this.element.innerHTML = `
      <div class="checkout-overlay ${this.isOpen ? 'open' : ''}" data-close></div>
      <div class="checkout-modal ${this.isOpen ? 'open' : ''}">
        ${this.orderComplete ? this.renderSuccess() : this.renderForm(cart, deliveryFee, total)}
      </div>
    `;

    this.attachEvents();
  }

  private renderSuccess(): string {
    return `
      <div class="checkout-success">
        <div class="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2>${t('checkout.orderSuccess')}</h2>
        <p>${t('checkout.orderConfirmed')}</p>
        <button class="btn btn-primary btn-lg" data-close>OK</button>
      </div>
    `;
  }

  private renderForm(cart: ReturnType<typeof cartStore.getCart>, deliveryFee: number, total: number): string {
    return `
      <div class="checkout-header">
        <h2>${t('checkout.title')}</h2>
        <button class="checkout-close" aria-label="${t('common.close')}" data-close>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="checkout-body">
        <div class="checkout-section">
          <div class="delivery-toggle">
            <button class="toggle-btn ${this.deliveryType === 'delivery' ? 'active' : ''}" data-delivery="delivery">
              ${t('checkout.delivery')}
            </button>
            <button class="toggle-btn ${this.deliveryType === 'pickup' ? 'active' : ''}" data-delivery="pickup">
              ${t('checkout.pickup')}
            </button>
          </div>
        </div>

        <div class="checkout-section">
          <h4>${t('checkout.customerInfo')}</h4>
          <form class="checkout-form" id="checkout-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name">${t('checkout.name')} *</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div class="form-group">
                <label for="phone">${t('checkout.phone')} *</label>
                <input type="tel" id="phone" name="phone" required />
              </div>
            </div>

            <div class="form-group">
              <label for="email">${t('checkout.email')}</label>
              <input type="email" id="email" name="email" />
            </div>

            ${this.deliveryType === 'delivery' ? `
            <div class="form-group">
              <label for="address">${t('checkout.address')} *</label>
              <input type="text" id="address" name="address" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="zip">${t('checkout.zip')} *</label>
                <input type="text" id="zip" name="zip" required />
              </div>
              <div class="form-group flex-2">
                <label for="city">${t('checkout.city')} *</label>
                <input type="text" id="city" name="city" value="Zürich" required />
              </div>
            </div>
            ` : ''}

            <div class="form-group">
              <label for="notes">${t('checkout.notes')}</label>
              <textarea id="notes" name="notes" rows="2"></textarea>
            </div>
          </form>
        </div>

        <div class="checkout-section">
          <h4>${t('checkout.payment')}</h4>
          <div class="payment-options">
            <button class="payment-btn ${this.paymentMethod === 'card' ? 'active' : ''}" data-payment="card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              ${t('checkout.payCard')}
            </button>
            <button class="payment-btn ${this.paymentMethod === 'cash' ? 'active' : ''}" data-payment="cash">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              ${t('checkout.payCash')}
            </button>
          </div>

          ${this.paymentMethod === 'card' ? `
          <div class="stripe-placeholder">
            <div class="stripe-card-mock">
              <div class="mock-input">
                <label>Card number</label>
                <input type="text" placeholder="4242 4242 4242 4242" disabled />
              </div>
              <div class="mock-row">
                <div class="mock-input">
                  <label>Expiry</label>
                  <input type="text" placeholder="MM/YY" disabled />
                </div>
                <div class="mock-input">
                  <label>CVC</label>
                  <input type="text" placeholder="123" disabled />
                </div>
              </div>
              <p class="stripe-note">Stripe integration (Demo mode)</p>
            </div>
          </div>
          ` : ''}
        </div>

        <div class="checkout-summary">
          <div class="summary-row">
            <span>${t('cart.subtotal')}</span>
            <span>${formatPrice(cart.subtotal)}</span>
          </div>
          ${this.deliveryType === 'delivery' ? `
          <div class="summary-row">
            <span>${t('cart.delivery')}</span>
            <span>${formatPrice(deliveryFee)}</span>
          </div>
          ` : ''}
          <div class="summary-row total">
            <span>${t('cart.total')}</span>
            <span>${formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div class="checkout-footer">
        <button class="btn btn-primary btn-lg checkout-submit" ${this.isProcessing ? 'disabled' : ''}>
          ${this.isProcessing ? t('common.loading') : t('checkout.placeOrder')}
        </button>
      </div>
    `;
  }

  private attachEvents(): void {
    // Close buttons
    const closeElements = this.element.querySelectorAll('[data-close]');
    closeElements.forEach((el) => {
      el.addEventListener('click', () => {
        if (this.orderComplete) {
          this.orderComplete = false;
        }
        this.close();
      });
    });

    // Delivery toggle
    const deliveryBtns = this.element.querySelectorAll('[data-delivery]');
    deliveryBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.deliveryType = (btn as HTMLElement).dataset.delivery as DeliveryType;
        this.render();
      });
    });

    // Payment toggle
    const paymentBtns = this.element.querySelectorAll('[data-payment]');
    paymentBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.paymentMethod = (btn as HTMLElement).dataset.payment as PaymentMethod;
        this.render();
      });
    });

    // Submit
    const submitBtn = this.element.querySelector('.checkout-submit');
    submitBtn?.addEventListener('click', () => this.handleSubmit());

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  private async handleSubmit(): Promise<void> {
    const form = this.element.querySelector('#checkout-form') as HTMLFormElement;
    if (!form?.checkValidity()) {
      form?.reportValidity();
      return;
    }

    this.isProcessing = true;
    this.render();

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear cart and show success
    cartStore.clearCart();
    this.isProcessing = false;
    this.orderComplete = true;
    this.render();
  }

  open(): void {
    this.isOpen = true;
    this.orderComplete = false;
    document.body.style.overflow = 'hidden';
    this.render();
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.render();
  }

  mount(container: Element): void {
    container.appendChild(this.element);
  }
}
