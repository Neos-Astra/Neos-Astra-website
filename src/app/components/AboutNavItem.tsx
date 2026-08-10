"use client";

import NavItem from "./NavItem";

type Props = { activeSection?: string; onClick?: () => void };

export default function AboutNavItem({ activeSection, onClick }: Props) {
  return <NavItem label="About" href="/about" sectionId="about" activeSection={activeSection} onClick={onClick} />;
}
