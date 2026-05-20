import { HeroSection } from "@/components/home/hero-section";
import { HomeSections } from "@/components/home/home-sections";
import { getPromotions } from "@/lib/services/promotions";
import { getReviews } from "@/lib/services/reviews";

export default async function HomePage() {
  const [promotions, reviews] = await Promise.all([
    getPromotions(),
    getReviews(),
  ]);

  return (
    <>
      <HeroSection />
      <HomeSections promotions={promotions} reviews={reviews} />
    </>
  );
}
