"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail, Award, Sparkles } from "lucide-react";

interface TeamMemberItem {
  id?: string;
  name: string;
  role: string;
  badge: string | null;
  bio: string;
  image: string | null;
  linkedin: string | null;
  twitter: string | null;
  email: string | null;
}

const STATIC_TEAM_MEMBERS: TeamMemberItem[] = [
  {
    name: "Dr. Aris Thorne",
    role: "Founder & Chief Innovator",
    badge: "Leadership & AI",
    bio: "Ex-Robotics Lead with 12+ years of experience in autonomous systems and STEM education frameworks.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    linkedin: "#",
    twitter: "#",
    email: "mailto:aris@neosastra.com",
  },
  {
    name: "Elena Rostova",
    role: "Head of Robotics & Mechatronics",
    badge: "Hardware & IoT",
    bio: "Pioneer in embedded micro-controllers and hands-on lab experiments for next-gen engineers.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    linkedin: "#",
    twitter: "#",
    email: "mailto:elena@neosastra.com",
  },
  {
    name: "Vikram Malhotra",
    role: "Lead AI & Deep Learning Instructor",
    badge: "AI & Data Science",
    bio: "Specialist in Machine Learning architectures, Computer Vision pipelines, and neural network optimization.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    linkedin: "#",
    twitter: "#",
    email: "mailto:vikram@neosastra.com",
  },
  {
    name: "Sophia Chen",
    role: "Aerospace Tech Lead",
    badge: "Avionics & Drones",
    bio: "Aerospace engineer passionate about bringing modern drone technology and space principles to students.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
    linkedin: "#",
    twitter: "#",
    email: "mailto:sophia@neosastra.com",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data);
        } else {
          setMembers(STATIC_TEAM_MEMBERS);
        }
      })
      .catch(() => {
        setMembers(STATIC_TEAM_MEMBERS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#090C14] text-[#F3F6FB] px-4 py-12 sm:px-6 sm:py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20"
        >
          <motion.div
            variants={fadeInUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4DE8E04d] bg-[#4DE8E00d] px-3 py-1.5 sm:px-4 font-mono text-[10px] sm:text-xs text-[#4DE8E0]"
          >
            <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            WORLD CLASS EDUCATORS & INNOVATORS
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F3F6FB]"
          >
            Meet Our{" "}
            <span className="bg-gradient-to-r from-[#4DE8E0] via-[#64B5F6] to-[#8B7CFF] bg-clip-text text-transparent">
              Team
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-4 sm:mt-6 text-sm sm:text-lg leading-relaxed text-[#8891A8] px-2 sm:px-0"
          >
            Driven by passion, innovation, and industry expertise — our team of engineers,
            researchers, and mentors are dedicated to inspiring the next generation of STEM leaders.
          </motion.p>
        </motion.div>

        {/* Team Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1D2436] border-t-[#4DE8E0]" />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8"
          >
            {members.map((member, i) => {
              return (
                <motion.div
                  key={member.id || i}
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-xl sm:rounded-2xl border border-[#1D2436] bg-[#0F1420] p-3 sm:p-6 transition-all duration-300 hover:border-[#4DE8E066] hover:shadow-[0_12px_30px_rgba(77,232,224,0.12)] flex flex-col justify-between"
                >
                  <div>
                    {/* Avatar */}
                    <div className="relative mb-3 sm:mb-6 overflow-hidden rounded-lg sm:rounded-xl aspect-square w-full bg-[#1D2436]">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-2xl sm:text-3xl text-[#4DE8E0]">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent opacity-80" />
                      {member.badge && (
                        <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 rounded-full bg-[#090C14]/80 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-mono font-semibold text-[#4DE8E0] border border-[#4DE8E033] max-w-[85%] truncate">
                          {member.badge}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-[#4DE8E0] shrink-0" />
                      <h3 className="text-sm sm:text-xl font-bold text-[#F3F6FB] group-hover:text-[#4DE8E0] transition-colors truncate">
                        {member.name}
                      </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs font-semibold text-[#8B7CFF] mb-2 sm:mb-3 leading-snug">
                      {member.role}
                    </p>
                    <p className="text-[9px] sm:text-xs text-[#8891A8] leading-relaxed mb-3 sm:mb-6 line-clamp-3">
                      {member.bio}
                    </p>
                  </div>

                  {/* Socials */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-2.5 sm:pt-4 border-t border-[#1D2436]">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        aria-label="LinkedIn"
                        className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg border border-[#1D2436] bg-[#090C14] text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-colors"
                      >
                        <Linkedin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        aria-label="Twitter"
                        className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg border border-[#1D2436] bg-[#090C14] text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-colors"
                      >
                        <Twitter className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={member.email.startsWith("mailto:") ? member.email : `mailto:${member.email}`}
                        aria-label="Email"
                        className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg border border-[#1D2436] bg-[#090C14] text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-colors"
                      >
                        <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </main>
  );
}
