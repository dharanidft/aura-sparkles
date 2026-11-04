import { Metadata } from "next";
import { HeroSection } from "@/components/HeroSection";
import { FragranceCategories } from "@/components/FragranceCategories";
import { BestsellersSection } from "@/components/BestsellersSection";
import { CollectionsSection } from "@/components/CollectionsSection";
import { BrandStorySection } from "@/components/BrandStorySection";
import { GiftingSection } from "@/components/GiftingSection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CustomerReviews } from "@/components/CustomerReviews";
import { InstagramGallery } from "@/components/InstagramGallery";
import { Newsletter } from "@/components/Newsletter";

export const metadata: Metadata = {
  title: "Handmade Scented Candles & Gifts | Aura Sparkles",
  description:
    "Discover Aura Sparkles handcrafted scented candles, decorative candles and perfumed wax sachets. Explore elegant fragrance products and thoughtful gifts.",
  alternates: {
    canonical: "https://www.aurasparkles.com",
  },
  openGraph: {
    title: "Handmade Scented Candles & Gifts | Aura Sparkles",
    description:
      "Discover Aura Sparkles handcrafted scented candles, decorative candles and perfumed wax sachets. Explore elegant fragrance products and thoughtful gifts.",
    url: "https://www.aurasparkles.com",
    siteName: "Aura Sparkles",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handmade Scented Candles & Gifts | Aura Sparkles",
    description:
      "Discover Aura Sparkles handcrafted scented candles, decorative candles and perfumed wax sachets. Explore elegant fragrance products and thoughtful gifts.",
  },
};

export default function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <FragranceCategories />
      <BestsellersSection />
      <CollectionsSection />
      <BrandStorySection />
      <GiftingSection />
      <WhyChooseUs />
      <CustomerReviews />
      <InstagramGallery />
      <Newsletter />
    </div>
  );
}
