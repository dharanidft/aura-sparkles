import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Clock, Calendar, ChevronRight, ArrowRight, User } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/blog-data";
import { getAuthoritativeProducts } from "@/lib/product-store";
import { ProductCard } from "@/components/ProductCard";
import { buildBreadcrumbJsonLd, SITE_URL } from "@/lib/product-seo";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | Aura Sparkles",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.seoTitle,
    description: post.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.seoTitle,
      description: post.metaDescription,
      url: canonicalUrl,
      siteName: "Aura Sparkles",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 800,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.metaDescription,
      images: [post.featuredImage],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const allProducts = getAuthoritativeProducts();
  const relatedProducts = allProducts.filter((p) =>
    post.relatedProductSlugs.includes(p.slug)
  );

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Journal", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author.name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Aura Sparkles",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  const publishDateStr = new Date(post.publishedAt).toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="bg-[#FAF7F2] min-h-screen py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
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
                <Link href="/blog" className="hover:text-[#452638] transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </li>
              <li className="font-semibold text-[#452638] truncate max-w-xs" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE0D5] shadow-xs mb-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#766E65]">
              <span className="bg-[#FAF7F2] px-3 py-1 rounded-full text-[#B69A62] font-semibold border border-[#EAE0D5] uppercase tracking-wider text-[10px]">
                {post.tags[0]}
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{publishDateStr}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime}</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#452638] font-normal tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-[#766E65] leading-relaxed border-l-2 border-[#B69A62] pl-4 italic">
              {post.excerpt}
            </p>

            <div className="flex items-center space-x-3 pt-2 text-xs text-[#452638]">
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EAE0D5] flex items-center justify-center font-serif font-bold text-[#452638]">
                A
              </div>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="text-[11px] text-[#766E65]">{post.author.role}</p>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-[#EAE0D5] shadow-xs mb-10 bg-[#F2E9DF]">
            <Image
              src={post.featuredImage}
              alt={post.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE0D5] shadow-xs mb-12 space-y-6 text-[#282522] leading-relaxed text-sm sm:text-base font-sans">
            {post.content.map((paragraph, index) => (
              <p key={index} className="text-[#282522] leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Related Products Interlinking */}
          {relatedProducts.length > 0 && (
            <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EAE0D5] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-luxury text-[#B69A62] font-semibold">
                    Atelier Handcrafted Creations
                  </span>
                  <h2 className="font-serif text-2xl text-[#452638]">
                    Featured in this Article
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-[#452638] hover:text-[#B69A62] flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-[#452638] hover:underline"
            >
              <span>← Back to all journal articles</span>
            </Link>
          </div>

        </div>
      </article>
    </>
  );
}

