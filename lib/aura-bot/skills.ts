export interface BotProductRecommendation {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  size?: string;
  highlight: string;
}

export interface BotQuickAction {
  label: string;
  action: string;
  payload?: string;
}

export interface BotMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  products?: BotProductRecommendation[];
  quickActions?: BotQuickAction[];
  timestamp: string;
}

// ─── Verified Featured Products Catalogue for Bot Skills ──────────────────────
export const BOT_CATALOGUE: Record<string, BotProductRecommendation> = {
  sandalwoodJar: {
    name: "Mysore Sandalwood Scented Candle",
    slug: "mysore-sandalwood-candle-80g",
    price: 249,
    originalPrice: 349,
    category: "Scented Candles",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    size: "80 ml Frosted Jar",
    highlight: "Warm sacred woody aroma · 20+ hr clean burn",
  },
  coffeeLatte: {
    name: "Iced Coffee Latte Candle",
    slug: "iced-coffee-latte-candle-200ml",
    price: 549,
    originalPrice: 699,
    category: "Scented Candles",
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80",
    size: "200 ml Glass Tumbler",
    highlight: "Roasted Arabica & whipped cream · 40+ hr burn",
  },
  vanillaJar: {
    name: "Madagascar Vanilla Scented Candle",
    slug: "vanilla-scented-candle-80g",
    price: 249,
    originalPrice: 349,
    category: "Scented Candles",
    image: "https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=600&q=80",
    size: "80 ml Frosted Jar",
    highlight: "Warm sweet comforting gourmand note · 20+ hr burn",
  },
  lavenderJar: {
    name: "French Lavender Scented Candle",
    slug: "lavender-scented-candle-80g",
    price: 249,
    originalPrice: 349,
    category: "Scented Candles",
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=600&q=80",
    size: "80 ml Frosted Jar",
    highlight: "Calming bedtime floral aroma · Soot-free soy wax",
  },
  roseJar: {
    name: "Damask Rose Scented Candle",
    slug: "rose-scented-candle-80g",
    price: 249,
    originalPrice: 349,
    category: "Scented Candles",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80",
    size: "80 ml Frosted Jar",
    highlight: "Dewy Kannauj floral notes · Elegant living room throw",
  },
  waxSachet: {
    name: "Botanical Perfumed Wax Sachets",
    slug: "perfumed-wax-sachets",
    price: 199,
    originalPrice: 249,
    category: "Wax Sachets",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
    size: "Flameless Wax Tablet",
    highlight: "Wardrobe & linen freshener · Fragrant for 60–90 days",
  },
  bubbleCandle: {
    name: "Sculptural Bubble Candle",
    slug: "bubble-candle-sculptural",
    price: 399,
    originalPrice: 499,
    category: "Decorative Candles",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    size: "Aesthetic Cube 150g",
    highlight: "Modern minimalist decor accent · Pure soy wax",
  },
  terracottaSet: {
    name: "Small Terracotta Scented Soy Candles (Set of 4)",
    slug: "small-terracotta-scented-candles-set-of-4",
    price: 200,
    originalPrice: 280,
    category: "Decorative Candles",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
    size: "Set of 4 Pots",
    highlight: "Traditional clay pots · Perfect for festive return gifts",
  },
  lotusHolder: {
    name: "Lotus Candle with Bowl Holder",
    slug: "lotus-candle-with-bowl-holder-80ml",
    price: 299,
    originalPrice: 399,
    category: "Decorative Candles",
    image: "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=600&q=80",
    size: "80 ml Cast Ceramic Bowl",
    highlight: "Artisan cast holder · Reusable for tea lights or jewelry",
  },
  vanillaTealights: {
    name: "Vanilla Scented Tea-Light Candles (Pack of 6)",
    slug: "vanilla-scented-tea-lights",
    price: 160,
    originalPrice: 220,
    category: "Tea-Light Candles",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    size: "Pack of 6",
    highlight: "3–4 hour burn per cup · Lead-free pure cotton wick",
  },
};

