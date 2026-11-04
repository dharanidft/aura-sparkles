import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { getAuthoritativeProducts } from "@/lib/product-store";
import { ProductCard } from "@/components/ProductCard";
import {
  COLLECTIONS,
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildCollectionItemListJsonLd,
} from "@/lib/product-seo";

interface Props {
  params: { category: string };
}

export async function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = COLLECTIONS[params.category];
  if (!config) {
    return {
      title: "Collection Not Found | Aura Sparkles",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${SITE_URL}/collections/${config.slug}`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonicalUrl,
      siteName: "Aura Sparkles",
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
    },
  };
}

export default function CollectionPage({ params }: Props) {
  const config = COLLECTIONS[params.category];
  if (!config) {
    notFound();
  }

  const allProducts = getAuthoritativeProducts();
  const collectionProducts = allProducts.filter((p) =>
    config.categoryKeys.some(
      (key) =>
        p.category?.toLowerCase() === key.toLowerCase() ||
        p.collection?.toLowerCase().includes(key.toLowerCase())
    )
  );

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Collections", url: "/shop" },
    { name: config.h1, url: `/collections/${config.slug}` },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs);
  const collectionJsonLd = buildCollectionItemListJsonLd(config.h1, collectionProducts);

  const otherCollections = Object.values(COLLECTIONS).filter(
    (c) => c.slug !== config.slug
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div className="bg-[#FAF7F2] min-h-screen py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-xs text-[#766E65]">
              <li>
                <Link href="/" className="hover:text-[#452638] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#452638] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </li>
              <li className="font-semibold text-[#452638]" aria-current="page">
                {config.h1}
              </li>
            </ol>
          </nav>

          {/* Collection Header */}
          <header className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE0D5] shadow-xs mb-10 text-center sm:text-left">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-luxury text-[#B69A62] font-semibold bg-[#FAF7F2] px-3.5 py-1.5 rounded-full border border-[#EAE0D5]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Handcrafted Artisanal Collection</span>
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#452638] font-normal tracking-tight">
                {config.h1}
              </h1>
              <p className="text-xs sm:text-sm text-[#766E65] leading-relaxed">
                {config.intro}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-[#452638]/90 font-medium">
                <span className="bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#EAE0D5]">
                  100% Pure Soy Wax
                </span>
                <span className="bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#EAE0D5]">
                  Hand-Poured in India
                </span>
                <span className="bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#EAE0D5]">
                  Free Shipping ₹499+
                </span>
                <span className="bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#EAE0D5]">
                  Chennai Studio Delivery
                </span>
              </div>
            </div>
          </header>

          {/* Product Listing */}
          <section aria-label={`${config.h1} Products`}>
            {collectionProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {collectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-[#EAE0D5] text-center space-y-3">
                <p className="text-sm text-[#766E65]">
                  Collection products are being prepared by the studio atelier.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 bg-[#452638] text-white rounded-full text-xs font-semibold"
                >
                  View All Products
                </Link>
              </div>
            )}
          </section>

          {/* Related Collections Internal Linking */}
          <aside className="mt-16 pt-12 border-t border-[#EAE0D5] space-y-6">
            <h2 className="font-serif text-2xl text-[#452638]">
              Explore Other Fragrance &amp; Decor Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherCollections.map((col) => (
                <Link
                  key={col.slug}
                  href={`/collections/${col.slug}`}
                  className="group bg-white p-6 rounded-2xl border border-[#EAE0D5] hover:border-[#B69A62] transition-all hover:shadow-card flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <p className="font-serif text-lg text-[#452638] group-hover:text-[#B69A62] transition-colors">
                      {col.h1}
                    </p>
                    <p className="text-xs text-[#766E65] line-clamp-2">
                      {col.description}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center space-x-1.5 text-xs font-semibold text-[#452638] group-hover:text-[#B69A62]">
                    <span>View Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </>
  );
}

