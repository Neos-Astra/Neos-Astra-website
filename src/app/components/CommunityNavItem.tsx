"use client";

import NavItem from "./NavItem";

type Props = { onClick?: () => void };

export default function CommunityNavItem({ onClick }: Props) {
  return <NavItem label="Community" href="/community" onClick={onClick} />;
}
