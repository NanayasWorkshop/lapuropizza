# La Puro Pizza - Project Context

## Overview
Modern, minimalistic pizza ordering website for **lapuropizza.ch**

**Repository:** https://github.com/NanayasWorkshop/lapuropizza
**Live (when enabled):** https://nanayasworkshop.github.io/lapuropizza/
**Local dev:** http://localhost:5173/

## Tech Stack
- **Vite** + **TypeScript** + **Vanilla JS** (no framework)
- **CSS Variables** for theming
- **i18n** - German (default) + English
- **localStorage** for cart persistence
- **GitHub Pages** deployment (GitHub Actions workflow)

## Project Structure
```
lapuropizza/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .github/workflows/deploy.yml
├── public/
│   └── media/                  # Images + video from restaurant
└── src/
    ├── main.ts                 # Entry point
    ├── components/
    │   ├── Header.ts           # Nav, burger menu, lang toggle
    │   ├── Hero.ts             # Video background hero
    │   ├── Categories.ts       # Category grid
    │   ├── MenuSection.ts      # Menu items with filters
    │   ├── PizzaBuilder.ts     # Pizza customization modal
    │   ├── Cart.ts             # Slide-in cart sidebar
    │   ├── Checkout.ts         # Checkout form (Stripe dummy)
    │   ├── Footer.ts           # Contact, hours, Google Maps
    │   └── Toast.ts            # Toast notifications
    ├── styles/
    │   ├── main.css
    │   ├── variables.css       # Design tokens
    │   └── components/         # Component CSS files
    ├── data/
    │   └── menu.ts             # All menu items + toppings
    ├── store/
    │   └── cart.ts             # Cart state management
    ├── i18n/
    │   ├── index.ts
    │   ├── de.json
    │   └── en.json
    ├── types/
    │   └── index.ts            # TypeScript interfaces
    └── utils/
        └── dom.ts              # DOM helpers
```

## Design System
```css
--bg-primary: #1a1a1a;          /* Dark anthracite */
--bg-secondary: #252525;
--text-primary: #ffffff;
--text-secondary: #b0b0b0;
--accent-warm: #F6A869;          /* Orange accent */
--accent-red: #c45c4a;
```

## Completed Features
- [x] Single-page scroll with smooth navigation
- [x] Hero section with video background
- [x] Category grid with images
- [x] Menu section with category filters
- [x] Pizza builder (size, add/remove toppings, live pricing)
- [x] Cart sidebar with quantity controls
- [x] Checkout form (delivery/pickup, Stripe placeholder)
- [x] Toast notifications
- [x] i18n (DE/EN toggle)
- [x] Mobile responsive
- [x] MwSt legal notice
- [x] Google Maps embed
- [x] GitHub Actions deployment

## Current Limitation
**Frontend only** - no real backend. Orders are not actually processed.

## NEXT: Backend Implementation
Need to build a backend with:
1. **Order API** - Receive and store orders
2. **Database** - PostgreSQL or SQLite for orders/customers
3. **Stripe** - Real payment processing
4. **Email** - Order confirmation to customer
5. **Restaurant notification** - Alert when new order

### Suggested Stack
- Node.js + Express (or Fastify)
- PostgreSQL (or SQLite for simplicity)
- Stripe SDK
- Nodemailer or SendGrid for emails
- Simple admin page to view orders

## Commands
```bash
npm install     # Install dependencies
npm run dev     # Start dev server
npm run build   # Production build
```

## Restaurant Info
- **Name:** La Puro Pizza (previously "Im Guet")
- **Address:** Wydäckerring 148, 8047 Zürich
- **Phone:** 044 491 68 68
- **Hours:** Mo-Fr 10:30-22:00, Sa-So 11:00-22:00
- **Website:** https://lapuropizza.ch

## Related Files
- `C:\Users\Yuuki\Documents\website_lapuro\restaurant_menu.md` - Extracted menu data
- `C:\Users\Yuuki\Documents\website_lapuro\media\` - Original media files
