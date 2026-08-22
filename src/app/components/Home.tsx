"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Sparkles,
  Globe,
  Users,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
  MessageCircle,
  User,
  GraduationCap,
  Bot,
} from "lucide-react";

// --------------------------------------------- 
// Neos Astra — Home Component (with Motion)
// Palette: Deep Navy + Cyan / Violet
// ---------------------------------------------

const FALLBACK_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1600&auto=format&fit=crop",
];

const TRACKS = [
  {
    icon: Cpu,
    title: "Robotics & Mechatronics",
    desc: "Build autonomous systems, sensors integration, and control algorithms from scratch.",
    badge: "Hardware & AI",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
    points: [
      "Hands-on builds with real sensors and actuators",
      "Control loops, motion planning, and PID tuning",
      "Weekly lab sessions with physical robot kits",
    ],
  },
  {
    icon: Sparkles,
    title: "Artificial Intelligence",
    desc: "Master Machine Learning models, Deep Learning architectures, and Computer Vision.",
    badge: "Next Gen",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
    points: [
      "Train models on real datasets from day one",
      "Deep learning, CV, and NLP fundamentals",
      "Deploy models into working applications",
    ],
  },
  {
    icon: Globe,
    title: "IoT & Embedded Systems",
    desc: "Connect physical devices with cloud architectures using real microcontrollers.",
    badge: "Cloud & Hardware",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    points: [
      "Program real microcontrollers and boards",
      "Connect devices to cloud dashboards live",
      "Build end-to-end IoT pipelines",
    ],
  },
  {
    icon: Rocket,
    title: "Drone & Tech Lab",
    desc: "Explore modern drone electronics, avionics, and space technology principles.",
    badge: "Advanced",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop",
    points: [
      "Drone assembly and flight electronics",
      "Avionics and navigation system basics",
      "Capstone build: a working flight prototype",
    ],
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Project-Based Learning",
    desc: "No boring theory. Work directly on industry-grade hardware kits and software pipelines.",
  },
  {
    icon: BookOpen,
    title: "Curated STEM Curriculum",
    desc: "Designed by domain experts to bridge the gap between academia and modern tech industry.",
  },
  {
    icon: Users,
    title: "1-on-1 Mentorship",
    desc: "Get personalized guidance from experienced engineers and tech innovators.",
  },
  {
    icon: Award,
    title: "Recognized Certification",
    desc: "Earn industry-backed credentials upon successfully building and demonstrating real projects.",
  },
];

// Recent events — update image paths / titles / dates as new events happen
const RECENT_EVENTS = [
  { img: "/event1.jpg", title: "Classroom & Tech Session", date: "Jul 2026" },
  { img: "/event2.jpg", title: "Robotics Car Demonstration", date: "Jul 2026" },
  { img: "/event3.jpg", title: "Microscope & Science Experimentation", date: "Jun 2026" },
  { img: "/event4.jpg", title: "Robotics Practical Hands-on", date: "Jun 2026" },
  { img: "/event5.jpg", title: "Lab Learning & Microscopy", date: "May 2026" },
];

// Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export default function Home() {
  const [activeImage, setActiveImage] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>(FALLBACK_HERO_IMAGES);
  const [eventHighlights, setEventHighlights] = useState(RECENT_EVENTS);

  // Fetch hero & highlight images from DB; fall back to hardcoded ones
  useEffect(() => {
    fetch("/api/home-media")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const urls = data.map((m: { imageUrl: string }) => m.imageUrl);
          setHeroImages(urls);
          setEventHighlights(
            data.map((m: { imageUrl: string }, idx: number) => ({
              img: m.imageUrl,
              title: RECENT_EVENTS[idx % RECENT_EVENTS.length]?.title || `STEM Innovation Moment ${idx + 1}`,
              date: "2026",
            }))
          );
        }
      })
      .catch(() => {
        // silently fall back to hardcoded images
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <main className="min-h-screen bg-[#090C14] text-[#F3F6FB] overflow-x-hidden">
      {/* Hero Section - Updated with New Interactive Block */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden px-6 md:px-12">
        {/* Background image carousel */}
        <div className="absolute inset-0 z-0">
        {heroImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="Neos Astra STEM Learning"
              className={`absolute inset-0 h-full w-full object-cover object-[center_30%] transition-opacity duration-1000 ease-in-out ${
                i === activeImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {/* Overlay now only strong on the LEFT (behind text), fades out on the right so image stays visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090C14] via-[#090C14cc] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090C14] via-transparent to-[#090C1499]" />
        </div>

        {/* Hero content with Framer Motion */}
        <div className="relative z-10 mx-auto max-w-7xl w-full py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT SIDE: Text & CTA */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-6"
          >
            <motion.div
              variants={fadeInUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4DE8E04d] bg-[#4DE8E00d] px-4 py-1.5 font-mono text-xs text-[#4DE8E0]"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4DE8E0]" />
              NEXT GEN EDUCATION PLATFORM
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-[#F3F6FB] drop-shadow-[0_2px_20px_rgba(9,12,20,0.8)]"
            >
              Unlock <br className="hidden sm:block" />
              Tomorrow <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#4DE8E0] via-[#64B5F6] to-[#8B7CFF] bg-clip-text text-transparent">
                with Future Technologies
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#E4E8F1] drop-shadow-[0_2px_10px_rgba(9,12,20,0.9)]"
            >
              We help students think creatively, solve real-world problems, and
              prepare for future opportunities in STEM through immersive, hands-on
              learning experiences.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="/courses"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] px-7 py-3.5 text-sm font-semibold text-[#090C14] shadow-lg shadow-[#4DE8E026] transition-all hover:scale-105 hover:shadow-[#4DE8E040]"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/about"
                className="flex items-center gap-2 rounded-full border border-[#F3F6FB33] bg-[#0F1420cc] px-7 py-3.5 text-sm font-semibold text-[#F3F6FB] backdrop-blur-sm transition-all hover:border-[#4DE8E066] hover:bg-[#151C2Cdd]"
              >
                Learn More
              </a>
            </motion.div>

            {/* Carousel dots */}
            <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show background ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeImage
                      ? "w-8 bg-[#4DE8E0]"
                      : "w-2 bg-[#F3F6FB4d] hover:bg-[#8891A8]"
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: NEW TRUSTED & AFFORDABLE BLOCK (Like your image) */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-6 flex flex-col items-center justify-center"
          >
            {/* The Interaction Card */}
            <div className="relative w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420]/90 p-6 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-[#4DE8E044]">
              
              {/* Floating Trust Badge (Top Right) */}
              <div className="absolute -top-4 -right-2 rounded-full bg-[#090C14] border border-[#4DE8E0] p-0.5">
                <div className="rounded-full px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#4DE8E0]">
                  <ShieldCheck className="h-4 w-4" /> Trusted Platform
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#F3F6FB] mb-6 flex items-center gap-2">
                <Users className="text-[#4DE8E0] h-6 w-6" /> Community Hub
              </h3>

              {/* Teacher-Student Interactive Section (Mimicking your image) */}
              <div className="flex flex-col gap-4 relative">
                
                {/* Student Bubble (Right) */}
                <div className="flex justify-end mb-2">
                  <div className="bg-[#1D2436] p-3 rounded-2xl rounded-tr-none max-w-[80%] border border-[#F3F6FB1a]">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-full bg-[#1D2436] flex items-center overflow-hidden border border-[#4DE8E0]">
                        <img src="/student.png" alt="Student" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs text-[#4DE8E0] font-mono">Student</p>
                        <p className="text-sm text-[#C7CCDA]">Sambit Sir, What is Neos Astra?</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Bubble (Left) */}
                <div className="flex justify-start">
                  <div className="bg-[#8B7CFF] p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-lg shadow-[#8B7CFF26]">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-full bg-[#090C14] flex items-center overflow-hidden border border-[#8B7CFF]">
                        <img src="/icon.png?v=2" alt="Mentor" className="h-full w-full object-cover object-center" />
                      </div>
                      <div>
                        <p className="text-xs text-[#090C14] font-mono font-bold">Mentor</p>
                        <p className="text-sm text-[#090C14] font-semibold">Neos Astra is a platform where students can learn with love and can grow with guidance</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connecting Dots (Decorative) */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-dashed border-[#F3F6FB1a] rounded-full opacity-30" />
                
                {/* Bottom Trust Metrics */}
                <div className="mt-4 pt-4 border-t border-[#1D2436] flex justify-between items-center text-xs text-[#8891A8]">
                   <span className="flex items-center gap-1 text-[#4DE8E0]"><MessageCircle className="h-3 w-3" /> 2k+ Conversations</span>
                   <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 5,000+ Students</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events & Moments Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "0px 0px -150px 0px" }}
        variants={staggerContainer}
        className="border-y border-[#1D2436] bg-[#0F1420]/50 py-16 px-6 md:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#4DE8E0] uppercase mb-3">
              Life at Neos Astra
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F6FB]">
              Events & Moments
            </p>
            <p className="mt-4 text-base text-[#8891A8]">
              From hands-on labs to upcoming hackathons — see what we're building together.
            </p>
          </motion.div>

          {/* Recent Events — Continuous Auto-Scrolling Gallery */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h3 className="text-lg font-bold text-[#F3F6FB] mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4DE8E0]" /> Recent Highlights
            </h3>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="relative w-full overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <div className="event-marquee flex w-max gap-4">
              {/* Render the list twice back-to-back for a seamless infinite loop */}
              {[...eventHighlights, ...eventHighlights].map((ev, i) => (
                <div
                  key={i}
                  className="group relative w-56 sm:w-64 shrink-0 aspect-[3/4] rounded-xl overflow-hidden border border-[#1D2436]"
                >
                  <img
                    src={ev.img}
                    alt={ev.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090C14ee] via-[#090C1440] to-transparent" />
                  <div className="absolute bottom-0 p-3">
                    <p className="text-xs font-semibold text-[#F3F6FB] leading-tight">{ev.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          .event-marquee {
            animation: scroll-marquee 28s linear infinite;
          }
          .event-marquee:hover {
            animation-play-state: paused;
          }
          @keyframes scroll-marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </motion.section>

      {/* Tech Tracks Section with Scroll Stagger */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "0px 0px -150px 0px" }}
        variants={staggerContainer}
        className="py-24 px-6 md:px-12 mx-auto max-w-7xl"
      >
        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold tracking-widest text-[#4DE8E0] uppercase mb-3">
            Core Specialized Tracks
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F6FB]">
            Master In-Demand STEM Fields
          </p>
          <p className="mt-4 text-base text-[#8891A8]">
            Comprehensive paths crafted to guide learners from fundamental concepts to building complex real-world systems.
          </p>
        </motion.div>

        {/* Stacked overlap cards: image on one side, text on other. Each card slides up and overlaps the previous as you scroll. */}
        <div className="relative flex flex-col gap-4">
          {TRACKS.map((track, i) => {
            const imageFirst = i % 2 === 1; // alternate image left/right
            return (
              <div
                key={i}
                className="sticky top-24"
                style={{ zIndex: i + 1 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1, margin: "0px 0px -200px 0px" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="rounded-2xl border border-[#1D2436] bg-[#0F1420] shadow-2xl shadow-black/50 overflow-hidden grid grid-cols-1 md:grid-cols-2"
                >
                  {/* Text side */}
                  <div
                    className={`p-8 md:p-12 flex flex-col justify-center ${
                      imageFirst ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <div className="mb-4 h-8 w-8 rounded-md bg-gradient-to-br from-[#4DE8E0] to-[#8B7CFF]" />
                    <span className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[#4DE8E0]">
                      {track.badge}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#F3F6FB] mb-3">
                      {track.title}
                    </h3>
                    <p className="text-sm md:text-base text-[#8891A8] leading-relaxed mb-6">
                      {track.desc}
                    </p>
                    <ul className="space-y-2.5 mb-8">
                      {track.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm text-[#C7CCDA]"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4DE8E0]" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="/courses"
                      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#4DE8E0] hover:underline"
                    >
                      Learn track
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Image side */}
                  <div
                    className={`relative min-h-[260px] md:min-h-[420px] ${
                      imageFirst ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    <img
                      src={track.image}
                      alt={track.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090C1466] via-transparent to-transparent md:bg-gradient-to-l md:from-[#090C1440] md:via-transparent md:to-transparent" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Why Neos Astra Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "0px 0px -150px 0px" }}
        variants={staggerContainer}
        className="py-20 px-6 md:px-12 bg-[#0F1420]/30 border-t border-[#1D2436]"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#8B7CFF] uppercase mb-3">
              Why Choose Us
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F6FB]">
              Empowering Next-Gen Innovators
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-5 rounded-xl border border-[#1D2436] bg-[#0F1420] p-6 transition-colors hover:border-[#8B7CFF66]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#8B7CFF1a] text-[#8B7CFF]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#F3F6FB] mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-[#8891A8] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 md:px-12 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px -150px 0px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-[#4DE8E033] bg-gradient-to-br from-[#0F1420] via-[#151C2C] to-[#090C14] p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,124,255,0.12),transparent_70%)]" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F6FB]">
              Ready to Shape the Future?
            </h2>
            <p className="mt-4 text-base text-[#8891A8]">
              Join thousands of students building cutting-edge skills in robotics, AI, and practical technology.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a
                href="/courses"
                className="rounded-full bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] px-8 py-3.5 text-sm font-semibold text-[#090C14] shadow-lg hover:scale-105 transition-transform"
              >
                Get Started Now
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}