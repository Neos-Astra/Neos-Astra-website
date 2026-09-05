"use client";

import { Instagram, Facebook, Linkedin, Mail, ArrowUp } from "lucide-react";



const FOOTER_LINKS = {
  Explore: [
    { label: "Courses", href: "/courses" },
    { label: "Team", href: "/team" },
    { label: "Events", href: "/events" },
    { label: "Career", href: "/career" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Contact: [
    { label: "Contact Us", href: "/contact" },
    { label: "neos.astra.india@gmail.com", href: "mailto:neos.astra.india@gmail.com" },
    { label: "+91 98765 43210", href: "tel:+919876543210" },
  ],
};

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/neos-astra/posts/", icon: Linkedin },
  { label: "Email", href: "mailto:neos.astra.india@gmail.com", icon: Mail },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#1D2436] bg-[#090C14] px-6 pb-8 pt-16 md:px-12 relative z-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 border-b border-[#1D2436] pb-12 md:grid-cols-4">
        {/* Brand column */}
        <div className="md:col-span-1">
          <a href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="Neos Astra Logo"
              className="h-10 w-10 md:h-11 md:w-11 rounded-full object-cover bg-white ring-2 ring-[#4DE8E0]/40 transition-transform duration-300 group-hover:scale-105 shadow-md shadow-[#4DE8E0]/10"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[#F3F6FB] text-lg leading-tight group-hover:text-[#4DE8E0] transition-colors">
                NEOS <span className="text-[#4DE8E0]">ASTRA</span>
              </span>
              <span className="text-[10px] tracking-wider text-[#8891A8] uppercase font-semibold">
                School of Innovation
              </span>
            </div>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#8891A8]">
            Next-gen education in artificial intelligence, robotics, and hands-on STEM — empowering future innovators.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h5 className="mb-4 font-mono text-xs uppercase tracking-wider text-[#4DE8E0] font-semibold">
              {heading}
            </h5>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#8891A8] transition-colors hover:text-[#F3F6FB]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 pt-8 text-xs text-[#8891A8]">
        <span>© {new Date().getFullYear()} Neos Astra - School of Innovation. All rights reserved.</span>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {SOCIALS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-all hover:border-[#4DE8E0] hover:text-[#4DE8E0] hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-all hover:border-[#4DE8E0] hover:text-[#4DE8E0] hover:scale-105 ml-2"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}