"use client";

// import removed; no longer needed

interface NavItemProps {
  label: string;
  href: string;
  onClick?: () => void;
}

const NavItem = ({ label, href, onClick }: NavItemProps) => {
  const isMobile = !!onClick;
  const linkClass = isMobile
    ? "block rounded-md px-2 py-3 text-sm font-medium text-[#8891A8] transition-colors hover:bg-[#0F1420] hover:text-[#F3F6FB]"
    : "group relative text-sm font-medium text-[#8891A8] transition-colors hover:text-[#F3F6FB]";

  return (
    <li key={href}>
      <a href={href} onClick={onClick} className={linkClass}>
        {label}
        {!isMobile && (
          <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[#4DE8E0] transition-all duration-200 group-hover:w-full" />
        )}
      </a>
    </li>
  );
};

export default NavItem;
