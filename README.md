# AURA SPARKLES — Premium E-Commerce Storefront

> **“Illuminate Your Moments.”**  
> Indian home-fragrance brand specialising in scented candles, botanical wax sachets, and thoughtful gifting.

---

## 🌟 Brand Identity & Visual Design System

- **Warm Ivory:** `#FAF7F2` (Backgrounds, spacious editorial canvas)
- **Soft Cream:** `#F2E9DF` (Card backings, subtle divisions)
- **Blush Pink:** `#E8C9C5` (Soft accents, badges, gift packaging)
- **Deep Plum:** `#452638` (Primary brand buttons, typography, headers)
- **Muted Gold:** `#B69A62` (Monogram, stars, fine sparkle accents)
- **Charcoal:** `#282522` (High-legibility editorial text)
- **Typography:** Cormorant Garamond / Playfair Display (editorial headings) & Manrope / Inter (clean sans-serif body)

---

## ✨ Features Implemented

### 1. Editorial Homepage
- **Rotating Luxury Announcement Bar:** Configurable offers, shipping thresholds, and gifting highlights.
- **Sticky Responsive Navigation:** Real AURA SPARKLES logo mark, navigation links, instant search toggle, wishlist counter, shopping bag drawer trigger, and mobile slide-out drawer.
- **Editorial Hero Section:** Realistic frosted glass candle jar photography in warm domestic ambiance with primary (`SHOP COLLECTION`) and secondary (`DISCOVER OUR STORY`) CTAs.
- **Shop by Fragrance:** 5 mood collections (*Floral & Romantic*, *Warm & Comforting*, *Fresh & Refreshing*, *Calm & Relaxing*, *Earthy & Woody*) with photographic tiles.
- **Bestsellers Grid:** 4-column responsive grid showcasing the introductory ₹199 100ml frosted glass candles (*Mysore Sandalwood*, *Velvet Vanilla*, *Blushing Damask Rose*, *Royal Mogra & Jasmine*).
- **Shop by Collection:** Curated merchandising banners for *The Everyday Collection*, *The Signature Fragrance Collection*, *The Gifting Collection*, and *The Home Fragrance Collection*.
- **Brand Story Section:** *“More Than a Fragrance. A Feeling.”* storytelling with authentic artisan philosophy.
- **Thoughtful Gifting Section:** *“A Little Something That Means a Lot.”* highlighting bespoke hampers and rigid keepsake packaging.
- **Why Choose AURA SPARKLES:** 4 pillars with icons (*Fragrances for Every Mood*, *Thoughtfully Designed*, *Beautifully Presented*, *Made for Everyday Moments*).
- **Customer Reviews & Community:** Verified buyer reviews display with an interactive customer submission form.
- **Instagram Showcase:** Editorial social media gallery (`@aurasparkles.in`) with `#AuraSparklesHome`.
- **Newsletter Subscription:** Working email validation with welcome discount code (`WELCOME50`).
- **Comprehensive Footer:** Quick links, policies, contact care, accepted Indian payment badges, and copyright.

### 2. Product Catalogue & Detail Pages (`/shop`, `/shop/[slug]`)
- **Full Catalog:** Search by name/scent, filter by Category or Fragrance Family, sort by Price (Low/High), Ratings, or New Arrivals.
- **Product Detail Experience:**
  - High-res image gallery with thumbnail switcher.
  - Scent Pyramid (Top, Heart, and Base notes).
  - Specifications: 100ml / 75g soy wax, 22–25h burn time, frosted glass jar, 100% natural soy wax.
  - Live stock indicators & quantity selector.
  - Indian Delivery PIN Code Checker (calculates delivery date, city, and courier partner).
  - Candle care & safety instructions tab.
  - Dynamic related product recommendations.

### 3. Shopping Cart & Genuine Indian Checkout (`/cart`, `/checkout`)
- **Interactive Slide-Over Cart Drawer (`CartDrawer`):** Real-time free delivery progress bar (Free Express Shipping on orders ₹499+).
- **Promo Coupon System:** Working codes:
  - `AURA10` — 10% off on orders above ₹299
  - `WELCOME50` — Flat ₹50 off on orders above ₹399
  - `FESTIVE15` — 15% off on orders above ₹599
- **Indian Address & Checkout Validation:**
  - Full Name, 10-digit mobile number, email
  - House/Street, Landmark, City, State dropdown, 6-digit PIN code auto-city detection
  - Payment Gateways: Online (Razorpay / UPI / NetBanking / Cards) & Cash on Delivery (COD)
- **Order Confirmation Page (`/order-success/[orderId]`):**
  - Celebratory confetti
  - Order ID, date, customer delivery address, payment method & status
  - 4-step fulfillment tracking timeline
  - Printable invoice summary.

### 4. Protected Store Admin Dashboard (`/admin`)
- **Passcode Protected:** Default passcode: `aura2026`
- **Live Metrics:** Verified Revenue, Total Orders, Active SKUs, Low Stock alerts.
- **Orders Management:** Search orders by ID/Customer/Phone, filter by status, update fulfillment status (*Confirmed*, *Processing*, *Shipped*, *Delivered*), and **Export to CSV**.
- **Catalog Management:** Edit pricing, MRP, stock count, in-stock status, and publish new candle variants directly without touching code.
- **Coupons Management:** View active promotional codes.

### 5. Essential Policy Pages
- `/story` — Brand philosophy & artisan craft
- `/contact` — Contact details, WhatsApp concierge, and event bulk enquiry form
- `/faq` — Candle care & safety guide and shipping questions
- `/shipping-policy` — Pan-India transit timelines & courier coverage
- `/refund-policy` — Transit damage replacements & refund terms
- `/privacy-policy` & `/terms` — Comprehensive legal protection

---

## 🚀 Running Locally

```bash
# Start production server (running on port 3001)
./node_modules/.bin/next start -p 3001

# Or start development mode
npm run dev -- -p 3001
```

Visit: **[http://localhost:3001](http://localhost:3001)**

---

## ⚙️ Environment Variables (`.env`)

See `.env.example` for details:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
ADMIN_PASSCODE=aura2026
```
*(When Razorpay keys are omitted, the store operates in fully functional verified development/test mode).*
