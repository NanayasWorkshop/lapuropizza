import { t, i18n } from '../i18n';
import { cartStore } from '../store/cart';
import { scrollToSection, assetUrl } from '../utils/dom';
import { AddressPicker } from './AddressPicker';

export class Header {
  private element: HTMLElement;
  private isMenuOpen = false;
  private addressPicker: AddressPicker;

  constructor() {
    this.element = document.createElement('header');
    this.element.className = 'header';
    this.addressPicker = new AddressPicker();
    this.render();
    this.attachEvents();

    // Subscribe to cart updates
    cartStore.subscribe(() => this.updateCartCount());
    i18n.subscribe(() => this.render());
  }

  private render(): void {
    const cartCount = cartStore.getItemCount();

    this.element.innerHTML = `
      <div class="header-container">
        <a href="#" class="header-logo">
          <img src="${assetUrl('media/LaPuroLogoRaueWandHG-1-150x150.webp')}" alt="La Puro Pizza" />
        </a>

        <div class="header-address-wrapper"></div>

        <nav class="header-nav ${this.isMenuOpen ? 'open' : ''}">
          <div class="nav-links">
            <a href="#menu" class="nav-link" data-section="menu">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM12 8v8M8 12h8"/>
              </svg>
              ${t('nav.menu')}
            </a>
            <a href="#about" class="nav-link" data-section="about">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              ${t('nav.about')}
            </a>
            <a href="#contact" class="nav-link" data-section="contact">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              ${t('nav.contact')}
            </a>
          </div>
          <div class="nav-footer">
            <button class="nav-lang-toggle" aria-label="Toggle language">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              ${i18n.language === 'de' ? 'Deutsch' : 'English'}
            </button>
          </div>
        </nav>

        <div class="header-actions">
          <button class="lang-toggle" aria-label="Toggle language">
            ${i18n.language.toUpperCase()}
          </button>

          <button class="cart-btn" aria-label="${t('nav.cart')}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            ${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}
          </button>
        </div>

        <button class="burger-btn" aria-label="Menu" aria-expanded="${this.isMenuOpen}">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    `;

    // Mount address picker
    const addressWrapper = this.element.querySelector('.header-address-wrapper');
    if (addressWrapper) {
      addressWrapper.innerHTML = '';
      addressWrapper.appendChild(this.addressPicker.getElement());
    }

    this.attachEvents();
  }

  private attachEvents(): void {
    const burger = this.element.querySelector('.burger-btn');
    const langToggle = this.element.querySelector('.lang-toggle');
    const navLangToggle = this.element.querySelector('.nav-lang-toggle');
    const cartBtn = this.element.querySelector('.cart-btn');
    const navLinks = this.element.querySelectorAll('.nav-link');

    burger?.addEventListener('click', () => this.toggleMenu());
    langToggle?.addEventListener('click', () => i18n.toggleLanguage());
    navLangToggle?.addEventListener('click', () => {
      i18n.toggleLanguage();
      this.closeMenu();
    });
    cartBtn?.addEventListener('click', () => this.openCart());

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = (link as HTMLElement).dataset.section;
        if (section) {
          scrollToSection(section);
          this.closeMenu();
        }
      });
    });
  }

  private toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.render();
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  private closeMenu(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      this.render();
      document.body.style.overflow = '';
    }
  }

  private openCart(): void {
    window.dispatchEvent(new CustomEvent('open-cart'));
  }

  private updateCartCount(): void {
    const countEl = this.element.querySelector('.cart-count');
    const count = cartStore.getItemCount();

    if (countEl) {
      if (count > 0) {
        countEl.textContent = String(count);
      } else {
        countEl.remove();
      }
    } else if (count > 0) {
      const btn = this.element.querySelector('.cart-btn');
      const span = document.createElement('span');
      span.className = 'cart-count';
      span.textContent = String(count);
      btn?.appendChild(span);
    }
  }

  mount(container: Element): void {
    container.appendChild(this.element);
  }
}
