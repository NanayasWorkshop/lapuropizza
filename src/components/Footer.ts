import { t, i18n } from '../i18n';
import { assetUrl } from '../utils/dom';

export class Footer {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('footer');
    this.element.className = 'footer';
    this.element.id = 'contact';
    this.render();
    i18n.subscribe(() => this.render());
  }

  private render(): void {
    const currentYear = new Date().getFullYear();

    this.element.innerHTML = `
      <div class="footer-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2702.5!2d8.4897!3d47.3947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47900a1c6b7a8b8d%3A0x0!2sWyd%C3%A4ckerring%20148%2C%208047%20Z%C3%BCrich!5e0!3m2!1sde!2sch!4v1703500000000"
          width="100%"
          height="300"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="La Puro Pizza Location"
        ></iframe>
      </div>

      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="${assetUrl('media/LaPuroLogoRaueWandHG-1-150x150.webp')}" alt="La Puro Pizza" class="footer-logo" />
            <p class="footer-tagline">${t('hero.tagline')}</p>
          </div>

          <div class="footer-section">
            <h4>${t('footer.hours')}</h4>
            <p>${t('footer.hoursWeekday')}</p>
            <p>${t('footer.hoursWeekend')}</p>
          </div>

          <div class="footer-section">
            <h4>${t('footer.contact')}</h4>
            <p>${t('footer.address')}</p>
            <p>
              <a href="tel:+41444916868">044 491 68 68</a>
            </p>
            <p>
              <a href="https://lapuropizza.ch" target="_blank" rel="noopener">lapuropizza.ch</a>
            </p>
          </div>

          <div class="footer-section">
            <h4>${t('footer.followUs')}</h4>
            <div class="footer-social">
              <a href="#" aria-label="Instagram" class="social-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" class="social-link">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="vat-notice">${t('footer.pricesIncludeVat')}</p>
          <p>&copy; ${currentYear} La Puro Pizza. ${t('footer.rights')}.</p>
        </div>
      </div>
    `;
  }

  mount(container: Element): void {
    container.appendChild(this.element);
  }
}
