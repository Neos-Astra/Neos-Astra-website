"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

// ---------------------------------------------
// Neos Astra — Events Page
// Palette: Deep Navy + Cyan / Violet
// Shows events WE have organized, plus events WE
// are planning to organize next.
// ---------------------------------------------

// Past / hosted events — update this list whenever a new event happens.
// Reuses the same event photos already used on the Home page marquee.
const HOSTED_EVENTS = [
  {
    title: "Classroom & Tech Session",
    date: "July 2026",
    track: "Foundations",
    desc: "An interactive classroom session introducing students to the tools and mindset behind modern STEM learning.",
    image: "/event1.jpg",
  },
  {
    title: "Robotics Car Demonstration",
    date: "July 2026",
    track: "Robotics",
    desc: "Students built and demoed autonomous robotics cars, testing sensors, motors, and control logic hands-on.",
    image: "/event2.jpg",
  },
  {
    title: "Microscope & Science Experimentation",
    date: "June 2026",
    track: "Science Lab",
    desc: "A guided lab session exploring microscopy and experimental science techniques with real lab equipment.",
    image: "/event3.jpg",
  },
  {
    title: "Robotics Practical Hands-on",
    date: "June 2026",
    track: "Robotics",
    desc: "A practical, build-it-yourself robotics workshop covering assembly, wiring, and basic programming.",
    image: "/event4.jpg",
  },
  {
    title: "Lab Learning & Microscopy",
    date: "May 2026",
    track: "Science Lab",
    desc: "Deep-dive lab session focused on microscopy fundamentals and careful scientific observation.",
    image: "/event5.jpg",
  },
];

// Upcoming events — update this list as new events get planned.
const UPCOMING_EVENTS = [
  {
    title: "Drone Building Bootcamp",
    date: "Sep 15, 2026",
    track: "Aerospace",
    desc: "A full-day bootcamp where students assemble and fly their own drone from scratch, covering avionics basics.",
  },
  {
    title: "AI & ML Hackathon",
    date: "Oct 05, 2026",
    track: "Artificial Intelligence",
    desc: "A hands-on hackathon where student teams build and train real ML models to solve a live problem statement.",
  },
  {
    title: "IoT Innovation Fair",
    date: "Nov 20, 2026",
    track: "IoT",
    desc: "Students showcase connected-device projects, from smart sensors to cloud-linked dashboards.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#090C14] text-[#F3F6FB]">
      {/* Header */}
      <section className="px-4 pt-14 pb-8 sm:px-6 sm:pt-16 sm:pb-10 md:px-12 md:pt-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4DE8E04d] bg-[#4DE8E00d] px-3 py-1.5 sm:px-4 font-mono text-[10px] sm:text-xs text-[#4DE8E0]">
              LIFE AT NEOS ASTRA
            </span>
            <h1 className="max-w-2xl text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.15] tracking-tight">
              Events we've hosted, and what's coming next
            </h1>
            <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-[#8891A8]">
              From hands-on labs to full-day bootcamps — see what our students have
              already built together, and what we're planning next.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hosted / Past events */}
      <section className="px-4 pb-14 sm:px-6 sm:pb-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            className="mb-6 sm:mb-8 flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-[#4DE8E0]" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Events We've Hosted</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {HOSTED_EVENTS.map((event) => (
              <motion.div
                key={event.title}
                variants={fadeUp}
                className="group rounded-2xl border border-[#1D2436] bg-[#0F1420] overflow-hidden transition-colors hover:border-[#4DE8E066]"
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 sm:top-4 sm:left-4 rounded-full bg-[#090C14cc] px-2.5 py-1 sm:px-3 font-mono text-[9px] sm:text-[10px] text-[#4DE8E0] backdrop-blur-sm">
                    {event.track}
                  </span>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-[#8B7CFF]">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {event.date}
                  </div>
                  <h3 className="mb-2 text-sm sm:text-base font-semibold leading-snug group-hover:text-[#4DE8E0] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#8891A8]">
                    {event.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            className="mb-6 sm:mb-8 flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-[#8B7CFF]" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Upcoming Events</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {UPCOMING_EVENTS.map((event) => (
              <motion.div
                key={event.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-xl border border-[#1D2436] bg-[#0F1420] p-5 sm:p-6 hover:border-[#8B7CFF66] transition-colors"
              >
                <span className="inline-block rounded-full bg-[#8B7CFF1a] text-[#8B7CFF] text-[9px] sm:text-[10px] font-mono px-2.5 py-1 sm:px-3 mb-3 sm:mb-4">
                  {event.track}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#F3F6FB] mb-2">
                  {event.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8891A8] leading-relaxed mb-4">
                  {event.desc}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-[#4DE8E0]">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {event.date}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}