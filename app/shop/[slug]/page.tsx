import { Metadata } from "next";
import { notFound } from "next/navigation";
import { INITIAL_PRODUCTS } from "@/lib/products-data";
import { ProductDetailClient } from "@/components/ProductDetailClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) {
    return {
      title: "Product Not Found — Aura Sparkles",
    };
  }

  const size = product.sizeVariant || product.netWeight.split("/")[0].trim();
  const pageTitle = `${product.name}, ${size} — Aura Sparkles`;

  return {
    title: pageTitle,
    description: product.description || product.tagline,
    openGraph: {
      title: pageTitle,
      description: product.tagline,
      url: `https://www.aurasparkles.com/shop/${product.slug}`,
      siteName: "Aura Sparkles",
      images: [
        {
          url: product.images[0] || "/images/logo.png",
          alt: `${product.name} - Aura Sparkles`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: product.tagline,
      images: [product.images[0] || "/images/logo.png"],
    },
  };
}

export default function ProductDetailPage({ params }: Props) {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = INITIAL_PRODUCTS
    .filter((p) => p.id !== product.id && p.fragranceFamily === product.fragranceFamily)
    .slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description || product.tagline,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Aura Sparkles",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.aurasparkles.com/shop/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Aura Sparkles",
      },
    },
    ...(product.rating ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1,
      },
    } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.aurasparkles.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: "https://www.aurasparkles.com/shop",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://www.aurasparkles.com/shop/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
