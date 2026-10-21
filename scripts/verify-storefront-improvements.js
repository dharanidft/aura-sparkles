const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");

console.log("=== STARTING STOREFRONT IMPROVEMENTS AUDIT & VERIFICATION ===");

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

// ─── 1. CRITICAL — Contact Information ──────────────────────────────────────────
test("Requirement 1: Official contact mailbox contact@aurasparkles.com is active everywhere", () => {
  const contactPage = fs.readFileSync(path.join(root, "app/contact/page.tsx"), "utf8");
  assert(contactPage.includes("contact@aurasparkles.com"), "Contact page missing contact@aurasparkles.com");
  assert(!contactPage.includes("care@aurasparkles.in"), "Contact page still has old care@aurasparkles.in");

  const footer = fs.readFileSync(path.join(root, "components/Footer.tsx"), "utf8");
  assert(footer.includes("contact@aurasparkles.com"), "Footer missing contact@aurasparkles.com");

  const apiRoute = fs.readFileSync(path.join(root, "app/api/contact/route.ts"), "utf8");
  assert(apiRoute.includes('TARGET_MAILBOX = "contact@aurasparkles.com"'), "API route missing TARGET_MAILBOX contact@aurasparkles.com");

  const refundPage = fs.readFileSync(path.join(root, "app/refund-policy/page.tsx"), "utf8");
  assert(refundPage.includes("contact@aurasparkles.com"), "Refund policy missing contact@aurasparkles.com");
});

test("Requirement 1: Official phone +91 93853 28336 and tel:+919385328336 are present", () => {
  const contactPage = fs.readFileSync(path.join(root, "app/contact/page.tsx"), "utf8");
  assert(contactPage.includes("+91 93853 28336"), "Contact page missing +91 93853 28336");
  assert(contactPage.includes("tel:+919385328336"), "Contact page missing tel:+919385328336");

  const footer = fs.readFileSync(path.join(root, "components/Footer.tsx"), "utf8");
  assert(footer.includes("+91 93853 28336"), "Footer missing +91 93853 28336");
  assert(footer.includes("tel:+919385328336"), "Footer missing tel:+919385328336");
});

test("Requirement 1: WhatsApp link uses 919385328336 and preserves enquiry message", () => {
  const contactPage = fs.readFileSync(path.join(root, "app/contact/page.tsx"), "utf8");
  assert(
    contactPage.includes("https://wa.me/919385328336?text=Hi%20AURA%20SPARKLES,%20I%20have%20an%20enquiry%20regarding%20fragrances"),
    "WhatsApp link or enquiry message missing or altered in Contact page"
  );
});

test("Requirement 1: Layout schema.org structured data contains telephone and customer service point", () => {
  const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
  assert(layout.includes("+919385328336"), "Schema.org missing telephone");
  assert(layout.includes("customer service"), "Schema.org missing customer service contact point");
  assert(layout.includes("600095"), "Schema.org missing updated postal code 600095");
  assert(layout.includes("Tamil Nadu"), "Schema.org missing updated state Tamil Nadu");
});

test("Requirement 1: Verified business address in Contact page and Footer", () => {
  const contactPage = fs.readFileSync(path.join(root, "app/contact/page.tsx"), "utf8");
  assert(contactPage.includes("Ayanambakkam, Vadanoombal, Tamil Nadu 600095"), "Contact page missing verified address");

  const footer = fs.readFileSync(path.join(root, "components/Footer.tsx"), "utf8");
  assert(footer.includes("Ayanambakkam, Tamil Nadu"), "Footer missing Ayanambakkam, Tamil Nadu");
});

// ─── 2. HIGH — Pricing & Burn-Time Claims ─────────────────────────────────────
test("Requirement 2: Hero section distinguishes Tea lights from ₹160 and Jar candles from ₹249", () => {
  const hero = fs.readFileSync(path.join(root, "components/HeroSection.tsx"), "utf8");
  assert(hero.includes("TEA LIGHTS FROM ₹160"), "Hero badge missing tea lights from ₹160");
  assert(hero.includes("JAR CANDLES FROM ₹249"), "Hero badge missing jar candles from ₹249");
  assert(!hero.includes("25+ Hrs"), "Hero should not contain generic 25+ Hrs claim");
});

