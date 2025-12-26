import { t, i18n } from '../i18n';
import { scrollToSection } from '../utils/dom';

export class Hero {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'hero';
    this.element.id = 'home';
    this.render();
    i18n.subscribe(() => this.render());
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="hero-video-container">
        <video
          class="hero-video"
          autoplay
          muted
          loop
          playsinline
          poster="/media/kat-pizza-300x300.webp"
        >
          <source src="/media/pizza-hg.mp4" type="video/mp4" />
        </video>
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <img
          src="/media/LaPuroLogoRaueWandHG-1-150x150.webp"
          alt="La Puro Pizza"
          class="hero-logo"
        />
        <h1 class="hero-title">${t('hero.tagline')}</h1>
        <p class="hero-subtitle">${t('hero.subtitle')}</p>
        <button class="btn btn-primary btn-lg hero-cta">
          ${t('hero.cta')}
        </button>
      </div>

      <div class="hero-scroll-indicator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const ctaBtn = this.element.querySelector('.hero-cta');
    const scrollIndicator = this.element.querySelector('.hero-scroll-indicator');

    ctaBtn?.addEventListener('click', () => scrollToSection('categories'));
    scrollIndicator?.addEventListener('click', () => scrollToSection('categories'));
  }

  mount(container: Element): void {
    container.appendChild(this.element);
  }
}
