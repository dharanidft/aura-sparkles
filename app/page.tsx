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
