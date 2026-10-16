import { MetadataRoute } from "next";
import { INITIAL_PRODUCTS } from "@/lib/products-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aurasparkles.in";

  const staticPages = [
    "",
    "/shop",
    "/story",
    "/contact",
    "/faq",
    "/shipping-policy",
    "/refund-policy",
    "/privacy-policy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productPages = INITIAL_PRODUCTS.map((prod) => ({
    url: `${baseUrl}/shop/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
