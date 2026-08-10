"use client";

import NavItem from "./NavItem";

type Props = { activeSection?: string; onClick?: () => void };

export default function EventsNavItem({ activeSection, onClick }: Props) {
  return <NavItem label="Events" href="/events" sectionId="events" activeSection={activeSection} onClick={onClick} />;
}
