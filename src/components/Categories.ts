import { t, i18n } from '../i18n';
import { categories } from '../data/menu';
import { assetUrl } from '../utils/dom';
import type { Category } from '../types';

export class Categories {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'section categories';
    this.element.id = 'categories';
    this.render();
    i18n.subscribe(() => this.render());
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="container">
        <div class="section-title">
          <h2>${t('categories.title')}</h2>
          <p>${t('categories.subtitle')}</p>
        </div>

        <div class="categories-grid">
          ${categories
            .map(
              (cat) => `
            <button class="category-card" data-category="${cat.id}">
              <div class="category-image">
                <img src="${assetUrl(cat.image)}" alt="${i18n.language === 'de' ? cat.name : cat.nameEn}" loading="lazy" />
              </div>
              <span class="category-name">${t(`categories.${cat.id}`)}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const cards = this.element.querySelectorAll('.category-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const category = (card as HTMLElement).dataset.category as Category;
        this.selectCategory(category);
      });
    });
  }

  private selectCategory(category: Category): void {
    window.dispatchEvent(new CustomEvent('filter-menu', { detail: { category } }));

    // Scroll to menu section
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      const headerHeight = 70;
      const top = menuSection.offsetTop - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  mount(container: Element): void {
    container.appendChild(this.element);
  }
}
