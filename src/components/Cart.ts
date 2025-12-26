import { t, i18n } from '../i18n';
import { cartStore } from '../store/cart';
import { formatPrice } from '../utils/dom';
import type { Cart as CartType } from '../types';

export class Cart {
  private element: HTMLElement;
  private isOpen = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'cart-sidebar';
    this.render();

    cartStore.subscribe(() => this.render());
    i18n.subscribe(() => this.render());

    window.addEventListener('open-cart', () => this.open());
  }

  private render(): void {
    const cart = cartStore.getCart();

    this.element.innerHTML = `
      <div class="cart-overlay ${this.isOpen ? 'open' : ''}" data-close></div>
      <div class="cart-panel ${this.isOpen ? 'open' : ''}">
        <div class="cart-header">
          <h2>${t('cart.title')}</h2>
          <button class="cart-close" aria-label="${t('common.close')}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="cart-body">
          ${cart.items.length === 0 ? this.renderEmptyCart() : this.renderCartItems(cart)}
        </div>

        ${cart.items.length > 0 ? this.renderCartFooter(cart) : ''}
      </div>
    `;

    this.attachEvents();
  }

  private renderEmptyCart(): string {
    return `
      <div class="cart-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>${t('cart.empty')}</p>
        <button class="btn btn-outline" data-close>
          ${t('cart.continueShopping')}
        </button>
      </div>
    `;
  }

  private renderCartItems(cart: CartType): string {
    return `
      <div class="cart-items">
        ${cart.items
          .map(
            (item) => `
          <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-info">
              <h4 class="cart-item-name">
                ${i18n.language === 'en' && item.menuItem.nameEn ? item.menuItem.nameEn : item.menuItem.name}
              </h4>
              ${item.size !== 'regular' ? `<span class="cart-item-size">${t(`menu.size.${item.size}`)}</span>` : ''}
              ${
                item.addedToppings.length > 0
                  ? `<span class="cart-item-extras">+ ${item.addedToppings.map((t) => (i18n.language === 'en' && t.nameEn ? t.nameEn : t.name)).join(', ')}</span>`
                  : ''
              }
            </div>

            <div class="cart-item-controls">
              <div class="quantity-control">
                <button class="qty-btn" data-action="decrease" data-item-id="${item.id}">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" data-action="increase" data-item-id="${item.id}">+</button>
              </div>

              <span class="cart-item-price">${formatPrice(item.totalPrice * item.quantity)}</span>

              <button class="cart-item-remove" data-item-id="${item.id}" aria-label="${t('cart.remove')}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private renderCartFooter(cart: CartType): string {
    return `
      <div class="cart-footer">
        <div class="cart-totals">
          <div class="cart-total-row">
            <span>${t('cart.subtotal')}</span>
            <span>${formatPrice(cart.subtotal)}</span>
          </div>
        </div>

        <button class="btn btn-primary btn-lg cart-checkout">
          ${t('cart.checkout')}
        </button>
      </div>
    `;
  }

  private attachEvents(): void {
    // Close buttons
    const closeElements = this.element.querySelectorAll('[data-close], .cart-close');
    closeElements.forEach((el) => {
      el.addEventListener('click', () => this.close());
    });

    // Quantity controls
    const qtyBtns = this.element.querySelectorAll('.qty-btn');
    qtyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = (btn as HTMLElement).dataset.itemId!;
        const action = (btn as HTMLElement).dataset.action;
        const cart = cartStore.getCart();
        const item = cart.items.find((i) => i.id === itemId);

        if (item) {
          const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
          cartStore.updateQuantity(itemId, newQty);
        }
      });
    });

    // Remove buttons
    const removeBtns = this.element.querySelectorAll('.cart-item-remove');
    removeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = (btn as HTMLElement).dataset.itemId!;
        cartStore.removeItem(itemId);
      });
    });

    // Checkout button
    const checkoutBtn = this.element.querySelector('.cart-checkout');
    checkoutBtn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-checkout'));
      this.close();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(): void {
    this.isOpen = true;
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
