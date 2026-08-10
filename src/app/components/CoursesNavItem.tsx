"use client";

import NavItem from "./NavItem";

type Props = { onClick?: () => void };

export default function CoursesNavItem({ onClick }: Props) {
  return <NavItem label="Courses" href="/courses" onClick={onClick} />;
}
