import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toast } from "@/components/Toast";
import { CartProvider } from "@/lib/cart-context";
import { CursorSparkle } from "@/components/CursorSparkle";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurasparkles.in"),
  title: "AURA SPARKLES — Illuminate Your Moments | Premium Scented Candles & Home Fragrance",
  description: "Indian home-fragrance studio specialising in hand-poured 100% natural soy wax candles, frosted-glass jars, and botanical aromas. Affordable luxury starting at ₹199.",
  keywords: [
    "AURA SPARKLES",
    "scented candles India",
    "soy wax candles",
    "home fragrance",
    "Mysore Sandalwood candle",
    "Damask Rose candle",
    "luxury candles India",
    "candle gift sets"
  ],
  authors: [{ name: "AURA SPARKLES" }],
  openGraph: {
    title: "AURA SPARKLES — Illuminate Your Moments",
    description: "Handcrafted 100% soy wax candles and botanical home fragrances in frosted glass. Made with love in India.",
    url: "https://aurasparkles.in",
    siteName: "AURA SPARKLES",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "AURA SPARKLES Logo"
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
    "@type": "Organization",
    "name": "AURA SPARKLES",
    "url": "https://aurasparkles.in",
    "logo": "https://aurasparkles.in/images/logo.png",
    "description": "Indian home-fragrance brand specialising in scented candles and thoughtful gifting.",
    "slogan": "Illuminate Your Moments.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "India"
    }
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
        <CartProvider>
          <CursorSparkle />
          <AnnouncementBar />
          <Header />
          <main className="flex-grow">{children}</main>
          <CartDrawer />
          <Toast />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
