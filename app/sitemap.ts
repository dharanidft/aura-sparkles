import { MetadataRoute } from "next";
import { getAuthoritativeProducts } from "@/lib/product-store";
import { COLLECTIONS } from "@/lib/product-seo";
import { getAllPosts } from "@/lib/blog-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.aurasparkles.com";

  // 1. Core Static Pages
  const staticPages = [
    { route: "", changeFrequency: "daily" as const, priority: 1.0 },
    { route: "/shop", changeFrequency: "daily" as const, priority: 0.9 },
    { route: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { route: "/corporate-gifting", changeFrequency: "weekly" as const, priority: 0.8 },
    { route: "/story", changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
    { route: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
    { route: "/track-order", changeFrequency: "monthly" as const, priority: 0.5 },
    { route: "/shipping-policy", changeFrequency: "yearly" as const, priority: 0.4 },
    { route: "/refund-policy", changeFrequency: "yearly" as const, priority: 0.4 },
    { route: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
    { route: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ].map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  // 2. Collection Pages
  const collectionPages = Object.keys(COLLECTIONS).map((categorySlug) => ({
    url: `${baseUrl}/collections/${categorySlug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // 3. Published Product Detail Pages
  const products = getAuthoritativeProducts();
  const productPages = products
    .filter((prod) => prod.status !== "draft")
    .map((prod) => ({
      url: `${baseUrl}/shop/${prod.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  // 4. Blog Journal Articles
  const blogPosts = getAllPosts();
  const blogPages = blogPosts
    .filter((post) => post.status === "published")
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));

  return [...staticPages, ...collectionPages, ...productPages, ...blogPages];
}
