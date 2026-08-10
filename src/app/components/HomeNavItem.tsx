"use client";

import NavItem from "./NavItem";

type Props = { activeSection?: string; onClick?: () => void };

export default function HomeNavItem({ activeSection, onClick }: Props) {
  return <NavItem label="Home" href="/" sectionId="home" activeSection={activeSection} onClick={onClick} />;
}
