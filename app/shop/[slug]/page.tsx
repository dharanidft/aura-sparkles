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
      url: `https://aurasparkles.in/shop/${product.slug}`,
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

  return (
    <ProductDetailClient product={product} relatedProducts={relatedProducts} />
  );
}
