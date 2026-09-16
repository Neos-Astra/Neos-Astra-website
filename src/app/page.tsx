import HomeComponent, {
  FALLBACK_HERO_IMAGES,
  RECENT_EVENTS,
  EventHighlight,
} from "./components/Home";
import { prisma } from "@/superadmin/prisma/client";

// ISR: Cache homepage for 1 hour at Vercel Edge CDN, background revalidation
export const revalidate = 3600;

export default async function Home() {
  let heroImages = FALLBACK_HERO_IMAGES;
  let eventHighlights: EventHighlight[] = RECENT_EVENTS;

  try {
    const data = await prisma.homeMedia.findMany({
      orderBy: { position: "asc" },
    });
    if (data && data.length > 0) {
      heroImages = data.map((m) => m.imageUrl);
      eventHighlights = data.map((m, idx) => ({
        id: m.id || `ev-${idx}`,
        img: m.imageUrl,
        title: m.title?.trim() || `STEM Innovation Moment ${idx + 1}`,
        date: "2026",
      }));
    }
  } catch (error) {
    console.error("Failed to load home media on server:", error);
  }

  return (
    <HomeComponent
      initialHeroImages={heroImages}
      initialEventHighlights={eventHighlights}
    />
  );
}
