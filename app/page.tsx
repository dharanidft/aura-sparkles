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
  title: "Aura Sparkles — Handcrafted Soy Wax Candles & Home Fragrances India",
  description: "Indian home-fragrance studio dedicated to hand-poured 100% natural soy wax candles, botanical wax sachets, casting decor, and curated gifting. Tea lights from ₹160, signature jars from ₹249. Free shipping across India on orders ₹499+.",
  alternates: {
    canonical: "https://www.aurasparkles.com",
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
