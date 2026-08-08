"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// ---------------------------------------------
// Neos Astra — About Page (Modern, image-rich)
// Palette: Deep Navy + Cyan / Violet
// Uses REAL Neos Astra photos instead of stock images
// ---------------------------------------------

const PILLARS = [
  {
    num: "01",
    title: "Project-first learning",
    desc: "You start building in week one. Concepts are introduced as you need them to solve the next problem.",
    image: "/event2.jpg",
  },
  {
    num: "02",
    title: "Real lab access",
    desc: "Physical robotics kits and microscopy equipment — not just recorded lectures.",
    image: "/event3.jpg",
  },
  {
    num: "03",
    title: "Industry-built curriculum",
    desc: "Courses are designed and reviewed by working engineers and educators, updated every term.",
    image: "/event4.jpg",
  },
];

// Real photos from our own sessions — replaces the old stock gallery
const GALLERY = ["/event1.jpg", "/event2.jpg", "/event5.jpg", "/event3.jpg"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#090C14] text-[#F3F6FB] overflow-x-hidden">
      {/* Hero: text + big rounded image */}
      <section className="px-6 pt-16 pb-14 md:px-12 md:pt-24">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#8B7CFF4d] bg-[#8B7CFF0d] px-4 py-1.5 font-mono text-xs text-[#8B7CFF]">
              ABOUT NEOS ASTRA
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-[46px] font-extrabold leading-[1.12] tracking-tight">
              We think in loops —{" "}
              <span className="bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] bg-clip-text text-transparent">
                sense, learn, act.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#8891A8]">
              Founded by engineers and educators from robotics labs and
              applied AI teams — we exist to close the gap between theory and
              a working prototype. No slideware. Every module ships something
              you can actually run.
            </p>
            <a
              href="/courses"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] px-6 py-3 text-sm font-semibold text-[#090C14] transition-transform hover:scale-105"
            >
              See our courses
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden border border-[#1D2436]">
              <img
                src="/event2.jpg"
                alt="Students building at Neos Astra"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090C14cc] via-transparent to-transparent" />
            </div>
            {/* Floating stat chip */}
            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-[#1D2436] bg-[#0F1420] px-6 py-4 shadow-2xl hidden sm:block">
              <div className="font-mono text-2xl font-bold bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] bg-clip-text text-transparent">
                50+
              </div>
              <div className="text-xs text-[#8891A8]">students building today</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pillars — image cards */}
      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-12 max-w-xl"
          >
            <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-[#4DE8E0]">
              Why Neos Astra
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Not another course platform. A build lab.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl border border-[#1D2436] bg-[#0F1420] overflow-hidden transition-colors hover:border-[#4DE8E066]"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 font-mono text-xs text-[#4DE8E0]">
                    {pillar.num}
                  </span>
                </div>
                <div className="p-6">
                  <h4 className="mb-2 text-base font-semibold">
                    {pillar.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-[#8891A8]">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery — life at Neos Astra */}
      <section className="px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="mb-8 flex items-end justify-between flex-wrap gap-4"
          >
            <div>
              <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-[#8B7CFF]">
                Behind the scenes
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Life at Neos Astra
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative overflow-hidden rounded-xl border border-[#1D2436] ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                }`}
              >
                <img
                  src={src}
                  alt="Neos Astra community"
                  className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission statement banner */}
      <section className="px-6 pb-24 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl relative overflow-hidden rounded-3xl border border-[#4DE8E033] bg-gradient-to-br from-[#0F1420] via-[#151C2C] to-[#090C14] p-10 md:p-14 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,124,255,0.12),transparent_70%)]" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Our mission
            </h3>
            <p className="text-sm md:text-base text-[#8891A8] leading-relaxed">
              To make artificial intelligence and robotics education
              hands-on, accessible, and grounded in real engineering practice
              — so every student leaves with skills that transfer directly to
              building things that matter.
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}