import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthoritativeProducts } from "@/lib/product-store";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import {
  generateProductMetadata,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/product-seo";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = getAuthoritativeProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const products = getAuthoritativeProducts();
  const product = products.find((p) => p.slug === params.slug);
  if (!product) {
    return {
      title: "Product Not Found — Aura Sparkles",
      robots: { index: false, follow: false },
    };
  }

  const size = product.sizeVariant || product.netWeight?.split("/")[0]?.trim() || "";
  const pageTitle = `${product.name}, ${size} — Aura Sparkles`;

  return generateProductMetadata({
    ...product,
    seoTitle: product.seoTitle || pageTitle,
  });
}

export default function ProductDetailPage({ params }: Props) {
  const products = getAuthoritativeProducts();
  const product = products.find((p) => p.slug === params.slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.fragranceFamily === product.fragranceFamily)
    .slice(0, 4);

  const productJsonLd = buildProductJsonLd(product);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: product.name, url: `/shop/${product.slug}` },
  ]);

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
