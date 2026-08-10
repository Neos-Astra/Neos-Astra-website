"use client";

import NavItem from "./NavItem";

type Props = { activeSection?: string; onClick?: () => void };

export default function TeamNavItem({ activeSection, onClick }: Props) {
  return <NavItem label="Team" href="/team" sectionId="team" activeSection={activeSection} onClick={onClick} />;
}
