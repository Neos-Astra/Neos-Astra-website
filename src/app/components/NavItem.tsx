"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItemProps {
  label: string;
  href: string;
  onClick?: () => void;
}

const NavItem = ({ label, href, onClick }: NavItemProps) => {
  const pathname = usePathname();

  // Active state based strictly on current page route URL
  const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
  const isMobile = !!onClick;

  const linkClass = isMobile
    ? `block rounded-md px-2 py-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#0F1420] text-[#4DE8E0] font-semibold"
          : "text-[#8891A8] hover:bg-[#0F1420] hover:text-[#F3F6FB]"
      }`
    : `group relative text-sm font-medium transition-colors ${
        isActive ? "text-[#4DE8E0] font-semibold" : "text-[#8891A8] hover:text-[#F3F6FB]"
      }`;

  return (
    <li key={href}>
      <Link href={href} onClick={onClick} className={linkClass}>
        {label}
        {!isMobile && (
          <span
            className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-[#4DE8E0] transition-all duration-300 ${
              isActive ? "w-full shadow-[0_0_8px_rgba(77,232,224,0.6)]" : "w-0 group-hover:w-full"
            }`}
          />
        )}
      </Link>
    </li>
  );
};

export default NavItem;
