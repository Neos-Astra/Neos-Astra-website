"use client";

import { useState, useEffect, useRef } from "react";
// ---------------------------------------------
// Neos Astra — Navbar with ScrollSpy Section Tracking
// Palette: Deep Navy + Cyan / Violet
// ---------------------------------------------

import HomeNavItem from "./HomeNavItem";
import CoursesNavItem from "./CoursesNavItem";
import AboutNavItem from "./AboutNavItem";
import TeamNavItem from "./TeamNavItem";
import EventsNavItem from "./EventsNavItem";
import CommunityNavItem from "./CommunityNavItem";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const sectionIds = ["home", "events", "courses", "about", "community"];

    const updateScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setScrolled(scrollY > 12);

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }

      // ScrollSpy: Determine active section as user scrolls down page
      const threshold = window.innerHeight * 0.35;
      let currentSection = "home";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold && rect.bottom >= 100) {
            currentSection = id;
          }
        }
      }

      setActiveSection(currentSection);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-transparent bg-[#0B1018]/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.35)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-12">
        {/* Logo */}
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

        {/* Desktop nav with ScrollSpy indicator tracking */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            <HomeNavItem activeSection={activeSection} />
            <CoursesNavItem activeSection={activeSection} />
            <AboutNavItem activeSection={activeSection} />
            <TeamNavItem activeSection={activeSection} />
            <EventsNavItem activeSection={activeSection} />
            <CommunityNavItem activeSection={activeSection} />
          </ul>
        </nav>

        {/* Login CTA (desktop) — navigates to /admin/login page */}
        <a
          href="/admin/login"
          id="navbar-login-btn"
          className="hidden rounded-md bg-[#4DE8E0] px-5 py-2.5 text-sm font-semibold text-[#090C12] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(77,232,224,0.25)] md:inline-block"
        >
          Login
        </a>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-6 bg-[#F3F6FB] transition-transform duration-200 ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-[#F3F6FB] transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-px w-6 bg-[#F3F6FB] transition-transform duration-200 ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-[#1D2436] transition-[max-height] duration-300 md:hidden ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          <HomeNavItem activeSection={activeSection} onClick={() => setMenuOpen(false)} />
          <CoursesNavItem activeSection={activeSection} onClick={() => setMenuOpen(false)} />
          <AboutNavItem activeSection={activeSection} onClick={() => setMenuOpen(false)} />
          <TeamNavItem activeSection={activeSection} onClick={() => setMenuOpen(false)} />
          <EventsNavItem activeSection={activeSection} onClick={() => setMenuOpen(false)} />
          <CommunityNavItem activeSection={activeSection} onClick={() => setMenuOpen(false)} />
          <li className="pt-2">
            <a
              href="/admin/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full rounded-md bg-[#4DE8E0] px-5 py-3 text-center text-sm font-semibold text-[#090C14]"
            >
              Login
            </a>
          </li>
        </ul>
      </div>

      {/* Smooth scroll progress bar */}
      <div className="h-[2px] w-full bg-[#1D2436]/60 overflow-hidden">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-[#4DE8E0] via-[#64B5F6] to-[#8B7CFF] transition-[width] duration-75 ease-out shadow-[0_0_10px_rgba(77,232,224,0.5)]"
          style={{ width: "0%" }}
        />
      </div>
    </header>
  );
}