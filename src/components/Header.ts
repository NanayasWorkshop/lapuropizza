import { t, i18n } from '../i18n';
import { cartStore } from '../store/cart';
import { scrollToSection } from '../utils/dom';

export class Header {
  private element: HTMLElement;
  private isMenuOpen = false;

  constructor() {
    this.element = document.createElement('header');
    this.element.className = 'header';
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
          <img src="/media/LaPuroLogoRaueWandHG-1-150x150.webp" alt="La Puro Pizza" />
        </a>

        <nav class="header-nav ${this.isMenuOpen ? 'open' : ''}">
          <a href="#menu" class="nav-link" data-section="menu">${t('nav.menu')}</a>
          <a href="#about" class="nav-link" data-section="about">${t('nav.about')}</a>
          <a href="#contact" class="nav-link" data-section="contact">${t('nav.contact')}</a>
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

          <button class="burger-btn" aria-label="Menu" aria-expanded="${this.isMenuOpen}">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const burger = this.element.querySelector('.burger-btn');
    const langToggle = this.element.querySelector('.lang-toggle');
    const cartBtn = this.element.querySelector('.cart-btn');
    const navLinks = this.element.querySelectorAll('.nav-link');

    burger?.addEventListener('click', () => this.toggleMenu());
    langToggle?.addEventListener('click', () => i18n.toggleLanguage());
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
