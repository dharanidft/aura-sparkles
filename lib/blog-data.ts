export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string[]; // Editorial paragraphs
  featuredImage: string;
  imageAlt: string;
  author: BlogAuthor;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  tags: string[];
  status: "published" | "draft";
  relatedProductSlugs: string[];
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-choose-perfect-scented-candle",
    slug: "how-to-choose-the-perfect-scented-candle-for-your-home",
    title: "How to Choose the Perfect Scented Candle for Your Home",
    seoTitle: "How to Choose the Perfect Scented Candle for Your Home | Aura Sparkles",
    metaDescription:
      "A complete guide to choosing the best scented candle for your living space, bedroom, and study based on wax purity, room size, and scent throw.",
    excerpt:
      "Finding the right candle is about more than scent preferences. Room size, ventilation, and the type of wax all shape how the fragrance carries.",
    author: {
      name: "Aura Sparkles Fragrance Atelier",
      role: "Studio Artisan & Chandler",
    },
    publishedAt: "2026-10-15T09:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    readTime: "4 min read",
    tags: ["Candle Care", "Home Fragrance", "Soy Wax"],
    status: "published",
    relatedProductSlugs: [
      "mysore-sandalwood-candle-80g",
      "vanilla-scented-candle-80g",
    ],
    featuredImage:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Aura Sparkles hand-poured soy wax scented candle in frosted glass jar",
    content: [
      "The right scented candle depends on the room you put it in. In an open living room with steady airflow, deeper notes like Mysore sandalwood, amber, and cedarwood carry well across the room without feeling heavy.",
      "In smaller spaces like bedrooms or a study, lighter scents like Madagascar vanilla or French lavender keep the room calm and gentle without overwhelming your senses.",
      "Check the wax before buying. Pure soy wax burns clean with zero black soot, and its lower melting point helps a jar burn up to 50% longer than paraffin.",
      "On your first burn, let the candle stay lit until the melted wax reaches every edge of the glass. That simple step prevents tunneling and makes sure you get every hour out of your candle.",
    ],
  },
  {
    id: "post-how-to-use-perfumed-wax-sachets",
    slug: "how-to-use-perfumed-wax-sachets",
    title: "How to Use Perfumed Wax Sachets in Wardrobes & Closets",
    seoTitle: "How to Use Perfumed Wax Sachets | Wardrobe Freshener Guide | Aura Sparkles",
    metaDescription:
      "Learn how to use botanical perfumed wax sachets to keep clothes, linen closets, and dressers naturally scented for 60 to 90 days flameless.",
    excerpt:
      "Keep clothes, wardrobes, and drawers fresh for months with flameless botanical soy wax tablets.",
    author: {
      name: "Aura Sparkles Fragrance Atelier",
      role: "Studio Artisan & Chandler",
    },
    publishedAt: "2026-10-20T10:30:00Z",
    updatedAt: "2026-11-02T11:00:00Z",
    readTime: "3 min read",
    tags: ["Wax Sachets", "Wardrobe Care", "Flameless Fragrance"],
    status: "published",
    relatedProductSlugs: [
      "perfumed-wax-sachets",
      "coffee-scented-wax-sachet",
      "rose-scented-wax-sachet",
    ],
    featuredImage:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Botanical perfumed wax sachet with pressed flower petals and grosgrain ribbon",
    content: [
      "Perfumed wax sachets are solid bars of soy wax infused with botanical oils and finished with pressed flowers. They give off a steady, gentle scent without any flame, heat, or plugs.",
      "Hang them in a closet or tuck them between folded linens, dresser drawers, or travel bags. The wax slowly diffuses fragrance through the airflow of an enclosed space.",
      "If you are storing them with delicate fabrics like silk or lace, hang the sachet by its ribbon from a coat hanger or slide it into a small cotton pouch.",
      "Each sachet keeps its scent for about 60 to 90 days. Once the fragrance starts to fade, gently buff the surface with a clean cloth to bring the oils back to life.",
    ],
  },
  {
    id: "post-handmade-candle-gift-ideas",
    slug: "handmade-candle-gift-ideas",
    title: "Handmade Candle Gift Ideas for Special Occasions",
    seoTitle: "Handmade Candle Gift Ideas for Weddings, Birthdays & Festivals | Aura Sparkles",
    metaDescription:
      "Explore thoughtful handmade candle gift ideas from celebration trio boxes to bespoke return gifts and wedding favor hampers by Aura Sparkles.",
    excerpt:
      "For weddings, birthdays, or housewarmings, handcrafted candles make a warm and lasting gift.",
    author: {
      name: "Aura Sparkles Gifting Atelier",
      role: "Bespoke Gifting Specialist",
    },
    publishedAt: "2026-10-25T11:00:00Z",
    updatedAt: "2026-11-03T12:00:00Z",
    readTime: "5 min read",
    tags: ["Gift Ideas", "Weddings", "Corporate Gifting", "Chennai"],
    status: "published",
    relatedProductSlugs: [
      "corporate-wedding-gifting-box",
      "signature-fragrance-trio",
    ],
    featuredImage:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Luxury candle gift box with gold foil lettering and handwritten gift card",
    content: [
      "A scented candle is one of those rare gifts people actually unbox and use right away. Because scent connects directly to memory, lighting it brings back the celebration long after the day is done.",
      "If you're gifting a housewarming or anniversary, a trio set with different scents lets the recipient switch moods—warm Mysore Sandalwood for quiet evenings, Damask Rose for lazy mornings, and Vanilla for afternoons.",
      "For wedding favors and return gifts in Chennai and across India, compact 80g jars and wax sachets work wonderfully. They pack easily, look elegant on a table, and won't end up forgotten in a cupboard.",
      "We include personalized gift tags, custom ribbon ties, and handwritten notes for bulk wedding orders and corporate gifting from our Chennai studio.",
    ],
  },
  {
    id: "post-coffee-vs-vanilla-fragrance",
    slug: "coffee-vs-vanilla-choosing-your-favourite-fragrance",
    title: "Coffee vs Vanilla: Choosing Your Favourite Gourmand Fragrance",
    seoTitle: "Coffee vs Vanilla Candle: Which Fragrance is Right for You? | Aura Sparkles",
    metaDescription:
      "Compare freshly brewed coffee aromas with warm Madagascar vanilla bean candles to discover which cozy gourmand fragrance fits your mood.",
    excerpt:
      "Both coffee and vanilla bring warmth into a room, but they set very different moods. Here is how to choose the right one for your space.",
    author: {
      name: "Aura Sparkles Fragrance Atelier",
      role: "Studio Artisan & Chandler",
    },
    publishedAt: "2026-10-28T08:30:00Z",
    updatedAt: "2026-11-04T09:00:00Z",
    readTime: "4 min read",
    tags: ["Fragrance Notes", "Coffee Candle", "Vanilla Candle"],
    status: "published",
    relatedProductSlugs: [
      "iced-coffee-latte-candle-200ml",
      "vanilla-scented-candle-80g",
    ],
    featuredImage:
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Warm candle flame beside roasted coffee beans and Madagascar vanilla pods",
    content: [
      "Rich aromas make any room feel lived-in. When browsing warm gourmand scents, most people narrow their pick down to roasted coffee or smooth Madagascar vanilla. They share a comforting base, but the way they transform your home could not be more different.",
      "Mornings call for focus. Lighting our Iced Coffee Latte candle at your work desk fills the room with rich notes of dark Arabica beans, bittersweet cocoa, and steamed milk.",
      "Evenings need the opposite. Our vanilla candles blend pure Madagascar beans with toasted tonka and warm caramel, softening the air so you can unwind with a book before turning off the lights.",
      "Can't pick one? Burn both together. An 80g vanilla jar burning beside a small coffee candle blends in the air into a freshly poured café latte.",
    ],
  },
  {
    id: "post-unique-handmade-return-gift-ideas",
    slug: "unique-handmade-return-gift-ideas",
    title: "Unique Handmade Return Gift Ideas for Weddings & Events in Chennai",
    seoTitle: "Unique Handmade Return Gift Ideas in Chennai (Weddings & Events) | Aura Sparkles",
    metaDescription:
      "Discover elegant, memorable handmade return gift ideas in Chennai for weddings, baby showers, and celebrations from Aura Sparkles candle studio.",
    excerpt:
      "Thoughtful alternatives to conventional return gifts: botanical soy candles and ceramic favors made in Chennai.",
    author: {
      name: "Aura Sparkles Gifting Atelier",
      role: "Bespoke Gifting Specialist",
    },
    publishedAt: "2026-10-31T09:00:00Z",
    updatedAt: "2026-11-04T10:00:00Z",
    readTime: "5 min read",
    tags: ["Return Gifts Chennai", "Weddings Chennai", "Handmade Gifts"],
    status: "published",
    relatedProductSlugs: [
      "small-terracotta-scented-candles-set-of-4",
      "perfumed-wax-sachets",
      "lotus-candle-with-bowl-holder-80ml",
    ],
    featuredImage:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Artisanal handcrafted return gifts packaged with botanical dried flowers",
    content: [
      "Planning a wedding, baby shower, or housewarming in Chennai often comes down to finding return gifts people will genuinely enjoy rather than another unused bowl or box of sweets.",
      "Hand-poured candles and wardrobe sachets have become popular choices across Tamil Nadu. They are easy to carry home, safe to travel with, and something guests can light and enjoy every week.",
      "For traditional South Indian ceremonies, our Terracotta Scented Candles and Lotus Ceramic Bowls bring classic craft into a clean, modern form that doubles as home decor long after the wax is finished.",
      "We hand-pour all custom event orders at our Chennai workshop in Ayanambakkam, with direct studio pickup or courier delivery across Chennai, Bengaluru, and southern India.",
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return INITIAL_BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return INITIAL_BLOG_POSTS.find((p) => p.slug === slug);
}

