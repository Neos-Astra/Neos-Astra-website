import EventsComponent from "../components/events/EventsComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Workshops | Neos Astra - School of Innovation",
  description: "From hands-on robotics labs to full-day AI bootcamps — see what our students have built together, and what's coming next.",
};

export default function EventsPage() {
  return <EventsComponent />;
}
