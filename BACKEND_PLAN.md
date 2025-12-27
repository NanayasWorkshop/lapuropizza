# La Puro Pizza - Backend Implementation Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SERVER                             │
│         (Node.js serves frontend + API together)             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           STATIC FRONTEND (Vite build)               │    │
│  │  Cart → Checkout → Address Picker → Payment          │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    API Routes                         │   │
│  │  POST /api/orders           - Create new order        │   │
│  │  GET  /api/orders/:id       - Get order status        │   │
│  │  POST /api/delivery/check   - Check delivery zone     │   │
│  │  POST /api/payments/stripe  - Create Stripe session   │   │
│  │  POST /api/webhooks/stripe  - Stripe webhook          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Stripe   │  │  Google  │  │  Email   │  │ Database │    │
│  │  SDK     │  │  Maps    │  │ Service  │  │  (SQLite │    │
│  │          │  │  API     │  │          │  │   /PG)   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Model

**Single server hosts everything (no GitHub Pages):**
- Express serves static frontend files (Vite build output)
- Same server handles API routes
- Single domain: `lapuropizza.ch` or `order.lapuropizza.ch`

```typescript
// Express serves frontend + API on same server
app.use('/api', apiRoutes);
app.use(express.static('public'));  // Vite build goes here
app.get('*', (req, res) => res.sendFile('public/index.html'));
```

## Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Runtime | Node.js 20+ | Modern JS, async/await, wide ecosystem |
| Framework | Express.js | Simple, well-documented, flexible |
| Database | SQLite (dev) / PostgreSQL (prod) | SQLite for simplicity, PG for scale |
| ORM | Prisma | Type-safe, migrations, easy queries |
| Payments | Stripe SDK | Industry standard, excellent docs |
| Payments | Twint API | Swiss payment method |
| Maps | Google Maps Platform | Address autocomplete + distance calculation |
| Email | Nodemailer + SMTP | Simple, works with any provider |
| Validation | Zod | TypeScript-first schema validation |
| Security | Helmet, CORS, rate-limit | Standard security middleware |

## Project Structure

```
lapuropizza-backend/
├── package.json
├── tsconfig.json
├── .env.example          # Template for environment variables
├── .env                  # Actual secrets (gitignored)
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── src/
│   ├── index.ts          # Entry point
│   ├── config/
│   │   └── env.ts        # Environment validation
│   ├── routes/
│   │   ├── orders.ts         # Order endpoints
│   │   ├── delivery.ts       # Delivery zone check
│   │   ├── payments.ts       # Payment endpoints
│   │   └── webhooks.ts       # Payment webhooks
│   ├── services/
│   │   ├── order.service.ts
│   │   ├── stripe.service.ts
│   │   ├── twint.service.ts
│   │   ├── email.service.ts
│   │   ├── delivery.service.ts  # Google Maps distance calc
│   │   └── receipt.service.ts
│   ├── models/
│   │   └── types.ts      # Shared types
│   ├── middleware/
│   │   ├── auth.ts       # API key validation
│   │   ├── error.ts      # Error handling
│   │   └── validate.ts   # Request validation
│   └── utils/
│       ├── logger.ts
│       └── helpers.ts
└── templates/
    └── receipt.html      # Email receipt template
```

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

model Customer {
  id        String   @id @default(cuid())
  phone     String   @unique  // Primary identifier
  name      String?
  email     String?
  address   String?
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     Int         @unique @default(autoincrement())

  // Customer info
  customer        Customer?   @relation(fields: [customerId], references: [id])
  customerId      String?
  customerName    String
  customerPhone   String
  customerEmail   String?

  // Delivery info
  deliveryType    String      // "delivery" | "pickup"
  deliveryAddress String?
  deliveryNotes   String?

  // Order details
  items           OrderItem[]
  subtotal        Float
  deliveryFee     Float       @default(0)
  total           Float

  // Payment
  paymentMethod   String      // "stripe" | "twint" | "cash"
  paymentStatus   String      @default("pending")  // pending, paid, failed, refunded
  paymentId       String?     // Stripe/Twint transaction ID

  // Status
  status          String      @default("pending")  // pending, confirmed, preparing, ready, delivered, cancelled

  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  paidAt          DateTime?
  completedAt     DateTime?
}

