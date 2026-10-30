import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/AuthModal";
import { CursorSparkle } from "@/components/CursorSparkle";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aurasparkles.com"),
  alternates: {
    canonical: "https://www.aurasparkles.com",
  },
  title: {
    template: "%s",
    default: "Aura Sparkles — Handcrafted Scented Soy Candles & Home Fragrance India",
  },
  description: "Indian home-fragrance studio specialising in hand-poured 100% natural soy wax candles, frosted-glass jars, and botanical aromas. Affordable luxury starting at ₹160.",
  keywords: [
    "Aura Sparkles",
    "scented candles India",
    "soy wax candles",
    "home fragrance India",
    "handcrafted candles Chennai",
    "Mysore Sandalwood candle",
    "Damask Rose candle",
    "luxury candles India",
    "candle gift sets India",
    "wax sachets for wardrobe"
  ],
  authors: [{ name: "Aura Sparkles" }],
  openGraph: {
    title: "Aura Sparkles — Handcrafted Soy Wax Candles & Home Fragrances India",
    description: "Handcrafted 100% natural soy wax candles, botanical wax sachets, casting decor, and kids creative kits. Pure · Elegant · You.",
    url: "https://www.aurasparkles.com",
    siteName: "Aura Sparkles",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "Aura Sparkles Logo"
      }
    ],
    locale: "en_IN",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.aurasparkles.com/#organization",
        "name": "Aura Sparkles",
        "url": "https://www.aurasparkles.com",
        "logo": "https://www.aurasparkles.com/images/logo.png",
        "description": "Indian home-fragrance studio specialising in scented soy wax candles, botanical wax sachets, ceramic casting decor, and kids creative kits.",
        "slogan": "Pure · Elegant · You",
        "telephone": "+919385328336",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+919385328336",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi", "Tamil"]
          }
        ],
        "sameAs": [
          "https://www.instagram.com/aurasparklesofficial/"
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Ayanambakkam, Vadanoombal",
          "addressLocality": "Chennai",
          "addressRegion": "Tamil Nadu",
          "postalCode": "600095",
          "addressCountry": "India"
        }
      },
      {
        "@type": ["LocalBusiness", "Store"],
        "@id": "https://www.aurasparkles.com/#localbusiness",
        "name": "Aura Sparkles Studio",
        "image": "https://www.aurasparkles.com/images/logo.png",
        "url": "https://www.aurasparkles.com",
        "telephone": "+919385328336",
        "priceRange": "₹160 - ₹2499",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Ayanambakkam, Vadanoombal",
          "addressLocality": "Chennai",
          "addressRegion": "Tamil Nadu",
          "postalCode": "600095",
          "addressCountry": "India"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 13.0642,
          "longitude": 80.1418
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:30",
            "closes": "19:00"
          }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.aurasparkles.com/#website",
        "url": "https://www.aurasparkles.com",
        "name": "Aura Sparkles",
        "description": "Handcrafted Scented Soy Candles & Home Fragrances India",
        "publisher": {
          "@id": "https://www.aurasparkles.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.aurasparkles.com/shop?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Italiana&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var font = localStorage.getItem('aura_font') || 'playfair';
                var fontMap = {
                  'playfair': "'Playfair Display', Georgia, serif",
                  'cinzel': "'Cinzel', serif",
                  'italiana': "'Italiana', serif",
                  'cormorant': "'Cormorant Garamond', Georgia, serif",
                  'montserrat': "'Montserrat', sans-serif"
                };
                document.documentElement.setAttribute('data-font', font);
                if (fontMap[font]) {
                  document.documentElement.style.setProperty('--font-heading', fontMap[font]);
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#282522] selection:bg-[#E8C9C5] selection:text-[#452638]">
        <AuthProvider>
          <CartProvider>
            <CursorSparkle />
            <AnnouncementBar />
            <Header />
            <main className="flex-grow">{children}</main>
            <CartDrawer />
            <Toast />
            <AuthModal />
            <CookieConsentBanner />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
