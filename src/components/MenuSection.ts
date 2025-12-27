import { t, i18n } from '../i18n';
import { menuItems, categories } from '../data/menu';
import { cartStore } from '../store/cart';
import { formatPrice } from '../utils/dom';
import { toast } from './Toast';
import type { MenuItem, Category } from '../types';

type ViewMode = 'grid' | 'list';

export class MenuSection {
  private element: HTMLElement;
  private activeCategory: Category | null = null;
  private viewMode: ViewMode = 'grid';

  constructor() {
    // Load saved view preference
    const savedView = localStorage.getItem('menuViewMode') as ViewMode;
    if (savedView === 'grid' || savedView === 'list') {
      this.viewMode = savedView;
    }
    this.element = document.createElement('section');
    this.element.className = 'section menu-section';
    this.element.id = 'menu';
    this.render();

    i18n.subscribe(() => this.render());
    window.addEventListener('filter-menu', ((e: CustomEvent) => {
      this.activeCategory = e.detail.category;
      this.render();
    }) as EventListener);
  }

  private getFilteredItems(): MenuItem[] {
    if (!this.activeCategory) return menuItems;
    return menuItems.filter((item) => item.category === this.activeCategory);
  }

  private render(): void {
    const items = this.getFilteredItems();

    this.element.innerHTML = `
      <div class="container">
        <div class="section-title">
          <h2>${t('menu.title')}</h2>
          <p>${t('menu.subtitle')}</p>
        </div>

        <div class="menu-toolbar">
          <div class="menu-filters">
            <button class="filter-btn ${!this.activeCategory ? 'active' : ''}" data-category="">
              Alle
            </button>
            ${categories
              .map(
                (cat) => `
              <button class="filter-btn ${this.activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
                ${t(`categories.${cat.id}`)}
              </button>
            `
              )
              .join('')}
          </div>
          <div class="view-toggle">
            <button class="view-toggle-btn ${this.viewMode === 'grid' ? 'active' : ''}" data-view="grid" aria-label="Grid view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button class="view-toggle-btn ${this.viewMode === 'list' ? 'active' : ''}" data-view="list" aria-label="List view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="menu-grid ${this.viewMode === 'list' ? 'menu-list' : ''}">
          ${items.map((item) => this.renderMenuItem(item)).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private renderMenuItem(item: MenuItem): string {
    const name = i18n.language === 'en' && item.nameEn ? item.nameEn : item.name;
    const description = i18n.language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;

    const hasSizes = item.prices.small !== undefined && item.prices.large !== undefined;
    const price = item.prices.regular ?? item.prices.small ?? 0;

    return `
      <div class="menu-card" data-item-id="${item.id}">
        <div class="menu-card-content">
          <h3 class="menu-card-title">${name}</h3>
          ${description ? `<p class="menu-card-desc">${description}</p>` : ''}
          ${item.ingredients ? `<p class="menu-card-ingredients">${item.ingredients.join(', ')}</p>` : ''}

          <div class="menu-card-footer">
            <div class="menu-card-price">
              ${hasSizes ? `${t('menu.from')} ` : ''}${formatPrice(price)}
            </div>

            <div class="menu-card-actions">
              ${
                item.customizable
                  ? `<button class="btn btn-outline btn-sm customize-btn" data-item-id="${item.id}">
                  ${t('menu.customize')}
                </button>`
                  : ''
              }
              <button class="btn btn-primary btn-sm add-btn" data-item-id="${item.id}">
                ${t('menu.addToCart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private attachEvents(): void {
    // View toggle buttons
    const viewBtns = this.element.querySelectorAll('.view-toggle-btn');
    viewBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = (btn as HTMLElement).dataset.view as ViewMode;
        if (view && view !== this.viewMode) {
          this.viewMode = view;
          localStorage.setItem('menuViewMode', view);
          this.render();
        }
      });
    });

    // Filter buttons
    const filterBtns = this.element.querySelectorAll('.filter-btn');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = (btn as HTMLElement).dataset.category as Category | '';
        this.activeCategory = category || null;
        this.render();
      });
    });

    // Add to cart buttons
    const addBtns = this.element.querySelectorAll('.add-btn');
    addBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = (btn as HTMLElement).dataset.itemId;
        const item = menuItems.find((i) => i.id === itemId);
        if (item) {
          this.quickAddToCart(item);
        }
      });
    });

    // Customize buttons
    const customizeBtns = this.element.querySelectorAll('.customize-btn');
    customizeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = (btn as HTMLElement).dataset.itemId;
        const item = menuItems.find((i) => i.id === itemId);
        if (item) {
          window.dispatchEvent(new CustomEvent('open-builder', { detail: { item } }));
        }
      });
    });
  }

  private quickAddToCart(item: MenuItem): void {
    const size = item.prices.regular !== undefined ? 'regular' : 'small';
    cartStore.addItem(item, size);

    // Show toast notification
    const name = i18n.language === 'en' && item.nameEn ? item.nameEn : item.name;
    toast.success(`${name} - ${t('toast.addedToCart')}`);

    // Show button feedback
    const btn = this.element.querySelector(`.add-btn[data-item-id="${item.id}"]`);
    if (btn) {
      btn.classList.add('added');
      btn.textContent = '✓';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = t('menu.addToCart');
      }, 1000);
    }
  }

  mount(container: Element): void {
    container.appendChild(this.element);
  }
}
