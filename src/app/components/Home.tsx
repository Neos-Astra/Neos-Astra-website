"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import {
  Cpu,
  Sparkles,
  Globe,
  Users,
  Rocket,
  ArrowRight,
  Zap,
  BookOpen,
  Award,
} from "lucide-react";

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

export interface EventHighlight {
  id?: string;
  img: string;
  title: string;
  date?: string;
}

// Recent events — update image paths / titles / dates as new events happen
export const RECENT_EVENTS: EventHighlight[] = [
  { id: "ev-1", img: "/event1.jpg", title: "Classroom & Tech Session", date: "Jul 2026" },
  { id: "ev-2", img: "/event2.jpg", title: "Robotics Car Demonstration", date: "Jul 2026" },
  { id: "ev-3", img: "/event3.jpg", title: "Microscope & Science Experimentation", date: "Jun 2026" },
  { id: "ev-4", img: "/event4.jpg", title: "Robotics Practical Hands-on", date: "Jun 2026" },
  { id: "ev-5", img: "/event5.jpg", title: "Lab Learning & Microscopy", date: "May 2026" },
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

/* ------------------------------------------------------------------ */
/*  3D HERO BACKGROUND — AI chip with glowing data lines (r3f)         */
/* ------------------------------------------------------------------ */
const CYAN = "#4DE8E0";
const BLUE = "#64B5F6";
const PURPLE = "#8B7CFF";
const PALETTE = [CYAN, BLUE, PURPLE];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// "AI" text drawn on a canvas -> texture (no font download needed)
function makeAITexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, CYAN);
  g.addColorStop(1, PURPLE);
  ctx.font = "800 360px system-ui, -apple-system, Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = CYAN;
  ctx.shadowBlur = 40;
  ctx.fillStyle = g;
  ctx.fillText("AI", size / 2, size / 2 + 12);
  ctx.shadowBlur = 0;
  ctx.fillText("AI", size / 2, size / 2 + 12);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

