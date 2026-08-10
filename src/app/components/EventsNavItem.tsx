"use client";

import NavItem from "./NavItem";

type Props = { onClick?: () => void };

export default function EventsNavItem({ onClick }: Props) {
  return <NavItem label="Events" href="/events" onClick={onClick} />;
}
