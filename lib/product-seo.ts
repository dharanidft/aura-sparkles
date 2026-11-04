import { Metadata } from "next";
import { Product } from "./types";

export const SITE_URL = "https://www.aurasparkles.com";

export interface CollectionConfig {
  slug: string;
  categoryKeys: string[];
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
}

export const COLLECTIONS: Record<string, CollectionConfig> = {
  candles: {
    slug: "candles",
    categoryKeys: ["Candles", "Scented Candles", "Tea-Light Candles", "Decorative Candles"],
    title: "Scented & Decorative Candles Online | Aura Sparkles",
    description:
      "Discover handcrafted 100% soy wax scented candles, decorative candles, tea-lights and frosted jars online at Aura Sparkles India. Clean-burning aromas from ₹160.",
    h1: "Scented & Decorative Candles Online",
    intro:
      "Hand-poured with pure botanical soy wax, lead-free cotton wicks, and IFRA-certified natural fragrances. Explore everyday tea-lights, artistic bubble candles, and signature frosted jars.",
    keywords: [
      "scented candles online",
      "handmade scented candles",
      "decorative candles",
      "soy wax candles India",
      "scented candles Chennai",
      "handmade candles India",
    ],
  },
  "wax-sachets": {
    slug: "wax-sachets",
    categoryKeys: ["Wax Sachets", "Hanging Fragrance Bars"],
    title: "Perfumed Wax Sachets | Aura Sparkles",
    description:
      "Hand-poured botanical perfumed wax sachets infused with Coffee, Mysore Sandal, Vanilla and Rose. Flameless wardrobe and drawer fragrances crafted in India.",
    h1: "Perfumed Wax Sachets",
    intro:
      "Flameless botanical wardrobe tablets designed to gently scent closets, linen chests, dresser drawers, and cars for 60 to 90 days.",
    keywords: [
      "perfumed wax sachets",
      "coffee scented wax sachet",
      "mysore sandal wax sachet",
      "vanilla scented wax sachet",
      "rose scented wax sachet",
      "wardrobe fragrance sachet",
    ],
  },
  gifts: {
    slug: "gifts",
    categoryKeys: ["Gift Sets", "Combo Offers", "Seasonal Gift Collections"],
    title: "Handmade Gifts & Gift Collections | Aura Sparkles",
    description:
      "Handmade gift sets, celebratory candle boxes, and curated return gift hampers by Aura Sparkles. Ideal for weddings, housewarmings, and special occasions across India.",
    h1: "Handmade Gifts & Gift Collections",
    intro:
      "Curated celebration gift hampers, handcrafted fragrance duos, and corporate gift sets packaged in luxury gift boxes with complimentary gold-foil gift cards.",
    keywords: [
      "handmade gift sets",
      "premium handmade gifts",
      "handmade gifts for special occasions",
      "wedding favors Chennai",
      "return gifts Chennai",
      "corporate gifting Chennai",
    ],
  },
  "home-decor": {
    slug: "home-decor",
    categoryKeys: ["Casting Decor", "Pop Art Kits"],
    title: "Handmade Home Décor | Aura Sparkles",
    description:
      "Artisanal ceramic casting decor, minimalist vanity trays, and sculptural candle holders handcrafted with non-toxic architectural composite in Chennai.",
    h1: "Handmade Home Décor",
    intro:
      "Hand-cast ceramic vessels, fluted vanity trays, and sculptural decor handcrafted to elevate your living room, bedside table, or workspace.",
    keywords: [
      "handmade home décor",
      "decorative candles",
      "ceramic trays India",
      "minimalist home decor",
      "handcrafted candle holders",
    ],
  },
};

/**
 * Deterministically generates high-converting, accurate SEO Metadata for any Product.
 */
export function generateProductMetadata(product: Product): Metadata {
  const canonicalUrl = product.canonicalUrl || `${SITE_URL}/shop/${product.slug}`;
  const size = product.sizeVariant || product.netWeight?.split("/")[0]?.trim() || "";
  
  // Custom SEO title if provided, otherwise clean templated title
  const pageTitle =
    product.seoTitle ||
    (size ? `${product.name} (${size}) | Aura Sparkles` : `${product.name} | Aura Sparkles`);

  const pageDesc =
    product.metaDescription ||
    product.shortDescription ||
    product.tagline ||
    product.description?.slice(0, 160) ||
    `Handcrafted ${product.name} by Aura Sparkles. 100% natural soy wax, IFRA fragrance, hand-poured in India.`;

  const primaryImage = product.images?.[0] || `${SITE_URL}/images/logo.png`;
  const imageAlt = product.imageAlts?.[0] || `${product.name} - Handcrafted by Aura Sparkles`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: product.status === "draft" ? false : true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: "Aura Sparkles",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: [primaryImage],
    },
  };
}

/**
 * Builds standard Google Product JSON-LD structured data.
 */
export function buildProductJsonLd(product: Product) {
  const canonicalUrl = product.canonicalUrl || `${SITE_URL}/shop/${product.slug}`;
  const images = (product.images && product.images.length > 0)
    ? product.images.map((img) => (img.startsWith("http") ? img : `${SITE_URL}${img}`))
    : [`${SITE_URL}/images/logo.png`];

  const schema: Record<string, any> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description || product.tagline,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "Aura Sparkles",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Aura Sparkles",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.price >= 499 ? "0" : "60",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Builds BreadcrumbList JSON-LD structured data.
 */
export function buildBreadcrumbJsonLd(
  crumbs: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${SITE_URL}${crumb.url}`,
    })),
  };
}

/**
 * Builds ItemList JSON-LD for collection pages.
 */
export function buildCollectionItemListJsonLd(collectionName: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collectionName,
    itemListElement: products.map((prod, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: prod.name,
      url: `${SITE_URL}/shop/${prod.slug}`,
    })),
  };
}

