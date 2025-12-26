import './styles/main.css';
import './styles/components/header.css';
import './styles/components/hero.css';
import './styles/components/categories.css';
import './styles/components/menu.css';
import './styles/components/cart.css';
import './styles/components/builder.css';
import './styles/components/checkout.css';
import './styles/components/toast.css';
import './styles/components/footer.css';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { MenuSection } from './components/MenuSection';
import { Cart } from './components/Cart';
import { PizzaBuilder } from './components/PizzaBuilder';
import { Checkout } from './components/Checkout';
import { Footer } from './components/Footer';

class App {
  private app: HTMLElement;

  constructor() {
    const appElement = document.getElementById('app');
    if (!appElement) {
      throw new Error('App element not found');
    }
    this.app = appElement;
  }

  init(): void {
    // Create main content wrapper
    const main = document.createElement('main');
    main.className = 'main-content';

    // Mount components
    const header = new Header();
    header.mount(this.app);

    const hero = new Hero();
    hero.mount(main);

    const categories = new Categories();
    categories.mount(main);

    const menuSection = new MenuSection();
    menuSection.mount(main);

    const footer = new Footer();
    footer.mount(main);

    // Append main to app
    this.app.appendChild(main);

    // Mount cart (fixed position, outside main flow)
    const cart = new Cart();
    cart.mount(this.app);

    // Mount pizza builder modal
    const pizzaBuilder = new PizzaBuilder();
    pizzaBuilder.mount(this.app);

    // Mount checkout modal
    const checkout = new Checkout();
    checkout.mount(this.app);

    // Add padding for fixed header
    main.style.paddingTop = 'var(--header-height)';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