model OrderItem {
  id          String  @id @default(cuid())
  order       Order   @relation(fields: [orderId], references: [id])
  orderId     String

  menuItemId  String  // Reference to menu item
  name        String  // Snapshot of item name at order time
  size        String? // "small" | "large" | "regular"
  quantity    Int
  unitPrice   Float
  totalPrice  Float

  // Customizations (for pizzas)
  toppings    String? // JSON string of added toppings
  removed     String? // JSON string of removed ingredients
  notes       String?
}
```

## API Endpoints

### 1. Create Order
```
POST /api/orders
Content-Type: application/json

Request:
{
  "customer": {
    "name": "Max Müller",
    "phone": "+41791234567",
    "email": "max@example.com"
  },
  "deliveryType": "delivery",
  "deliveryAddress": "Bahnhofstrasse 1, 8001 Zürich",
  "deliveryNotes": "2. Stock, Klingel Müller",
  "items": [
    {
      "menuItemId": "pizza-margherita",
      "name": "Pizza Margherita",
      "size": "large",
      "quantity": 1,
      "unitPrice": 36,
      "toppings": ["extra-cheese", "mushrooms"],
      "removed": ["oregano"]
    }
  ],
  "paymentMethod": "stripe"
}

Response:
{
  "orderId": "clx1234567",
  "orderNumber": 42,
  "total": 39.50,
  "paymentUrl": "https://checkout.stripe.com/..."  // Redirect customer here
}
```

### 2. Get Order Status
```
GET /api/orders/:id

Response:
{
  "orderId": "clx1234567",
  "orderNumber": 42,
  "status": "preparing",
  "paymentStatus": "paid",
  "estimatedTime": "20-30 min"
}
```

### 3. Stripe Webhook
```
POST /api/webhooks/stripe
(Called by Stripe when payment completes)

- Verify webhook signature
- Update order paymentStatus to "paid"
- Send confirmation email
- Notify restaurant (future: trigger printer)
```

### 4. Delivery Zone Check
```
POST /api/delivery/check
Content-Type: application/json

Request (by placeId from autocomplete):
{ "placeId": "ChIJ..." }

Request (by coordinates from GPS):
{ "lat": 47.3947, "lng": 8.4897 }

Response (deliverable):
{
  "canDeliver": true,
  "address": "Bahnhofstrasse 1, 8001 Zürich",
  "distance": 3.2,           // km
  "zone": "zone1",
  "minimumOrder": 25,        // CHF
  "deliveryFee": 0,          // CHF
  "estimatedTime": "20-30 min",
  "message": "Kostenlose Lieferung ab CHF 25"
}

Response (outside delivery area):
{
  "canDeliver": false,
  "address": "Winterthur",
  "distance": 25.4,
  "message": "Leider liefern wir nicht in dieses Gebiet. Abholung ist möglich!"
}
```

## Google Maps & Delivery Zones

### Google APIs Used

| API | Purpose | Cost |
|-----|---------|------|
| **Places Autocomplete** | Address input with suggestions | ~$2.83 / 1000 req |
| **Distance Matrix** | Calculate driving distance | ~$5 / 1000 elements |
| **Geocoding (Reverse)** | GPS coords → address | ~$5 / 1000 requests |

### Frontend: Address Picker in Header

The header includes an address input field that:
1. Asks user to share GPS location (optional)
2. Shows Google Places autocomplete for typing
3. Displays delivery info (min order, fee, time)
4. Saves address for checkout pre-fill

```
┌─────────────────────────────────────────────────────────────┐
│  🍕 La Puro Pizza    [📍 Lieferadresse eingeben...    🔍]   │
│                      └─────────────────────────────────────┘│
│                      ↓ Autocomplete dropdown                │
│                      ┌─────────────────────────────────────┐│
│                      │ 📍 Bahnhofstrasse 1, Zürich         ││
│                      │ 📍 Bahnhofplatz 15, Zürich          ││
│                      │ 📍 Bahnhofquai 3, Zürich            ││
│                      └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

