"use client";

import NavItem from "./NavItem";

type Props = { activeSection?: string; onClick?: () => void };

export default function CommunityNavItem({ activeSection, onClick }: Props) {
  return <NavItem label="Community" href="/community" sectionId="community" activeSection={activeSection} onClick={onClick} />;
}
