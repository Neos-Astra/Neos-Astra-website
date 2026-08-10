"use client";

import NavItem from "./NavItem";

type Props = { onClick?: () => void };

export default function TeamNavItem({ onClick }: Props) {
  return <NavItem label="Team" href="/team" onClick={onClick} />;
}