After address selected:
┌─────────────────────────────────────────────────────────────┐
│  🍕 La Puro Pizza    [📍 Bahnhofstr. 1, Zürich    ✓  ✕]    │
│                       ↓                                     │
│                      ┌─────────────────────────────────────┐│
│                      │ ✓ Lieferung möglich                 ││
│                      │ Mindestbestellung: CHF 25           ││
│                      │ Lieferzeit: 20-30 min               ││
│                      │ Kostenlose Lieferung!               ││
│                      └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Frontend: Address Picker Component
```typescript
// src/components/AddressPicker.ts

export class AddressPicker {
  private savedAddress: SavedAddress | null = null;

  constructor() {
    this.render();
    this.initAutocomplete();
    this.askForGPS();  // Prompt on first visit
  }

  // Ask browser for GPS location
  private async askForGPS(): Promise<void> {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Send to backend to get address + zone info
        const result = await this.checkDelivery({ lat: latitude, lng: longitude });
        if (result.canDeliver) {
          this.setAddress(result);
        }
      },
      (error) => {
        console.log('GPS not available, user can type address');
      }
    );
  }

  // Google Places Autocomplete
  private initAutocomplete(): void {
    const input = this.element.querySelector('.address-input') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'ch' },
      types: ['address']
    });

    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace();
      if (place.place_id) {
        const result = await this.checkDelivery({ placeId: place.place_id });
        this.setAddress(result);
      }
    });
  }

  // Call backend to check delivery zone
  private async checkDelivery(params: { placeId?: string; lat?: number; lng?: number }): Promise<DeliveryCheck> {
    const response = await fetch('/api/delivery/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return response.json();
  }

  // Save address and show info
  private setAddress(result: DeliveryCheck): void {
    this.savedAddress = {
      address: result.address,
      placeId: result.placeId,
      canDeliver: result.canDeliver,
      minimumOrder: result.minimumOrder,
      deliveryFee: result.deliveryFee,
      estimatedTime: result.estimatedTime
    };

    // Save to localStorage for persistence
    localStorage.setItem('deliveryAddress', JSON.stringify(this.savedAddress));

    // Dispatch event so checkout can use it
    window.dispatchEvent(new CustomEvent('address-changed', { detail: this.savedAddress }));

    this.renderDeliveryInfo(result);
  }

  // Get saved address for checkout pre-fill
  public getSavedAddress(): SavedAddress | null {
    return this.savedAddress;
  }
}
```

### Delivery Zone Configuration
```typescript
// src/config/delivery-zones.ts

export const RESTAURANT_LOCATION = {
  address: 'Wydäckerring 148, 8047 Zürich',
  lat: 47.3947,
  lng: 8.4897
};

export const DELIVERY_ZONES = [
  {
    id: 'zone1',
    name: 'Nahbereich',
    maxDistance: 3,      // km driving distance
    minimumOrder: 25,    // CHF
    deliveryFee: 0,      // Free
    estimatedTime: '20-30 min'
  },
  {
    id: 'zone2',
    name: 'Erweitert',
    maxDistance: 5,
    minimumOrder: 35,
    deliveryFee: 3,
    estimatedTime: '30-45 min'
  },
  {
    id: 'zone3',
    name: 'Aussenbereich',
    maxDistance: 8,
    minimumOrder: 50,
    deliveryFee: 5,
    estimatedTime: '40-55 min'
  }
];

export const MAX_DELIVERY_DISTANCE = 8; // Beyond this = no delivery
```

