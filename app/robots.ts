import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.aurasparkles.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/collections/",
          "/blog",
          "/blog/",
          "/corporate-gifting",
          "/story",
          "/contact",
          "/faq",
          "/shipping-policy",
          "/refund-policy",
          "/privacy-policy",
          "/terms",
          "/images/",
          "/_next/static/",
          "/_next/image",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/checkout",
          "/pay/",
          "/account",
          "/auth/verify-link",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/checkout",
          "/pay/",
          "/account",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