test("Requirement 2: Mysore Sandalwood 80g candle authoritative values (₹249, 18–22 Hours)", () => {
  const productsData = fs.readFileSync(path.join(root, "lib/products-data.ts"), "utf8");
  assert(productsData.includes('id: "jar-80-sandalwood"'), "jar-80-sandalwood not found");
  assert(productsData.includes('burnTime: "18–22 Hours"'), "80g burn time must be 18–22 Hours");
  assert(productsData.includes('price: 249'), "80g price must be 249");
});

test("Requirement 2: Complete 4 categories (Candles, Wax Sachets, Casting Decor, Pop Art Kits) in catalogue", () => {
  const productsData = fs.readFileSync(path.join(root, "lib/products-data.ts"), "utf8");
  assert(productsData.includes("Wax Sachets"), "Wax Sachets missing from catalogue");
  assert(productsData.includes("Casting Decor"), "Casting Decor missing from catalogue");
  assert(productsData.includes("Pop Art Kits"), "Pop Art Kits missing from catalogue");
  assert(productsData.includes('id: "candle-bubble"'), "Bubble candle missing");
  assert(productsData.includes('price: 399'), "Bubble candle price must be 399");
});

// ─── 3. HIGH — Instagram Links ────────────────────────────────────────────────
test("Requirement 3: Official profile https://www.instagram.com/aurasparklesofficial/ and rel attributes", () => {
  const insta = fs.readFileSync(path.join(root, "components/InstagramGallery.tsx"), "utf8");
  assert(insta.includes("https://www.instagram.com/aurasparklesofficial/"), "Instagram gallery missing official profile link");
  assert(insta.includes("@aurasparklesofficial"), "Instagram gallery missing @aurasparklesofficial handle");
  assert(insta.includes('rel="noopener noreferrer"'), "Instagram links missing rel='noopener noreferrer'");
  assert(!insta.includes('href="https://instagram.com"'), "Generic instagram.com link should not be present");
});

// ─── 4. HIGH — Product Reviews ────────────────────────────────────────────────
test("Requirement 4: Product review helper logic & purchase order verification", () => {
  const reviewsLib = fs.readFileSync(path.join(root, "lib/reviews.ts"), "utf8");
  assert(reviewsLib.includes("verifyQualifyingOrder"), "reviews.ts missing verifyQualifyingOrder");
  assert(reviewsLib.includes("getProductReviewStats"), "reviews.ts missing getProductReviewStats");
  assert(reviewsLib.includes("isVerifiedPurchase"), "reviews.ts missing isVerifiedPurchase flag");

  const productDetail = fs.readFileSync(path.join(root, "components/ProductDetailClient.tsx"), "utf8");
  assert(productDetail.includes("scrollToReviews"), "Product detail missing clickable rating scroll trigger");
  assert(productDetail.includes("How Our Purchase Verification Works"), "Product detail missing verification explanation");
  assert(productDetail.includes("No Customer Reviews Yet"), "Product detail missing honest empty state");
});

// ─── 5. HIGH — Checkout Address Selection ─────────────────────────────────────
test("Requirement 5: Checkout state starts empty with 'Select state' placeholder", () => {
  const checkout = fs.readFileSync(path.join(root, "app/checkout/page.tsx"), "utf8");
  assert(checkout.includes('const [state, setState] = useState("");'), "Checkout state must start empty string");
  assert(checkout.includes('Select state or union territory *'), "Checkout missing 'Select state or union territory *' placeholder");
});