### Backend: Delivery Service
```typescript
// src/services/delivery.service.ts
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export async function checkDeliveryZone(
  params: { placeId?: string; lat?: number; lng?: number }
): Promise<DeliveryCheck> {

  let destination: string;
  let address: string;

  if (params.placeId) {
    destination = `place_id:${params.placeId}`;
    // Get address from place details
    const placeDetails = await mapsClient.placeDetails({
      params: { place_id: params.placeId, key: process.env.GOOGLE_MAPS_API_KEY! }
    });
    address = placeDetails.data.result.formatted_address || '';
  } else if (params.lat && params.lng) {
    destination = `${params.lat},${params.lng}`;
    // Reverse geocode to get address
    const geocode = await mapsClient.reverseGeocode({
      params: { latlng: { lat: params.lat, lng: params.lng }, key: process.env.GOOGLE_MAPS_API_KEY! }
    });
    address = geocode.data.results[0]?.formatted_address || '';
  } else {
    throw new Error('placeId or lat/lng required');
  }

  // Get driving distance
  const distanceMatrix = await mapsClient.distancematrix({
    params: {
      origins: [RESTAURANT_LOCATION.address],
      destinations: [destination],
      mode: 'driving',
      key: process.env.GOOGLE_MAPS_API_KEY!
    }
  });

  const element = distanceMatrix.data.rows[0].elements[0];
  if (element.status !== 'OK') {
    return { canDeliver: false, address, message: 'Adresse nicht gefunden' };
  }

  const distanceKm = element.distance.value / 1000;

  // Find matching zone
  const zone = DELIVERY_ZONES.find(z => distanceKm <= z.maxDistance);

  if (!zone) {
    return {
      canDeliver: false,
      address,
      distance: distanceKm,
      message: 'Leider liefern wir nicht in dieses Gebiet. Abholung ist möglich!'
    };
  }

  return {
    canDeliver: true,
    address,
    distance: distanceKm,
    zone: zone.id,
    minimumOrder: zone.minimumOrder,
    deliveryFee: zone.deliveryFee,
    estimatedTime: zone.estimatedTime,
    message: zone.deliveryFee === 0
      ? `Kostenlose Lieferung ab CHF ${zone.minimumOrder}`
      : `Liefergebühr CHF ${zone.deliveryFee}, Mindestbestellung CHF ${zone.minimumOrder}`
  };
}
```

### Checkout Pre-fill Flow
```
1. User browses site, enters address in header
2. Address saved to localStorage + state
3. User adds items to cart
4. User clicks checkout
5. Checkout form:
   - Address field auto-filled from saved address ✓
   - Minimum order validated against zone
   - Delivery fee added to total
   - If cart < minimumOrder → show warning, block checkout
```

### Environment Variables for Google Maps
```env
# Google Maps Platform (get from console.cloud.google.com)
GOOGLE_MAPS_API_KEY="AIza..."  # Backend - unrestricted or IP-restricted
GOOGLE_MAPS_PLACES_KEY="AIza..."  # Frontend - HTTP referrer restricted to domain
```

## Security Measures

### 1. API Key for Frontend
```typescript
// Frontend sends API key in header
headers: {
  'X-API-Key': 'lpz_live_xxx...'
}

// Backend validates
if (req.headers['x-api-key'] !== process.env.FRONTEND_API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 2. Environment Variables (Never in frontend!)
```env
# .env (gitignored)
DATABASE_URL="file:./dev.db"
FRONTEND_API_KEY="lpz_live_randomstring"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Only this goes to frontend

# Twint
TWINT_MERCHANT_ID="..."
TWINT_API_KEY="..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="lapuropizza@gmail.com"
SMTP_PASS="app-specific-password"
EMAIL_FROM="La Puro Pizza <bestellung@lapuropizza.ch>"
```

### 3. Receipt Verification
```typescript
// Receipt shows EXACTLY what was paid
// Generate receipt ONLY after payment webhook confirms

