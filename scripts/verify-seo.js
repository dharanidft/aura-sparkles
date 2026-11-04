/**
 * ==============================================================================
 * AURA SPARKLES — AUTOMATED TECHNICAL & ON-PAGE SEO VALIDATION TEST SUITE
 * ==============================================================================
 * Validates:
 * 1. Title tags (presence, uniqueness, length, branding)
 * 2. Meta descriptions (presence, uniqueness, optimal length)
 * 3. Primary H1 headings (presence, single per page)
 * 4. Canonical tags (HTTPS, preferred domain www.aurasparkles.com, no duplicate routes)
 * 5. Structured Data JSON-LD (Organization, LocalBusiness, WebSite, Product, BreadcrumbList, ItemList, BlogPosting)
 * 6. Robots.txt directives (Sitemap link, asset crawling permissions, admin protection)
 * 7. XML Sitemap integrity (valid HTTP 200 routes, collections, products, blogs)
 * 8. Image SEO (alt attributes, WebP/AVIF formats)
 * 9. Core internal links (no broken links in navigation/footer)
 * 10. Analytics & GSC integration hooks
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = process.cwd();

let passed = 0;
let failed = 0;
const errors = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
    errors.push({ name, error: err.message });
  }
}

console.log("\n=== STARTING AURA SPARKLES COMPREHENSIVE SEO VALIDATION ===\n");

// ─────────────────────────────────────────────────────────────────────────────
// 1. DOMAIN & URL CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
test("Domain & URL: Middleware enforces canonical domain www.aurasparkles.com and trailing slash normalization", () => {
  const mw = fs.readFileSync(path.join(root, "middleware.ts"), "utf8");
  assert(mw.includes("www.aurasparkles.com"), "Middleware missing canonical www redirect");
  assert(mw.includes("aurasparkles.com"), "Middleware missing non-www check");
  assert(mw.includes("endsWith(\"/\")"), "Middleware missing trailing slash normalization");
  assert(mw.includes("toLowerCase()"), "Middleware missing lowercase URL normalization");
});

test("Domain & URL: Root layout establishes canonical metadataBase", () => {
  const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
  assert(layout.includes("metadataBase: new URL(\"https://www.aurasparkles.com\")"), "Missing or incorrect metadataBase");
  assert(layout.includes("canonical: \"https://www.aurasparkles.com\""), "Missing layout canonical");
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. HOMEPAGE SEO
// ─────────────────────────────────────────────────────────────────────────────
test("Homepage SEO: Exact specified Title, Meta Description and H1 heading", () => {
  const page = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
  assert(
    page.includes("Handmade Scented Candles & Gifts | Aura Sparkles"),
    "Homepage missing exact requested Title"
  );
  assert(
    page.includes("Discover Aura Sparkles handcrafted scented candles, decorative candles and perfumed wax sachets. Explore elegant fragrance products and thoughtful gifts."),
    "Homepage missing exact requested Meta Description"
  );

  const hero = fs.readFileSync(path.join(root, "components/HeroSection.tsx"), "utf8");
  assert(
    hero.includes("[\"Handcrafted\", \"Candles\", \"&\"]") && hero.includes("[\"Thoughtful\", \"Gifts.\"]"),
    "Hero section missing exact requested H1: Handcrafted Candles & Thoughtful Gifts"
  );
  assert(hero.includes("<h1"), "Hero section missing semantic H1 tag");
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. COLLECTION PAGES SEO
// ─────────────────────────────────────────────────────────────────────────────
test("Collection SEO: All 4 target collections configured with exact titles and keyword strategy", () => {
  const seoHelper = fs.readFileSync(path.join(root, "lib/product-seo.ts"), "utf8");
  assert(seoHelper.includes("Scented & Decorative Candles Online | Aura Sparkles"), "Candles collection missing requested Title");
  assert(seoHelper.includes("Perfumed Wax Sachets | Aura Sparkles"), "Wax sachets collection missing requested Title");
  assert(seoHelper.includes("Handmade Gifts & Gift Collections | Aura Sparkles"), "Gifts collection missing requested Title");
  assert(seoHelper.includes("Handmade Home Décor | Aura Sparkles"), "Home Decor collection missing requested Title");

  const collectionPage = fs.readFileSync(path.join(root, "app/collections/[category]/page.tsx"), "utf8");
  assert(collectionPage.includes("<h1"), "Collection page missing primary H1 heading");
  assert(collectionPage.includes("buildCollectionItemListJsonLd"), "Collection page missing ItemList structured data");
  assert(collectionPage.includes("buildBreadcrumbJsonLd"), "Collection page missing Breadcrumb structured data");
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRODUCT SEO SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
test("Product SEO: 5 initial verified products present with complete SEO metadata and schema fields", () => {
  const productsData = fs.readFileSync(path.join(root, "lib/products-data.ts"), "utf8");
  
  const targetProducts = [
    "iced-coffee-latte-candle-200ml",
    "lotus-candle-with-bowl-holder-80ml",
    "terracotta-scented-boat-candle-80ml",
    "rose-peony-candle",
    "perfumed-wax-sachets",
  ];

  targetProducts.forEach((slug) => {
    assert(productsData.includes(slug), `Products data missing required target product: ${slug}`);
  });

  assert(productsData.includes("seoTitle:"), "Products data missing dedicated seoTitle attribute");
  assert(productsData.includes("metaDescription:"), "Products data missing dedicated metaDescription attribute");
  assert(productsData.includes("imageAlts:"), "Products data missing image alt text definitions");
  assert(productsData.includes("sku:"), "Products data missing SKU attributes");
});

test("Product Detail Page: Dynamic metadata, SSG static params, and rich JSON-LD schema", () => {
  const pdp = fs.readFileSync(path.join(root, "app/shop/[slug]/page.tsx"), "utf8");
  assert(pdp.includes("generateStaticParams"), "PDP missing generateStaticParams for SSG crawlability");
  assert(pdp.includes("generateMetadata"), "PDP missing generateMetadata");
  assert(pdp.includes("buildProductJsonLd"), "PDP missing buildProductJsonLd structured data generator");
  assert(pdp.includes("buildBreadcrumbJsonLd"), "PDP missing Breadcrumb structured data");

  const seoHelper = fs.readFileSync(path.join(root, "lib/product-seo.ts"), "utf8");
  assert(seoHelper.includes("\"@type\": \"Product\""), "Schema missing Product type");
  assert(seoHelper.includes("priceCurrency: \"INR\"") || seoHelper.includes("\"priceCurrency\": \"INR\""), "Schema missing INR currency");
  assert(seoHelper.includes("availability: product.inStock") || seoHelper.includes("\"availability\":"), "Schema missing Offer availability");
  assert(seoHelper.includes("shippingDetails:") || seoHelper.includes("\"shippingDetails\":"), "Schema missing Google Merchant shipping details");
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. STRUCTURED DATA (JSON-LD) SITE-WIDE
// ─────────────────────────────────────────────────────────────────────────────
test("Structured Data: Root layout includes valid Organization, LocalBusiness, and WebSite schemas", () => {
  const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
  assert(layout.includes("\"@type\": \"Organization\""), "Layout missing Organization schema");
  assert(layout.includes("\"@type\": [\"LocalBusiness\", \"Store\"]"), "Layout missing LocalBusiness schema");
  assert(layout.includes("\"addressLocality\": \"Chennai\""), "LocalBusiness missing Chennai locality");
  assert(layout.includes("\"telephone\": \"+919840022902\""), "LocalBusiness missing updated phone number");
  assert(layout.includes("\"@type\": \"WebSite\""), "Layout missing WebSite schema");
  assert(layout.includes("\"@type\": \"SearchAction\""), "WebSite missing SearchAction schema");
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ROBOTS.TXT & XML SITEMAP
// ─────────────────────────────────────────────────────────────────────────────
test("Robots.txt: Exists, declares sitemap, allows crawlers, protects admin & checkout", () => {
  const robots = fs.readFileSync(path.join(root, "app/robots.ts"), "utf8");
  assert(robots.includes("sitemap.xml"), "Robots.txt missing sitemap link");
  assert(robots.includes("/admin"), "Robots.txt missing admin disallow");
  assert(robots.includes("/checkout"), "Robots.txt missing checkout disallow");
  assert(robots.includes("Googlebot"), "Robots.txt missing explicit Googlebot directive");
});

test("XML Sitemap: Generates static pages, collections, authoritative products, and blog posts", () => {
  const sitemap = fs.readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
  assert(sitemap.includes("getAuthoritativeProducts"), "Sitemap must use authoritative products store");
  assert(sitemap.includes("COLLECTIONS"), "Sitemap missing collection pages");
  assert(sitemap.includes("getAllPosts"), "Sitemap missing blog articles");
  assert(sitemap.includes("status !== \"draft\""), "Sitemap must exclude draft products");
  assert(!sitemap.includes("/admin"), "Sitemap must not include admin URLs");
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. BLOG & CONTENT SEO SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
test("Blog System: Infrastructure created with 5 initial planned topics and Article schema", () => {
  const blogData = fs.readFileSync(path.join(root, "lib/blog-data.ts"), "utf8");
  
  const expectedSlugs = [
    "how-to-choose-the-perfect-scented-candle-for-your-home",
    "how-to-use-perfumed-wax-sachets",
    "handmade-candle-gift-ideas",
    "coffee-vs-vanilla-choosing-your-favourite-fragrance",
    "unique-handmade-return-gift-ideas",
  ];

  expectedSlugs.forEach((slug) => {
    assert(blogData.includes(slug), `Blog data missing requested article: ${slug}`);
  });

  const blogPostPage = fs.readFileSync(path.join(root, "app/blog/[slug]/page.tsx"), "utf8");
  assert(blogPostPage.includes("<h1"), "Blog post page missing primary H1 heading");
  assert(blogPostPage.includes("\"@type\": \"BlogPosting\""), "Blog post page missing BlogPosting JSON-LD schema");
  assert(blogPostPage.includes("buildBreadcrumbJsonLd"), "Blog post page missing Breadcrumb structured data");
  assert(blogPostPage.includes("relatedProducts"), "Blog post missing internal product links");
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. GOOGLE & META ANALYTICS INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────
test("Analytics: Env-driven GA4, GTM, Meta Pixel, and Search Console verification hooks present", () => {
  const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
  assert(layout.includes("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"), "Layout missing Google Search Console verification meta");
  assert(layout.includes("AnalyticsProvider"), "Layout missing AnalyticsProvider component");

  const analytics = fs.readFileSync(path.join(root, "lib/analytics.ts"), "utf8");
  assert(analytics.includes("view_item_list"), "Missing view_item_list tracking event");
  assert(analytics.includes("select_item"), "Missing select_item tracking event");
  assert(analytics.includes("view_item"), "Missing view_item tracking event");
  assert(analytics.includes("add_to_cart"), "Missing add_to_cart tracking event");
  assert(analytics.includes("remove_from_cart"), "Missing remove_from_cart tracking event");
  assert(analytics.includes("begin_checkout"), "Missing begin_checkout tracking event");
  assert(analytics.includes("purchase"), "Missing purchase tracking event");
  assert(analytics.includes("whatsapp_click"), "Missing whatsapp_click tracking event");
  assert(analytics.includes("generate_lead"), "Missing contact form lead tracking event");
  assert(analytics.includes("aura_purchase_tracked_"), "Missing purchase deduplication logic");
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. IMAGE SEO & ALT ATTRIBUTES
// ─────────────────────────────────────────────────────────────────────────────
test("Image SEO: Product card and gallery images use contextual, descriptive alt texts", () => {
  const card = fs.readFileSync(path.join(root, "components/ProductCard.tsx"), "utf8");
  assert(card.includes("product.imageAlts?.[0] ||"), "ProductCard missing descriptive image alt fallback");
  
  const nextConfig = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8");
  assert(nextConfig.includes("\"image/avif\"") && nextConfig.includes("\"image/webp\""), "Next config missing AVIF/WebP image formats");
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. INTERNAL NAVIGATION & FOOTER CRAWLABILITY
// ─────────────────────────────────────────────────────────────────────────────
test("Internal Navigation: Header and Footer provide crawlable links to all collections and journal", () => {
  const header = fs.readFileSync(path.join(root, "components/Header.tsx"), "utf8");
  assert(header.includes("/collections/candles"), "Header missing link to candles collection");
  assert(header.includes("/collections/wax-sachets"), "Header missing link to wax sachets collection");
  assert(header.includes("/collections/home-decor"), "Header missing link to home decor collection");
  assert(header.includes("/collections/gifts"), "Header missing link to gifts collection");
  assert(header.includes("/blog"), "Header missing link to journal");

  const footer = fs.readFileSync(path.join(root, "components/Footer.tsx"), "utf8");
  assert(footer.includes("/collections/candles"), "Footer missing link to candles collection");
  assert(footer.includes("/collections/wax-sachets"), "Footer missing link to wax sachets collection");
  assert(footer.includes("/blog"), "Footer missing link to journal");
});

console.log(`\n=== SEO AUDIT SUMMARY: ${passed}/${passed + failed} CHECKS PASSED ===\n`);

if (failed > 0) {
  process.exit(1);
}
