import { t, i18n } from '../i18n';
import { toppings } from '../data/menu';
import { cartStore } from '../store/cart';
import { formatPrice } from '../utils/dom';
import { toast } from './Toast';
import type { MenuItem, Topping } from '../types';

export class PizzaBuilder {
  private element: HTMLElement;
  private isOpen = false;
  private currentItem: MenuItem | null = null;
  private selectedSize: 'small' | 'large' = 'small';
  private addedToppings: Topping[] = [];
  private removedIngredients: string[] = [];
  private scrollPosition = 0;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'pizza-builder';
    this.render();

    i18n.subscribe(() => this.render());

    window.addEventListener('open-builder', ((e: CustomEvent) => {
      this.open(e.detail.item);
    }) as EventListener);
  }

  private calculateTotal(): number {
    if (!this.currentItem) return 0;

    const basePrice =
      this.selectedSize === 'small'
        ? this.currentItem.prices.small ?? 0
        : this.currentItem.prices.large ?? 0;

    const toppingsPrice = this.addedToppings.reduce((sum, t) => sum + t.price, 0);

    return basePrice + toppingsPrice;
  }

  private saveScrollPosition(): void {
    const body = this.element.querySelector('.builder-body');
    if (body) {
      this.scrollPosition = body.scrollTop;
    }
  }

  private restoreScrollPosition(): void {
    const body = this.element.querySelector('.builder-body');
    if (body) {
      body.scrollTop = this.scrollPosition;
    }
  }

  private render(): void {
    this.saveScrollPosition();

    if (!this.currentItem) {
      this.element.innerHTML = `
        <div class="builder-overlay ${this.isOpen ? 'open' : ''}"></div>
        <div class="builder-modal ${this.isOpen ? 'open' : ''}"></div>
      `;
      return;
    }

    const item = this.currentItem;
    const name = i18n.language === 'en' && item.nameEn ? item.nameEn : item.name;
    const total = this.calculateTotal();

    const toppingsByCategory = {
      cheese: toppings.filter((t) => t.category === 'cheese'),
      meat: toppings.filter((t) => t.category === 'meat'),
      vegetable: toppings.filter((t) => t.category === 'vegetable'),
    };

    this.element.innerHTML = `
      <div class="builder-overlay ${this.isOpen ? 'open' : ''}" data-close></div>
      <div class="builder-modal ${this.isOpen ? 'open' : ''}">
        <div class="builder-header">
          <h2>${t('builder.title')}</h2>
          <button class="builder-close" aria-label="${t('common.close')}" data-close>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="builder-body">
          <div class="builder-item-info">
            <h3>${name}</h3>
            ${item.ingredients ? `<p class="builder-ingredients">${item.ingredients.join(', ')}</p>` : ''}
          </div>

          <div class="builder-section">
            <h4>${t('builder.selectSize')}</h4>
            <div class="size-selector">
              <button class="size-btn ${this.selectedSize === 'small' ? 'active' : ''}" data-size="small">
                <span class="size-label">${t('menu.size.small')}</span>
                <span class="size-price">${formatPrice(item.prices.small ?? 0)}</span>
              </button>
              <button class="size-btn ${this.selectedSize === 'large' ? 'active' : ''}" data-size="large">
                <span class="size-label">${t('menu.size.large')}</span>
                <span class="size-price">${formatPrice(item.prices.large ?? 0)}</span>
              </button>
            </div>
          </div>

          ${
            item.ingredients && item.ingredients.length > 0
              ? `
          <div class="builder-section">
            <h4>${t('builder.removeIngredient')}</h4>
            <div class="ingredient-list">
              ${item.ingredients
                .map(
                  (ing) => `
                <label class="ingredient-item ${this.removedIngredients.includes(ing) ? 'removed' : ''}">
                  <input type="checkbox" ${this.removedIngredients.includes(ing) ? 'checked' : ''} data-remove-ingredient="${ing}" />
                  <span>${ing}</span>
                </label>
              `
                )
                .join('')}
            </div>
          </div>
          `
              : ''
          }

          <div class="builder-section">
            <h4>${t('builder.addTopping')}</h4>

            <div class="topping-category">
              <h5>Käse / Cheese</h5>
              <div class="topping-list">
                ${toppingsByCategory.cheese.map((t) => this.renderTopping(t)).join('')}
              </div>
            </div>

            <div class="topping-category">
              <h5>Fleisch / Meat</h5>
              <div class="topping-list">
                ${toppingsByCategory.meat.map((t) => this.renderTopping(t)).join('')}
              </div>
            </div>

            <div class="topping-category">
              <h5>Gemüse / Vegetables</h5>
              <div class="topping-list">
                ${toppingsByCategory.vegetable.map((t) => this.renderTopping(t)).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="builder-footer">
          <div class="builder-total">
            <span>${t('builder.total')}</span>
            <span class="total-price">${formatPrice(total)}</span>
          </div>
          <button class="btn btn-primary btn-lg builder-add-btn">
            ${t('builder.addToCart')}
          </button>
        </div>
      </div>
    `;

    this.attachEvents();

    // Restore scroll position after re-render
    requestAnimationFrame(() => this.restoreScrollPosition());
  }

  private renderTopping(topping: Topping): string {
    const name = i18n.language === 'en' && topping.nameEn ? topping.nameEn : topping.name;
    const isAdded = this.addedToppings.some((t) => t.id === topping.id);

    return `
      <button class="topping-btn ${isAdded ? 'active' : ''}" data-topping-id="${topping.id}">
        <span class="topping-name">${name}</span>
        <span class="topping-price">+${formatPrice(topping.price)}</span>
      </button>
    `;
  }

  private attachEvents(): void {
    // Close buttons
    const closeElements = this.element.querySelectorAll('[data-close]');
    closeElements.forEach((el) => {
      el.addEventListener('click', () => this.close());
    });

    // Size selector
    const sizeBtns = this.element.querySelectorAll('.size-btn');
    sizeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedSize = (btn as HTMLElement).dataset.size as 'small' | 'large';
        this.render();
      });
    });

    // Remove ingredients
    const ingredientCheckboxes = this.element.querySelectorAll('[data-remove-ingredient]');
    ingredientCheckboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        const ingredient = (cb as HTMLElement).dataset.removeIngredient!;
        if ((cb as HTMLInputElement).checked) {
          this.removedIngredients.push(ingredient);
        } else {
          this.removedIngredients = this.removedIngredients.filter((i) => i !== ingredient);
        }
        this.render();
      });
    });

    // Topping buttons
    const toppingBtns = this.element.querySelectorAll('.topping-btn');
    toppingBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const toppingId = (btn as HTMLElement).dataset.toppingId!;
        const topping = toppings.find((t) => t.id === toppingId);
        if (!topping) return;

        const existingIndex = this.addedToppings.findIndex((t) => t.id === toppingId);
        if (existingIndex >= 0) {
          this.addedToppings.splice(existingIndex, 1);
        } else {
          this.addedToppings.push(topping);
        }
        this.render();
      });
    });

    // Add to cart
    const addBtn = this.element.querySelector('.builder-add-btn');
    addBtn?.addEventListener('click', () => this.addToCart());

    // Close on Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  private addToCart(): void {
    if (!this.currentItem) return;

    cartStore.addItem(
      this.currentItem,
      this.selectedSize,
      this.addedToppings,
      this.removedIngredients
    );

    // Show toast notification
    const name = i18n.language === 'en' && this.currentItem.nameEn ? this.currentItem.nameEn : this.currentItem.name;
    toast.success(`${name} - ${t('toast.addedToCart')}`);

    this.close();

    // Open cart to show added item
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-cart'));
    }, 200);
  }

  open(item: MenuItem): void {
    this.currentItem = item;
    this.selectedSize = 'small';
    this.addedToppings = [];
    this.removedIngredients = [];
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