function generateReceipt(order: Order): Receipt {
  // Double-check payment status
  if (order.paymentStatus !== 'paid') {
    throw new Error('Cannot generate receipt for unpaid order');
  }

  // Use stored order data, NOT user input
  return {
    orderNumber: order.orderNumber,
    items: order.items,  // From DB, not request
    total: order.total,  // From DB, verified by Stripe
    paidAt: order.paidAt,
    paymentId: order.paymentId  // Stripe transaction ID for audit
  };
}
```

### 4. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,  // Max 10 orders per IP per window
  message: 'Too many orders, please try again later'
});

app.use('/api/orders', orderLimiter);
```

## Email Notifications

When payment is confirmed, TWO emails are sent:
1. **Customer confirmation** - Receipt with order details
2. **Restaurant notification** - Alert to owner with all order info

### 1. Customer Confirmation Email
```html
<!-- templates/customer-receipt.html -->
<h1>Bestellung bestätigt!</h1>
<p>Vielen Dank für Ihre Bestellung bei La Puro Pizza.</p>

<h2>Bestellnummer: #{{orderNumber}}</h2>

<table>
  {{#each items}}
  <tr>
    <td>{{quantity}}x {{name}} {{#if size}}({{size}}){{/if}}</td>
    <td>CHF {{totalPrice}}</td>
  </tr>
  {{/each}}
</table>

<p><strong>Total: CHF {{total}}</strong></p>
<p>Zahlungsmethode: {{paymentMethod}}</p>
<p>Transaktions-ID: {{paymentId}}</p>

{{#if deliveryAddress}}
<h3>Lieferadresse:</h3>
<p>{{deliveryAddress}}</p>
{{else}}
<h3>Abholung im Restaurant</h3>
<p>Wydäckerring 148, 8047 Zürich</p>
{{/if}}
```

### 2. Restaurant Owner Notification Email
```html
<!-- templates/restaurant-order.html -->
<h1>🍕 NEUE BESTELLUNG #{{orderNumber}}</h1>

<div style="background: #f5f5f5; padding: 15px; margin: 10px 0;">
  <h2>{{#if isDelivery}}🚗 LIEFERUNG{{else}}🏪 ABHOLUNG{{/if}}</h2>
  <p><strong>Kunde:</strong> {{customerName}}</p>
  <p><strong>Telefon:</strong> <a href="tel:{{customerPhone}}">{{customerPhone}}</a></p>
  {{#if deliveryAddress}}
  <p><strong>Adresse:</strong> {{deliveryAddress}}</p>
  {{/if}}
  {{#if deliveryNotes}}
  <p><strong>Notizen:</strong> {{deliveryNotes}}</p>
  {{/if}}
</div>

<h3>Bestellung:</h3>
<table border="1" cellpadding="8" style="border-collapse: collapse;">
  <tr style="background: #333; color: white;">
    <th>Menge</th>
    <th>Artikel</th>
    <th>Extras</th>
    <th>Preis</th>
  </tr>
  {{#each items}}
  <tr>
    <td>{{quantity}}x</td>
    <td>{{name}} {{#if size}}({{size}}){{/if}}</td>
    <td>
      {{#if toppings}}+ {{toppings}}{{/if}}
      {{#if removed}}<br>- {{removed}}{{/if}}
      {{#if notes}}<br><em>{{notes}}</em>{{/if}}
    </td>
    <td>CHF {{totalPrice}}</td>
  </tr>
  {{/each}}
</table>

<h2 style="color: green;">TOTAL: CHF {{total}}</h2>
<p>Bezahlt mit: {{paymentMethod}} ✓</p>
<p>Zahlungs-ID: {{paymentId}}</p>
<p>Zeitpunkt: {{orderTime}}</p>
```

