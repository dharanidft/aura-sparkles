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
      "Finding the right fragrance is about more than just personal taste — room dimensions, airflow, and wax formulation dictate how a scent develops.",
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
      "Selecting the ideal scented candle involves understanding the balance between your living space and the fragrance throw. In spacious living rooms with open airflow, deeper notes like Mysore sandalwood, amber, and cedarwood project evenly without overpowering the room.",
      "For intimate spaces such as bedrooms and study alcoves, lighter floral and gourmand bouquets like Madagascar vanilla bean and gentle French lavender create a cozy, relaxing sanctuary without causing olfactory fatigue.",
      "Always look for 100% natural soy wax instead of paraffin. Soy wax burns cleaner, produces zero toxic soot, and maintains a lower melting point, meaning your candle lasts up to 50% longer than commercial petroleum-derived alternatives.",
      "To get the most out of your candle, always allow the initial burn to liquefy the entire top surface from edge to edge of the glass container. This prevents 'tunneling' and guarantees a smooth, even melt pool for the lifetime of your jar.",
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
      "Discover the subtle art of flameless home fragrance with botanical soy wax tablets designed for enclosed spaces and luxury wardrobes.",
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
      "Perfumed wax sachets — also known as wax fragrance bars or closet tablets — are handcrafted botanical soy wax slabs infused with concentrated essential oils and decorated with real dried petals.",
      "Unlike traditional burning candles, wax sachets require no flame, wick, or electric warmer. They are formulated to gently release aromatics through ambient air circulation in enclosed spaces such as wardrobes, dresser drawers, linen shelves, and suitcase interiors.",
      "To protect delicate silk, satin, or lace clothing, hang the sachet using its pre-attached grosgrain ribbon from a hanger hook, or slip it inside a light muslin pouch before tucking it into a drawer.",
      "A quality soy wax sachet will maintain its vibrant scent for 60 to 90 days. When the surface scent begins to soften, simply buff the wax face gently with a soft dry cotton cloth to re-expose fragrant essential oils.",
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
      "Whether celebrating a wedding, milestone birthday, or housewarming, artisanal candles offer an enduring, sensory expression of warmth.",
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
      "A hand-poured candle is one of the few gifts that engages sight, touch, and scent simultaneously. Because scent is closely tethered to memory, lighting a gifted candle reconnects the recipient to the celebratory moment long after the occasion has passed.",
      "For housewarmings and family milestones, curating a Fragrance Trio featuring contrasting scent profiles — such as grounding Mysore Sandalwood alongside uplifting Damask Rose and comforting Vanilla — allows the recipient to curate their home's fragrance by mood.",
      "For return gifts and wedding favors in Chennai and across India, compact 80g frosted jars or botanical wax sachets wrapped in gold-foil sleeves offer an approachable luxury favor that guests genuinely treasure and use in their daily rituals.",
      "Aura Sparkles provides customized monogram labels, custom ribbon choices, and curated message cards for bulk event orders and bespoke festive gifting.",
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
      "Both belong to the comforting gourmand fragrance family, yet their olfactory energy is strikingly distinct. Here is how to choose between them.",
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
      "Warm gourmand fragrances have an unmatched ability to make any interior feel instantly welcoming, grounded, and tranquil. Within this fragrance family, coffee and vanilla stand out as the two most beloved notes in contemporary home fragrance.",
      "An authentic coffee fragrance — such as our Iced Coffee Latte Candle — combines dark roasted Arabica beans, bittersweet cocoa, and foamed milk. It provides an invigorating, focused atmosphere that is ideal for mornings, home offices, and kitchen living areas.",
      "In contrast, pure Madagascar vanilla offers a sweeter, softer embrace. Laced with toasted tonka bean and warm caramelized sugar, vanilla candles evoke serenity, nostalgia, and soothing calm — making them the preferred companion for quiet evening reading and bedside relaxation.",
      "Can't decide? Scent pairing is a popular atelier technique: burn an 80g Vanilla Candle alongside a small Coffee Candle to create a decadent café latte aroma in your living room.",
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
      "Move beyond standard stainless steel trays and dry fruits with bespoke botanical candles and hand-cast ceramic favors.",
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
      "When hosting a milestone wedding, baby shower, or traditional ceremony in Chennai, hosts increasingly seek return gifts that reflect thoughtful craftsmanship rather than mass-produced utilitarian trinkets.",
      "Botanical soy wax candles and wardrobe sachets have emerged as one of the most celebrated return gifts across Tamil Nadu. They are lightweight, shatter-resistant when properly packed, universally appreciated, and suitable for all age groups.",
      "For traditional south Indian celebrations, our Terracotta Scented Candles and Lotus Ceramic Bowl Holders bridge timeless cultural symbolism with modern minimalist aesthetics, serving as both ambient candle and enduring keepsake.",
      "All Aura Sparkles event orders are handcrafted at our Chennai studio in Ayanambakkam, allowing local pickup or expedited courier delivery across Chennai, Bengaluru, and surrounding southern regions.",
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return INITIAL_BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return INITIAL_BLOG_POSTS.find((p) => p.slug === slug);
}