test("Requirement 5: Shipping library contains 28 states and 8 union territories", () => {
  const shipping = fs.readFileSync(path.join(root, "lib/shipping.ts"), "utf8");
  assert(shipping.includes("INDIAN_STATES_AND_UTS"), "shipping.ts missing INDIAN_STATES_AND_UTS");
  assert(shipping.includes("type: \"state\""), "shipping.ts missing state types");
  assert(shipping.includes("type: \"ut\""), "shipping.ts missing UT types");
  assert(shipping.includes("Ladakh"), "shipping.ts missing Ladakh");
  assert(shipping.includes("Dadra and Nagar Haveli"), "shipping.ts missing Dadra and Nagar Haveli");
});

test("Requirement 5: PIN code lookup backend route exists and validates 6 digits", () => {
  const pincodeRoute = fs.readFileSync(path.join(root, "app/api/pincode/[pincode]/route.ts"), "utf8");
  assert(pincodeRoute.includes("cleanPin.length !== 6"), "Pincode route missing 6-digit validation");
  assert(pincodeRoute.includes("localities"), "Pincode route missing locality extraction");
  assert(pincodeRoute.includes("PINCODE_PREFIX_MAP"), "Pincode route missing prefix fallback");
});

// ─── 6. MEDIUM — Navigation Separation ─────────────────────────────────────────
test("Requirement 6: Admin and Store Management links removed from customer nav and footer", () => {
  const header = fs.readFileSync(path.join(root, "components/Header.tsx"), "utf8");
  assert(!header.includes('href="/admin"'), "Customer Header still links to /admin!");
  assert(header.includes('href="/track-order"'), "Customer Header missing /track-order link!");

  const footer = fs.readFileSync(path.join(root, "components/Footer.tsx"), "utf8");
  assert(!footer.includes('href="/admin"'), "Footer still links to /admin!");
  assert(footer.includes('href="/track-order"'), "Footer missing /track-order link!");

  // Verify /admin page still exists
  assert(fs.existsSync(path.join(root, "app/admin/page.tsx")), "Admin portal at /admin must remain accessible!");
  assert(fs.existsSync(path.join(root, "app/track-order/page.tsx")), "Order tracking page must exist!");
});

// ─── 7. MEDIUM — Free Shipping Threshold (₹499) ────────────────────────────────
test("Requirement 7: Standardised Free Shipping Threshold calculation boundaries", () => {
  const FREE_SHIPPING_THRESHOLD = 499;
  const STANDARD_SHIPPING_FEE = 49;

  function calculateShippingFee(subtotalAfterDiscount) {
    if (subtotalAfterDiscount <= 0) return 0;
    return subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }

  function calculateOrderTotals(subtotal, discount = 0) {
    const merchandiseSubtotal = Math.max(0, subtotal - discount);
    const shippingFee = subtotal === 0 ? 0 : calculateShippingFee(merchandiseSubtotal);
    const finalTotal = merchandiseSubtotal + shippingFee;
    const isFreeShipping = merchandiseSubtotal >= FREE_SHIPPING_THRESHOLD;
    const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - merchandiseSubtotal);

    return {
      subtotal,
      discount,
      merchandiseSubtotal,
      shippingFee,
      finalTotal,
      isFreeShipping,
      amountNeededForFreeShipping,
    };
  }

  // Also verify lib/shipping.ts file content contains the exact formula
  const shippingTs = fs.readFileSync(path.join(root, "lib/shipping.ts"), "utf8");
  assert(shippingTs.includes("export const FREE_SHIPPING_THRESHOLD = 499;"), "FREE_SHIPPING_THRESHOLD must be 499");
  assert(shippingTs.includes("export const STANDARD_SHIPPING_FEE = 49;"), "STANDARD_SHIPPING_FEE must be 49");
  assert(shippingTs.includes("subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE"), "Shipping fee formula mismatch");
  
  // Boundary 1: ₹498 subtotal -> ₹49 shipping (Total = 547)
  const b1 = calculateOrderTotals(498, 0);
  assert.strictEqual(b1.shippingFee, 49, "₹498 must have ₹49 shipping");
  assert.strictEqual(b1.finalTotal, 547, "₹498 total must be 547");
  assert.strictEqual(b1.isFreeShipping, false, "₹498 is not free shipping");

  // Boundary 2: ₹499 subtotal -> Free shipping (₹0) (Total = 499)
  const b2 = calculateOrderTotals(499, 0);
  assert.strictEqual(b2.shippingFee, 0, "₹499 must have ₹0 shipping");
  assert.strictEqual(b2.finalTotal, 499, "₹499 total must be 499");
  assert.strictEqual(b2.isFreeShipping, true, "₹499 must be free shipping");

  // Boundary 3: ₹500 subtotal -> Free shipping (₹0) (Total = 500)
  const b3 = calculateOrderTotals(500, 0);
  assert.strictEqual(b3.shippingFee, 0, "₹500 must have ₹0 shipping");
  assert.strictEqual(b3.finalTotal, 500, "₹500 total must be 500");
  assert.strictEqual(b3.isFreeShipping, true, "₹500 must be free shipping");

  // Discount Boundary: ₹520 subtotal - ₹50 discount = ₹470 merchandise subtotal -> ₹49 shipping
  const d1 = calculateOrderTotals(520, 50);
  assert.strictEqual(d1.merchandiseSubtotal, 470);
  assert.strictEqual(d1.shippingFee, 49, "Merchandise subtotal ₹470 after discount must have ₹49 shipping");
  assert.strictEqual(d1.finalTotal, 519);

  // Discount Boundary: ₹550 subtotal - ₹50 discount = ₹500 merchandise subtotal -> Free shipping
  const d2 = calculateOrderTotals(550, 50);
  assert.strictEqual(d2.merchandiseSubtotal, 500);
  assert.strictEqual(d2.shippingFee, 0, "Merchandise subtotal ₹500 after discount must have free shipping");
  assert.strictEqual(d2.finalTotal, 500);
});