### Email Service Code
```typescript
// src/services/email.service.ts

async function sendOrderEmails(order: Order): Promise<void> {
  // 1. Send customer receipt
  if (order.customerEmail) {
    await sendEmail({
      to: order.customerEmail,
      subject: `La Puro Pizza - Bestellung #${order.orderNumber} bestätigt`,
      template: 'customer-receipt',
      data: order
    });
  }

  // 2. Send restaurant notification (ALWAYS)
  await sendEmail({
    to: process.env.RESTAURANT_EMAIL,  // e.g., "bestellung@lapuropizza.ch"
    subject: `🍕 NEUE BESTELLUNG #${order.orderNumber} - ${order.deliveryType.toUpperCase()}`,
    template: 'restaurant-order',
    data: {
      ...order,
      isDelivery: order.deliveryType === 'delivery',
      orderTime: new Date().toLocaleString('de-CH')
    }
  });
}
```

### Environment Variables for Email
```env
# Restaurant notification
RESTAURANT_EMAIL="owner@lapuropizza.ch"  # Or multiple: "owner@...,staff@..."
```

## Development Setup

### 1. Local Development with ngrok
```bash
# Terminal 1: Start backend
cd lapuropizza-backend
npm run dev  # Runs on http://localhost:3000

# Terminal 2: Expose with ngrok
ngrok http 3000
# Gives you: https://abc123.ngrok.io

# Configure frontend to use ngrok URL
# In frontend .env or config:
VITE_API_URL=https://abc123.ngrok.io
```

### 2. Stripe Test Mode
```bash
# Use test keys from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Test card: 4242 4242 4242 4242
# Any future date, any CVC
```

## Implementation Phases

### Phase 1: Basic Setup (Foundation)
- [ ] Initialize Node.js + TypeScript project
- [ ] Set up Express with middleware (CORS, Helmet, body-parser)
- [ ] Configure Prisma with SQLite
- [ ] Create database schema
- [ ] Basic health check endpoint

### Phase 2: Order API
- [ ] POST /api/orders - Create order
- [ ] GET /api/orders/:id - Get order status
- [ ] Request validation with Zod
- [ ] Error handling middleware

### Phase 3: Stripe Integration
- [ ] Create Stripe checkout session
- [ ] Webhook endpoint for payment confirmation
- [ ] Update order status on payment
- [ ] Handle payment failures

### Phase 4: Email Service
- [ ] Set up Nodemailer
- [ ] Create receipt HTML template
- [ ] Send confirmation on successful payment
- [ ] Optional: Restaurant notification email

### Phase 5: Frontend Connection
- [ ] Update frontend Checkout.ts to call API
- [ ] Handle API responses and errors
- [ ] Redirect to Stripe checkout
- [ ] Order confirmation page

### Phase 6: Production Ready
- [ ] Migrate to PostgreSQL
- [ ] Deploy to hosting (Railway, Render, or VPS)
- [ ] Set up production Stripe keys
- [ ] Configure custom domain
- [ ] Set up monitoring/logging

### Phase 7: Future Enhancements
- [ ] Twint payment integration
- [ ] Receipt printer integration
- [ ] Admin dashboard
- [ ] Customer login/history
- [ ] Order tracking updates

## Hosting Options

| Provider | Cost | Pros | Cons |
|----------|------|------|------|
| Railway | ~$5/mo | Easy deploy, DB included | Usage-based billing |
| Render | Free tier | Simple, free tier | Sleep on inactivity |
| Fly.io | ~$5/mo | Global edge, fast | More complex |
| VPS (Hetzner) | €4/mo | Full control, cheap | Manual setup |
| Vercel | Free | Great DX | Serverless cold starts |

**Recommendation:** Start with Railway or Render for simplicity.

## Next Steps

1. Create new directory `lapuropizza-backend`
2. Initialize project with `npm init`
3. Install dependencies
4. Set up Prisma schema
5. Build first endpoint

Ready to start implementation?
