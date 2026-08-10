"use client";

import NavItem from "./NavItem";

type Props = { activeSection?: string; onClick?: () => void };

export default function CoursesNavItem({ activeSection, onClick }: Props) {
  return <NavItem label="Courses" href="/courses" sectionId="courses" activeSection={activeSection} onClick={onClick} />;
}
