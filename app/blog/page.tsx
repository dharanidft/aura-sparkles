import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog-data";
import { buildBreadcrumbJsonLd, SITE_URL } from "@/lib/product-seo";

export const metadata: Metadata = {
  title: "Candle Guides, Gifting Ideas & Fragrance Journal | Aura Sparkles",
  description:
    "Explore candle care guides, home fragrance rituals, and artisanal gifting inspiration from the Aura Sparkles handcrafted soy wax studio.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Candle Guides, Gifting Ideas & Fragrance Journal | Aura Sparkles",
    description:
      "Explore candle care guides, home fragrance rituals, and artisanal gifting inspiration from the Aura Sparkles handcrafted soy wax studio.",
    url: `${SITE_URL}/blog`,
    siteName: "Aura Sparkles",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Journal", url: "/blog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-[#FAF7F2] min-h-screen py-10 md:py-16">
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
              <li className="font-semibold text-[#452638]" aria-current="page">
                Journal &amp; Guides
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE0D5] shadow-xs mb-12 text-center sm:text-left">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-luxury text-[#B69A62] font-semibold bg-[#FAF7F2] px-3.5 py-1.5 rounded-full border border-[#EAE0D5]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Aura Sparkles Editorial Journal</span>
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl text-[#452638] font-normal tracking-tight">
                Fragrance, Candle Care &amp; Gifting Inspiration
              </h1>
              <p className="text-xs sm:text-sm text-[#766E65] leading-relaxed">
                Expert insights from our Chennai atelier on soy wax craftsmanship, scent styling for modern Indian homes, and thoughtful gifting guides.
              </p>
            </div>
          </header>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#EAE0D5] hover:border-[#B69A62] shadow-xs hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-[#F2E9DF]">
                    <Image
                      src={post.featuredImage}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center space-x-3 text-[11px] text-[#766E65]">
                      <span className="text-[#B69A62] font-semibold uppercase tracking-wider">
                        {post.tags[0]}
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>

                    <h2 className="font-serif text-xl text-[#452638] font-medium leading-snug group-hover:text-[#B69A62] transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs text-[#766E65] line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#EAE0D5]/40 mt-4 flex items-center justify-between text-xs font-semibold text-[#452638]">
                  <span>{post.author.name}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-1 text-[#452638] group-hover:text-[#B69A62] transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

