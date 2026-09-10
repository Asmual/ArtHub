import CategorySection from "@/components/home/CategorySection";
import FeaturedArtworks from "@/components/home/FeaturedArtworks";
import Hero from "@/components/home/Hero";
import TopArtists from "@/components/home/TopArtists";
import SmoothSection from "@/components/shared/SmoothSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <SmoothSection>
        <FeaturedArtworks />
      </SmoothSection>
      <SmoothSection>
        <TopArtists />
      </SmoothSection>
      <SmoothSection>
        <CategorySection />
      </SmoothSection>
    </main>
  );
}
