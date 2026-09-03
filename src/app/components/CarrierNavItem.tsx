"use client";

import NavItem from "./NavItem";

type Props = { onClick?: () => void };

export default function CarrierNavItem({ onClick }: Props) {
  return <NavItem label="Carrier" href="/carrier" onClick={onClick} />;
}