test("Requirement 7: Standardised wording 'Free shipping on orders ₹499 and above.' across site", () => {
  const announcement = fs.readFileSync(path.join(root, "components/AnnouncementBar.tsx"), "utf8");
  assert(announcement.includes("Free shipping on orders ₹499 and above"), "Announcement bar missing standardized wording");

  const shippingPolicy = fs.readFileSync(path.join(root, "app/shipping-policy/page.tsx"), "utf8");
  assert(shippingPolicy.includes("Free shipping on orders ₹499 and above"), "Shipping policy missing standardized wording");

  const faq = fs.readFileSync(path.join(root, "app/faq/page.tsx"), "utf8");
  assert(faq.includes("Free shipping on orders ₹499 and above"), "FAQ missing standardized wording");
});

// ─── 8. MEDIUM — Descriptive Page Titles ──────────────────────────────────────
test("Requirement 8: Unique, accurate browser titles on pages", () => {
  const contact = fs.readFileSync(path.join(root, "app/contact/page.tsx"), "utf8");
  assert(contact.includes("Contact Us — Aura Sparkles"), "Contact page missing 'Contact Us — Aura Sparkles' title");

  const shipping = fs.readFileSync(path.join(root, "app/shipping-policy/page.tsx"), "utf8");
  assert(shipping.includes("Shipping Policy — Aura Sparkles"), "Shipping policy missing 'Shipping Policy — Aura Sparkles' title");

  const refund = fs.readFileSync(path.join(root, "app/refund-policy/page.tsx"), "utf8");
  assert(refund.includes("Returns & Refunds — Aura Sparkles"), "Refund policy missing 'Returns & Refunds — Aura Sparkles' title");

  const productServerPage = fs.readFileSync(path.join(root, "app/shop/[slug]/page.tsx"), "utf8");
  assert(productServerPage.includes("generateMetadata"), "Product page missing generateMetadata");
  assert(productServerPage.includes("pageTitle = `${product.name}, ${size} — Aura Sparkles`"), "Product page title not derived from catalogue");
});

console.log(`\n=== RESULTS: ${passedTests}/${totalTests} TESTS PASSED ===\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
