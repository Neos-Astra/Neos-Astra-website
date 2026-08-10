"use client";

import { usePathname } from "next/navigation";

interface NavItemProps {
  label: string;
  href: string;
  sectionId?: string;
  activeSection?: string;
  onClick?: () => void;
}

const NavItem = ({ label, href, sectionId, activeSection, onClick }: NavItemProps) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Active state: if on Home page, match sectionId with activeSection; else match pathname
  const isActive = isHome
    ? Boolean(activeSection && sectionId ? activeSection === sectionId : (href === "/" && (!activeSection || activeSection === "home")))
    : (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  const isMobile = !!onClick;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHome && sectionId) {
      const targetEl = document.getElementById(sectionId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }
    if (onClick) onClick();
  };

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
      <a href={href} onClick={handleClick} className={linkClass}>
        {label}
        {!isMobile && (
          <span
            className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-[#4DE8E0] transition-all duration-300 ${
              isActive ? "w-full shadow-[0_0_8px_rgba(77,232,224,0.6)]" : "w-0 group-hover:w-full"
            }`}
          />
        )}
      </a>
    </li>
  );
};

export default NavItem;
