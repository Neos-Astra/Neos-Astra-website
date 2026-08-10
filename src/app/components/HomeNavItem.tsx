"use client";

import NavItem from "./NavItem";

type Props = { onClick?: () => void };

export default function HomeNavItem({ onClick }: Props) {
  return <NavItem label="Home" href="/" onClick={onClick} />;
}
