"use client"

import NavItem from "./NavItem"

type Props = { onClick?: () => void }

export default function AboutNavItem({ onClick }: Props) {
  return <NavItem label="About" href="/about" onClick={onClick} />
}
