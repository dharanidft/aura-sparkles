import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) & Candle Care Guide — Aura Sparkles",
  description: "Find expert answers on candle care, wick trimming, soy wax burn memory, shipping timelines, damage guarantees, and bulk gifting across India.",
  keywords: [
    "how to care for scented candles",
    "how to prevent candle tunneling",
    "soy wax vs paraffin wax",
    "free shipping candle store India",
    "Aura Sparkles FAQ"
  ],
  alternates: {
    canonical: "https://www.aurasparkles.com/faq",
  },
  openGraph: {
    title: "Candle Care & Orders FAQ — Aura Sparkles",
    description: "Learn how to care for hand-poured soy wax candles, avoid tunneling, and get answers regarding shipping and returns.",
    url: "https://www.aurasparkles.com/faq",
    siteName: "Aura Sparkles",
    type: "website",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is your free shipping policy across India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free shipping is provided on orders ₹499 and above. For orders below ₹499, a nominal shipping charge of ₹49 is applied across all serviceable Indian pincodes."
      }
    },
    {
      "@type": "Question",
      "name": "What is your standard delivery timeline across India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Orders placed before 2:00 PM IST dispatch the same day. Delivery takes 2 to 3 business days for tier-1 metro cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata, Pune) and 3 to 5 business days for other pin codes."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a glass candle jar arrives damaged in transit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We pack every order with multi-layered protective cushioning. If transit damage occurs, notify us within 48 hours of receipt at contact@aurasparkles.com or via WhatsApp (+91 93853 28336) with an unboxing photo, and we will dispatch a brand-new free replacement immediately."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the first burn so important for soy candles?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Soy wax has memory! On your first burn, allow the candle to burn for 2 to 3 consecutive hours until the melted wax pool reaches all edges of the glass jar. This prevents 'tunneling' (wax clinging to the sides) and ensures an even burn for the lifetime of the candle."
      }
    },
    {
      "@type": "Question",
      "name": "How should I trim the candle wick?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Always trim the cotton wick to 1/4 inch (6mm) before lighting every time. Trimming keeps the flame at the ideal height, prevents mushrooming of the wick, and completely eliminates black soot."
      }
    },
    {
      "@type": "Question",
      "name": "What wax does Aura Sparkles use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We hand-pour 100% pure natural soy wax. Unlike conventional paraffin candles that release petroleum fumes, soy wax is plant-derived, biodegradable, burns up to 50% longer, and produces a clean, soot-free aroma."
      }
    }
  ]
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