// ─── Initial Welcome Message & Core Skill Action Pills ─────────────────────────
export function getInitialWelcomeMessage(): BotMessage {
  return {
    id: "welcome-msg",
    sender: "bot",
    text: "Namaste! Welcome to Aura Sparkles. I am Aura, your personal fragrance concierge. How can I brighten your home today?",
    quickActions: [
      { label: "🕯️ Scent Matcher", action: "skill_scent_start" },
      { label: "🎁 Find a Gift", action: "skill_gift_start" },
      { label: "📦 Track My Order", action: "skill_track_order" },
      { label: "🌿 Candle Care Tips", action: "skill_care_tips" },
      { label: "🏢 Bulk & Weddings", action: "skill_bulk_gifting" },
      { label: "💬 WhatsApp Concierge", action: "skill_whatsapp_handoff" },
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Skill Response Dispatcher ────────────────────────────────────────────────
export function processChatbotAction(action: string, payload?: string): BotMessage {
  const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  switch (action) {
    // ─── SKILL 1: SCENT MATCHER ─────────────────────────────────────────────────
    case "skill_scent_start":
      return {
        id: `scent-step1-${Date.now()}`,
        sender: "bot",
        text: "Let's find your signature scent! Which space in your home are you looking to fragrance?",
        quickActions: [
          { label: "🛋️ Living Room", action: "skill_scent_room", payload: "living" },
          { label: "🛏️ Bedroom / Sleep", action: "skill_scent_room", payload: "bedroom" },
          { label: "💼 Work Desk / Study", action: "skill_scent_room", payload: "study" },
          { label: "👗 Wardrobe & Closets", action: "skill_scent_room", payload: "wardrobe" },
          { label: "🪔 Mandir / Spiritual", action: "skill_scent_room", payload: "mandir" },
        ],
        timestamp: ts,
      };

    case "skill_scent_room":
      if (payload === "living") {
        return {
          id: `scent-res-${Date.now()}`,
          sender: "bot",
          text: "For living rooms with steady airflow, deeper scents with a rich, welcoming throw work best. Here are our top atelier picks:",
          products: [BOT_CATALOGUE.sandalwoodJar, BOT_CATALOGUE.roseJar, BOT_CATALOGUE.bubbleCandle],
          quickActions: [
            { label: "☕ Looking for Coffee?", action: "query_coffee" },
            { label: "🎁 Explore Gift Sets", action: "skill_gift_start" },
            { label: "💬 Ask Human Team", action: "skill_whatsapp_handoff" },
          ],
          timestamp: ts,
        };
      }
      if (payload === "bedroom") {
        return {
          id: `scent-res-${Date.now()}`,
          sender: "bot",
          text: "For intimate spaces like bedrooms, soft florals and warm comforting notes help you unwind without overwhelming the room:",
          products: [BOT_CATALOGUE.lavenderJar, BOT_CATALOGUE.vanillaJar, BOT_CATALOGUE.lotusHolder],
          quickActions: [
            { label: "🌿 Wax Sachets for Drawers", action: "skill_scent_room", payload: "wardrobe" },
            { label: "🕯️ Try Another Room", action: "skill_scent_start" },
          ],
          timestamp: ts,
        };
      }
      if (payload === "study") {
        return {
          id: `scent-res-${Date.now()}`,
          sender: "bot",
          text: "For work desks and morning focus, invigorating gourmand and crisp citrus aromas cut through sluggish air:",
          products: [BOT_CATALOGUE.coffeeLatte, BOT_CATALOGUE.vanillaTealights],
          quickActions: [
            { label: "🛋️ Living Room Scents", action: "skill_scent_room", payload: "living" },
            { label: "🕯️ Main Menu", action: "menu_reset" },
          ],
          timestamp: ts,
        };
      }
      if (payload === "wardrobe") {
        return {
          id: `scent-res-${Date.now()}`,
          sender: "bot",
          text: "Our botanical wax sachets are formulated specifically for enclosed closets, drawers, and luggage—providing flameless fragrance for 60 to 90 days:",
          products: [BOT_CATALOGUE.waxSachet],
          quickActions: [
            { label: "🌿 How to Care for Sachets?", action: "skill_care_sachet" },
            { label: "🎁 Gift Sets", action: "skill_gift_start" },
          ],
          timestamp: ts,
        };
      }
      if (payload === "mandir") {
        return {
          id: `scent-res-${Date.now()}`,
          sender: "bot",
          text: "For prayer corners and sacred rituals, our pure soy candles with Mysore Sandalwood and traditional terracotta holders bring divine tranquility:",
          products: [BOT_CATALOGUE.sandalwoodJar, BOT_CATALOGUE.lotusHolder, BOT_CATALOGUE.terracottaSet],
          quickActions: [
            { label: "🕯️ Browse All Candles", action: "nav_shop_candles" },
            { label: "💬 Chat on WhatsApp", action: "skill_whatsapp_handoff" },
          ],
          timestamp: ts,
        };
      }
      break;

    // ─── SKILL 2: GIFT FINDER CONCIERGE ─────────────────────────────────────────
    case "skill_gift_start":
      return {
        id: `gift-step1-${Date.now()}`,
        sender: "bot",
        text: "Every Aura Sparkles gift comes packed with a rigid keepsake box, satin ribbon, and an optional handwritten note! What is your budget?",
        quickActions: [
          { label: "✨ Under ₹300 (Pocket Luxury)", action: "skill_gift_budget", payload: "under300" },
          { label: "✨ ₹300 – ₹600 (Most Popular)", action: "skill_gift_budget", payload: "mid" },
          { label: "✨ ₹1000+ (Grand Celebrations)", action: "skill_gift_budget", payload: "luxury" },
          { label: "💍 Wedding Return Favors", action: "skill_gift_budget", payload: "wedding" },
        ],
        timestamp: ts,
      };

    case "skill_gift_budget":
      if (payload === "under300") {
        return {
          id: `gift-res-${Date.now()}`,
          sender: "bot",
          text: "Handcrafted luxury doesn't have to be expensive! Here are our favorite thoughtful gifts under ₹300:",
          products: [BOT_CATALOGUE.sandalwoodJar, BOT_CATALOGUE.waxSachet, BOT_CATALOGUE.terracottaSet],
          quickActions: [
            { label: "✨ Check ₹300 – ₹600", action: "skill_gift_budget", payload: "mid" },
            { label: "🚚 Is Shipping Free?", action: "skill_shipping_info" },
          ],
          timestamp: ts,
        };
      }
      if (payload === "mid") {
        return {
          id: `gift-res-${Date.now()}`,
          sender: "bot",
          text: "Our most beloved gifting tier—stately frosted glass jars and artisan sculpted creations that make an impression:",
          products: [BOT_CATALOGUE.coffeeLatte, BOT_CATALOGUE.bubbleCandle, BOT_CATALOGUE.lotusHolder],
          quickActions: [
            { label: "🎁 Bulk Wedding Favors", action: "skill_bulk_gifting" },
            { label: "💬 Custom Message Help", action: "skill_whatsapp_handoff" },
          ],
          timestamp: ts,
        };
      }
      if (payload === "luxury" || payload === "wedding") {
        return {
          id: `gift-res-${Date.now()}`,
          sender: "bot",
          text: "For weddings, housewarmings, and executive hampers, we offer bespoke gift boxes, gold-foil monogram sleeves, and tiered bulk discounts from 15% to 35%+:",
          products: [BOT_CATALOGUE.sandalwoodJar, BOT_CATALOGUE.waxSachet, BOT_CATALOGUE.lotusHolder],
          quickActions: [
            { label: "📋 View Wholesale Tiers", action: "skill_bulk_gifting" },
            { label: "💬 Request Custom Quote on WhatsApp", action: "skill_whatsapp_handoff" },
          ],
          timestamp: ts,
        };
      }
      break;

    // ─── SKILL 3: ORDER TRACKING & STATUS ───────────────────────────────────────
    case "skill_track_order":
      return {
        id: `track-info-${Date.now()}`,
        sender: "bot",
        text: "You can track your package instantly! All orders dispatched from our Chennai atelier come with live Delhivery / Bluedart tracking. You can check order status with your Order ID or phone number.",
        quickActions: [
          { label: "🔍 Open Live Order Tracker", action: "nav_track_order" },
          { label: "🚚 Delivery Timelines", action: "skill_shipping_info" },
          { label: "💬 Ask Team via WhatsApp", action: "skill_whatsapp_handoff" },
        ],
        timestamp: ts,
      };

    // ─── SKILL 4: CANDLE CARE & USAGE GUIDE ─────────────────────────────────────
    case "skill_care_tips":
      return {
        id: `care-info-${Date.now()}`,
        sender: "bot",
        text: "Here are 3 golden rules from our chandlers to get the cleanest, longest burn from your Aura candle:\n\n1. **First Burn Memory:** Let the wax pool melt completely to the edges of the jar on first light (approx 2 hours) to avoid tunneling.\n2. **Trim the Wick:** Keep the cotton wick trimmed to 6mm (1/4 inch) before each light to prevent smoke and soot.\n3. **Safe Burning:** Burn for a maximum of 3–4 hours at a time, away from drafts and children.",
        quickActions: [
          { label: "🌿 How to Refresh Wax Sachets?", action: "skill_care_sachet" },
          { label: "🕯️ Scent Matcher", action: "skill_scent_start" },
          { label: "🕯️ Main Menu", action: "menu_reset" },
        ],
        timestamp: ts,
      };

    case "skill_care_sachet":
      return {
        id: `sachet-care-${Date.now()}`,
        sender: "bot",
        text: "Wax sachets do not require a flame! Hang them in your closet, wardrobe, or dresser. When the scent begins to soften after 45–60 days, gently buff the surface with a soft, clean cotton cloth to release fresh essential oils.",
        quickActions: [
          { label: "🛍️ View Wax Sachets (₹199)", action: "nav_shop_sachets" },
          { label: "🕯️ Candle Care Tips", action: "skill_care_tips" },
        ],
        timestamp: ts,
      };

    // ─── SKILL 5: BULK & CORPORATE GIFTING ───────────────────────────────────────
    case "skill_bulk_gifting":
      return {
        id: `bulk-info-${Date.now()}`,
        sender: "bot",
        text: "We specialize in corporate gifting, wedding return favors, and boutique hotel amenities hand-poured in Chennai!\n\n• **Tier 1 (25–49 units):** 15% Wholesale Discount\n• **Tier 2 (50–199 units):** 25% Discount + Custom Gold-Foil Logo Sleeve\n• **Tier 3 (200+ units):** 35%+ Bespoke Bulk Pricing + Custom Aroma\n\nGST invoicing and multi-city dispatch provided across India.",
        quickActions: [
          { label: "📋 Open Gifting Page", action: "nav_corporate_gifting" },
          { label: "💬 Chat Directly on WhatsApp", action: "skill_whatsapp_handoff" },
        ],
        timestamp: ts,
      };

    // ─── SKILL 6: SHIPPING & STUDIO INFO ─────────────────────────────────────────
    case "skill_shipping_info":
      return {
        id: `shipping-info-${Date.now()}`,
        sender: "bot",
        text: "• **Delivery Charges:** FREE delivery across India on all orders above ₹499! (Standard fee ₹49 for smaller orders).\n• **Timelines:** Chennai orders arrive in 24–48 hours; Bangalore/Hyderabad 2–3 days; rest of India 3–5 days.\n• **Studio Location:** Ayanambakkam, Vadanoombal, Chennai 600095. Open Mon–Sat 10:00 AM – 7:00 PM.",
        quickActions: [
          { label: "🕯️ Shop Candles", action: "nav_shop_all" },
          { label: "📦 Track My Order", action: "skill_track_order" },
        ],
        timestamp: ts,
      };

    // ─── SKILL 7: WHATSAPP DIRECT HANDOFF ───────────────────────────────────────
    case "skill_whatsapp_handoff":
      return {
        id: `wa-handoff-${Date.now()}`,
        sender: "bot",
        text: "Connecting you directly to our Chennai studio team on WhatsApp (+91 98400 22902). We are glad to help with custom gifts, scent advice, or urgent delivery requests!",
        quickActions: [
          { label: "👉 Tap to Open WhatsApp (+91 98400 22902)", action: "open_whatsapp_external" },
          { label: "🕯️ Continue Browsing Here", action: "menu_reset" },
        ],
        timestamp: ts,
      };

    case "menu_reset":
      return getInitialWelcomeMessage();

    default:
      return {
        id: `default-${Date.now()}`,
        sender: "bot",
        text: "I can help you find scents, choose gifts, track your package, or connect with our Chennai team.",
        quickActions: [
          { label: "🕯️ Scent Matcher", action: "skill_scent_start" },
          { label: "🎁 Find a Gift", action: "skill_gift_start" },
          { label: "📦 Track Order", action: "skill_track_order" },
          { label: "💬 WhatsApp Help", action: "skill_whatsapp_handoff" },
        ],
        timestamp: ts,
      };
  }
}

// ─── Natural Language Free-Text Intent Matcher ────────────────────────────────
export function processChatbotUserInput(userText: string): BotMessage {
  const q = userText.trim().toLowerCase();
  const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Greetings
  if (/^(hi|hello|hey|namaste|vanakkam|good morning|good evening)/i.test(q)) {
    return {
      id: `bot-greet-${Date.now()}`,
      sender: "bot",
      text: "Hello! Welcome to Aura Sparkles. I am Aura, your fragrance concierge. Are you exploring scents for yourself, or looking for a gift?",
      quickActions: [
        { label: "🕯️ Scent for My Home", action: "skill_scent_start" },
        { label: "🎁 Gift for Someone", action: "skill_gift_start" },
        { label: "📦 Track My Order", action: "skill_track_order" },
      ],
      timestamp: ts,
    };
  }

  // Coffee / Latte
  if (q.includes("coffee") || q.includes("latte") || q.includes("espresso") || q.includes("cafe")) {
    return {
      id: `bot-coffee-${Date.now()}`,
      sender: "bot",
      text: "Our Iced Coffee Latte Candle is one of our most requested creations! Poured in a 200ml glass tumbler with dark Arabica notes and whipped cream wax detailing:",
      products: [BOT_CATALOGUE.coffeeLatte],
      quickActions: [
        { label: "🍨 Vanilla Candle (₹249)", action: "skill_scent_room", payload: "study" },
        { label: "🕯️ Scent Matcher", action: "skill_scent_start" },
      ],
      timestamp: ts,
    };
  }

  // Sandalwood / Chandan
  if (q.includes("sandal") || q.includes("chandan") || q.includes("wood") || q.includes("mysore")) {
    return {
      id: `bot-sandal-${Date.now()}`,
      sender: "bot",
      text: "We source authentic Mysore Sandalwood aroma for a serene, sacred, and grounded woody fragrance. Perfect for peaceful evenings and meditation:",
      products: [BOT_CATALOGUE.sandalwoodJar, BOT_CATALOGUE.lotusHolder],
      quickActions: [
        { label: "🛏️ Bedroom Scents", action: "skill_scent_room", payload: "bedroom" },
        { label: "🎁 Gift Finder", action: "skill_gift_start" },
      ],
      timestamp: ts,
    };
  }

  // Rose / Floral / Lavender / Jasmine
  if (q.includes("rose") || q.includes("floral") || q.includes("flower") || q.includes("lavender") || q.includes("jasmine") || q.includes("mogra")) {
    return {
      id: `bot-floral-${Date.now()}`,
      sender: "bot",
      text: "Here are our finest handcrafted botanical florals, poured with pure soy wax for a clean, soot-free burn:",
      products: [BOT_CATALOGUE.roseJar, BOT_CATALOGUE.lavenderJar, BOT_CATALOGUE.waxSachet],
      quickActions: [
        { label: "🛏️ Sleep & Relaxation Scents", action: "skill_scent_room", payload: "bedroom" },
        { label: "🎁 Find a Gift", action: "skill_gift_start" },
      ],
      timestamp: ts,
    };
  }

  // Vanilla / Sweet / Gourmand
  if (q.includes("vanilla") || q.includes("sweet") || q.includes("gourmand") || q.includes("caramel")) {
    return {
      id: `bot-vanilla-${Date.now()}`,
      sender: "bot",
      text: "Madagascar vanilla brings a gentle, soothing warmth that makes any room feel comfortable and welcoming:",
      products: [BOT_CATALOGUE.vanillaJar, BOT_CATALOGUE.vanillaTealights, BOT_CATALOGUE.coffeeLatte],
      quickActions: [
        { label: "🛋️ Living Room Scents", action: "skill_scent_room", payload: "living" },
        { label: "🎁 Explore Gifting", action: "skill_gift_start" },
      ],
      timestamp: ts,
    };
  }

  // Wax sachet / closet / wardrobe / drawer / flameless
  if (q.includes("sachet") || q.includes("wardrobe") || q.includes("closet") || q.includes("drawer") || q.includes("flameless")) {
    return {
      id: `bot-sachet-${Date.now()}`,
      sender: "bot",
      text: "Our Botanical Perfumed Wax Sachets are handcrafted flameless tablets infused with pure essential oils and pressed botanicals. They keep wardrobes and drawers fragrant for 60 to 90 days:",
      products: [BOT_CATALOGUE.waxSachet],
      quickActions: [
        { label: "🌿 How to Care for Sachets?", action: "skill_care_sachet" },
        { label: "🎁 Gift Finder", action: "skill_gift_start" },
      ],
      timestamp: ts,
    };
  }

  // Tracking / order status / where is my order
  if (q.includes("track") || q.includes("order") || q.includes("delivery") || q.includes("status") || q.includes("courier") || q.includes("dispatch")) {
    return {
      id: `bot-track-${Date.now()}`,
      sender: "bot",
      text: "Orders are hand-poured and dispatched within 24 hours from our Chennai studio. Live tracking with Delhivery / Bluedart is available with your Order ID or phone number.",
      quickActions: [
        { label: "🔍 Open Live Order Tracker", action: "nav_track_order" },
        { label: "🚚 Delivery Timelines", action: "skill_shipping_info" },
        { label: "💬 Chat on WhatsApp", action: "skill_whatsapp_handoff" },
      ],
      timestamp: ts,
    };
  }

  // Location / Chennai / Shop / Store
  if (q.includes("chennai") || q.includes("address") || q.includes("store") || q.includes("location") || q.includes("studio") || q.includes("where")) {
    return {
      id: `bot-location-${Date.now()}`,
      sender: "bot",
      text: "Our fragrance studio and atelier is based in **Ayanambakkam, Vadanoombal, Chennai 600095**. We operate Mon–Sat from 10:00 AM to 7:00 PM. We ship across Chennai in 24–48 hours, and pan-India in 3–5 days!",
      quickActions: [
        { label: "📞 Helpline: +91 98400 22902", action: "skill_whatsapp_handoff" },
        { label: "🚚 Shipping Policy", action: "skill_shipping_info" },
      ],
      timestamp: ts,
    };
  }

  // Corporate / bulk / wedding favors / return gifts / wholesale
  if (q.includes("corporate") || q.includes("bulk") || q.includes("wedding") || q.includes("return gift") || q.includes("wholesale") || q.includes("discount")) {
    return {
      id: `bot-bulk-${Date.now()}`,
      sender: "bot",
      text: "We provide bespoke bulk gifting for weddings, corporate celebrations, and events! Volume discounts start at 15% (25+ units) up to 35%+ (200+ units), with custom gold-foil bands and GST invoicing.",
      products: [BOT_CATALOGUE.terracottaSet, BOT_CATALOGUE.waxSachet, BOT_CATALOGUE.sandalwoodJar],
      quickActions: [
        { label: "📋 View Wholesale Tiers", action: "skill_bulk_gifting" },
        { label: "💬 Request Quote on WhatsApp", action: "skill_whatsapp_handoff" },
      ],
      timestamp: ts,
    };
  }

  // Candle care / how to burn / soot / tunneling / wick
  if (q.includes("care") || q.includes("burn") || q.includes("wick") || q.includes("tunnel") || q.includes("soot") || q.includes("smoke")) {
    return {
      id: `bot-care-${Date.now()}`,
      sender: "bot",
      text: "Essential Candle Care Tips:\n1. On the first burn, keep lit until the wax pool reaches every edge (prevents tunneling).\n2. Trim wick to 6mm (1/4\") before every burn (prevents soot).\n3. Burn for up to 3–4 hours at a time.",
      quickActions: [
        { label: "🌿 Sachet Care Tips", action: "skill_care_sachet" },
        { label: "🕯️ Scent Matcher", action: "skill_scent_start" },
      ],
      timestamp: ts,
    };
  }

  // Price / Free shipping
  if (q.includes("price") || q.includes("free shipping") || q.includes("shipping") || q.includes("cost")) {
    return {
      id: `bot-shipping-${Date.now()}`,
      sender: "bot",
      text: "Our handcrafted candles start at just ₹160 for tea lights and ₹249 for signature frosted jars. Shipping is completely FREE across India on orders above ₹499!",
      quickActions: [
        { label: "✨ Shop Under ₹300", action: "skill_gift_budget", payload: "under300" },
        { label: "🕯️ Scent Matcher", action: "skill_scent_start" },
      ],
      timestamp: ts,
    };
  }

  // General fallback
  return {
    id: `bot-fallback-${Date.now()}`,
    sender: "bot",
    text: `I'd love to help with that! Here are our most popular concierge topics, or you can speak directly with our studio team in Chennai:`,
    quickActions: [
      { label: "🕯️ Scent Matcher", action: "skill_scent_start" },
      { label: "🎁 Find a Gift", action: "skill_gift_start" },
      { label: "📦 Track Order", action: "skill_track_order" },
      { label: "💬 Talk on WhatsApp (+91 98400 22902)", action: "skill_whatsapp_handoff" },
    ],
    timestamp: ts,
  };
}