// Soft radial glow texture
function makeGlowTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(77,232,224,0.55)");
  g.addColorStop(0.4, "rgba(139,124,255,0.18)");
  g.addColorStop(1, "rgba(9,12,20,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// Round soft dot texture for the star particles
function makeDotTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function Particles({ mobile }: { mobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const count = mobile ? 160 : 320;

  const positions = useMemo(() => {
    const rand = mulberry32(99);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = rand() - 0.5;
    return arr;
  }, [count]);
  const texture = useMemo(() => makeDotTexture(), []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01;
  });

  return (
    <points ref={ref} scale={[viewport.width * 1.3, viewport.height * 1.3, 8]} position={[0, 1, -2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={CYAN}
        map={texture}
        size={mobile ? 0.08 : 0.07}
        sizeAttenuation
        transparent
        opacity={0.55}
        alphaTest={0.01}
        depthWrite={false}
      />
    </points>
  );
}

type Link = {
  curve: THREE.CatmullRomCurve3;
  end: THREE.Vector3;
  color: string;
  speed: number;
  offset: number;
};

function AIChipScene({ mobile }: { mobile: boolean }) {
  const { viewport } = useThree();
  const root = useRef<THREE.Group>(null);
  const pulses = useRef<(THREE.Group | null)[]>([]);
  const time = useRef(0);

  const aiTex = useMemo(() => makeAITexture(), []);
  const glowTex = useMemo(() => makeGlowTexture(), []);

  const { links, decor } = useMemo(() => {
    const rand = mulberry32(7);
    const grid = 0.9;
    const nLinks = mobile ? 20 : 38;
    const reach = mobile ? 3.4 : 6.2;
    const links: Link[] = [];

    for (let i = 0; i < nLinks; i++) {
      const th = (i / nLinks) * Math.PI * 2 + (rand() - 0.5) * 0.1;
      const dx = Math.cos(th);
      const dz = Math.sin(th);
      const edge = 1.1 / Math.max(Math.abs(dx), Math.abs(dz));
      const start = new THREE.Vector3(dx * edge, 0.14, dz * edge);

      const r = 3.4 + Math.pow(rand(), 0.8) * reach;
      const lat = (rand() - 0.5) * 2.6;
      const ex = Math.round((dx * r - dz * lat) / grid) * grid;
      const ez = Math.round((dz * r + dx * lat) / grid) * grid;
      const end = new THREE.Vector3(ex, 0.15, ez);

      const dir = end.clone().sub(start).normalize();
      const p1 = start.clone().add(new THREE.Vector3(dx * 0.8, 0.3, dz * 0.8));
      const p2 = start.clone().lerp(end, 0.55).add(new THREE.Vector3(-dz * lat * 0.25, 0.16, dx * lat * 0.25));
      const p3 = end.clone().sub(dir.multiplyScalar(0.2));
      const curve = new THREE.CatmullRomCurve3([start, p1, p2, p3], false, "catmullrom", 0.5);

      links.push({
        curve,
        end,
        color: PALETTE[i % 3],
        speed: 0.1 + rand() * 0.14,
        offset: rand(),
      });
    }

    const decor: { pos: THREE.Vector3; color: string }[] = [];
    const nDecor = mobile ? 10 : 28;
    for (let i = 0; i < nDecor; i++) {
      const th = rand() * Math.PI * 2;
      const r = 3 + rand() * (mobile ? 3.4 : 7);
      const x = Math.round((Math.cos(th) * r) / grid) * grid;
      const z = Math.round((Math.sin(th) * r) / grid) * grid;
      if (Math.abs(x) < 2.2 && Math.abs(z) < 2.2) continue;
      decor.push({ pos: new THREE.Vector3(x, 0.15, z), color: PALETTE[Math.floor(rand() * 3)] });
    }
    return { links, decor };
  }, [mobile]);

  useFrame((state, delta) => {
    time.current += delta;
    const t = time.current;
    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.lerp(
        root.current.rotation.y,
        Math.sin(t * 0.15) * 0.2 + state.pointer.x * 0.15,
        0.04
      );
    }
    links.forEach((l, i) => {
      const g = pulses.current[i];
      if (!g) return;
      const u = (t * l.speed + l.offset) % 1;
      l.curve.getPoint(u, g.position);
      g.scale.setScalar(0.45 + Math.sin(u * Math.PI) * 0.9);
    });
  });

  // laptop: scene lives in its own right-side zone, so fit the chip to that zone
  const scale = mobile ? Math.min(1.3, viewport.height / 6.5) : Math.min(1.05, viewport.width / 7.5, viewport.height / 8);
  const posX = mobile ? 0 : viewport.width * 0.02;
  const posY = mobile ? -0.2 : -0.3;

  return (
    <group ref={root} position={[posX, posY, 0]} scale={scale}>
      {/* board grid */}
      <gridHelper
        args={[44, 44, CYAN, PURPLE]}
        position={[0, -0.01, 0]}
        material-transparent
        material-opacity={0.1}
      />
      {/* glow under chip */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} />
      </mesh>

      {/* chip */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial color="#0E1424" metalness={0.7} roughness={0.35} emissive={PURPLE} emissiveIntensity={0.1} />
        <Edges color={CYAN} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[1.9, 0.08, 1.9]} />
        <meshStandardMaterial color="#17203A" metalness={0.8} roughness={0.3} />
        <Edges color={PURPLE} />
      </mesh>
      <mesh position={[0, 0.585, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial map={aiTex} transparent depthWrite={false} />
      </mesh>

      {/* data lines */}
      {links.map((l, i) => (
        <mesh key={`t${i}`}>
          <tubeGeometry args={[l.curve, 40, 0.014, 5, false]} />
          <meshBasicMaterial color={l.color} transparent opacity={0.55} />
        </mesh>
      ))}

      {/* node cubes at line ends */}
      {links.map((l, i) => (
        <mesh key={`c${i}`} position={l.end}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#141B2D" metalness={0.6} roughness={0.35} emissive={l.color} emissiveIntensity={0.25} />
          <Edges color={l.color} />
        </mesh>
      ))}

      {/* decorative cubes */}
      {decor.map((d, i) => (
        <mesh key={`d${i}`} position={d.pos}>
          <boxGeometry args={[0.26, 0.26, 0.26]} />
          <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.4} emissive={d.color} emissiveIntensity={0.12} />
          <Edges color={d.color} />
        </mesh>
      ))}

      {/* travelling light pulses */}
      {links.map((l, i) => (
        <group key={`p${i}`} ref={(el) => { pulses.current[i] = el; }}>
          <mesh>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshBasicMaterial color={l.color} transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </group>
      ))}

      <pointLight position={[0, 1.4, 0]} color={CYAN} intensity={35} distance={11} />
      <pointLight position={[3, 2, 3]} color={PURPLE} intensity={14} distance={10} />
    </group>
  );
}

function Scene({ split }: { split: boolean }) {
  const mobile = !split;
  return (
    <>
      <fog attach="fog" args={["#090C14", 13, 32]} />
      <ambientLight intensity={0.7} />
      <Particles mobile={mobile} />
      <AIChipScene mobile={mobile} />
    </>
  );
}

function HeroBackground3D({ split }: { split: boolean }) {
  // Render canvas only on client to avoid SSR issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 6, 10], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <Scene split={split} />
      </Canvas>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function Home({
  initialEventHighlights = RECENT_EVENTS,
}: {
  initialEventHighlights?: EventHighlight[];
}) {
  const eventHighlights = initialEventHighlights && initialEventHighlights.length > 0 ? initialEventHighlights : RECENT_EVENTS;

  // laptop/desktop (>=1024px): 3D scene gets its own zone on the right, never under the text
  const [split, setSplit] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setSplit(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <main className="min-h-screen bg-[#090C14] text-[#F3F6FB] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden px-6 md:px-12">
        {/* Background: theme glows + 3D animation */}
        <div className="absolute inset-0 z-0 bg-[#090C14]">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#4DE8E0]/10 blur-[130px] pointer-events-none" />
          <div className="absolute top-1/3 -right-20 h-[450px] w-[450px] rounded-full bg-[#8B7CFF]/10 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#090C14] to-transparent pointer-events-none" />
        </div>

        {/* laptop: 3D zone fills the right side of the hero; text stays on the left */}
        {split && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[5] [mask-image:linear-gradient(to_right,transparent_0%,black_22%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_22%)]"
            style={{
              left: "calc((100% - min(1280px, 100% - 96px)) / 2 + 0.56 * min(1280px, 100% - 96px))",
            }}
          >
            <HeroBackground3D split />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090C14] to-transparent" />
          </div>
        )}

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl w-full pt-4 pb-16 lg:py-20">
          {/* phone / tablet: 3D scene sits in its own block ABOVE the text (no overlap) */}
          {!split && (
            <div className="pointer-events-none relative -mx-6 mb-4 h-72 md:-mx-12 md:h-80 [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]">
              <HeroBackground3D split={false} />
            </div>
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl lg:max-w-[52%] [container-type:inline-size]"
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
              className="text-[clamp(1.65rem,5.3cqw,2.75rem)] font-extrabold leading-[1.2] tracking-tight text-[#F3F6FB] drop-shadow-[0_2px_20px_rgba(9,12,20,0.8)]"
            >
              <span className="block md:whitespace-nowrap">
                Our students build{" "}
                <span className="bg-gradient-to-r from-[#4DE8E0] to-[#64B5F6] bg-clip-text text-transparent">
                  real robots,
                </span>
              </span>
              <span className="block md:whitespace-nowrap">
                Train{" "}
                <span className="bg-gradient-to-r from-[#64B5F6] to-[#8B7CFF] bg-clip-text text-transparent">
                  real AI models,
                </span>
              </span>
              <span className="block md:whitespace-nowrap">
                Fly{" "}
                <span className="bg-gradient-to-r from-[#8B7CFF] to-[#4DE8E0] bg-clip-text text-transparent">
                  real drones.
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#8891A8]"
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

            {/* Stats row */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex items-center gap-6 sm:gap-8 border-t border-[#F3F6FB1a] pt-6"
            >
              {[
                { value: "5,000+", label: "Students" },
                { value: "4", label: "Tech Tracks" },
                { value: "100%", label: "Hands-on" },
              ].map((st, i) => (
                <div key={st.label} className={`flex flex-col ${i > 0 ? "border-l border-[#F3F6FB1a] pl-6 sm:pl-8" : ""}`}>
                  <span className="text-xl sm:text-2xl font-bold text-[#F3F6FB]">{st.value}</span>
                  <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#8891A8]">
                    {st.label}
                  </span>
                </div>
              ))}
            </motion.div>
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

          <motion.div variants={fadeInUp} className="mb-8">
            <h3 className="text-lg font-bold text-[#F3F6FB] mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4DE8E0]" /> Recent Highlights
            </h3>
          </motion.div>

          {/* Recent Events — Continuous Auto-Scrolling Gallery */}
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
            <div className="event-marquee flex w-max gap-5 py-2">
              {(eventHighlights.length < 5
                ? [...eventHighlights, ...eventHighlights, ...eventHighlights, ...eventHighlights]
                : [...eventHighlights, ...eventHighlights]
              ).map((ev, i) => (
                <div
                  key={`${ev.id || i}-${i}`}
                  className="group relative w-56 sm:w-64 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border border-[#1D2436] bg-[#090C14] hover:border-[#4DE8E066] transition-all hover:scale-105 shadow-xl cursor-pointer"
                >
                  <Image
                    src={ev.img}
                    alt={ev.title}
                    fill
                    sizes="(max-width: 640px) 224px, 256px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090C14ee] via-[#090C1433] to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-4 pointer-events-none">
                    <p className="text-sm font-semibold text-[#F3F6FB] leading-snug line-clamp-2 drop-shadow">
                      {ev.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
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

        {/* Stacked overlap cards */}
        <div className="relative flex flex-col gap-4">
          {TRACKS.map((track, i) => {
            const imageFirst = i % 2 === 1;
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
                    <Image
                      src={track.image}
                      alt={track.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
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