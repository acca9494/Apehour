import { HeroSection } from "@/components/home/hero-section";
import { HomeSections } from "@/components/home/home-sections";
import { getPromotions } from "@/lib/services/promotions";
import { getReviews } from "@/lib/services/reviews";
import { getAllActiveEvents } from "@/lib/events/service";

export default async function HomePage() {
  const [promotions, reviews, events] = await Promise.all([
    getPromotions(),
    getReviews(),
    getAllActiveEvents(),
  ]);

  return (
    <>
      <HeroSection />
      <HomeSections promotions={promotions} reviews={reviews} events={events.slice(0, 4)} />
    </>
  );
}
