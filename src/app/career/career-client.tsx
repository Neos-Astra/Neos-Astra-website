"use client";

import { useState } from "react";
import { Briefcase, MapPin, Clock, DollarSign, Send, Search, Sparkles, CheckCircle2, ChevronRight, X, ArrowUpRight } from "lucide-react";

type JobOpening = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string | null;
  salary: string | null;
  applyLink: string | null;
  createdAt: any;
};

export default function CareerClient({ initialJobs }: { initialJobs: JobOpening[] }) {
  const [jobs] = useState<JobOpening[]>(initialJobs);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeJobModal, setActiveJobModal] = useState<JobOpening | null>(null);

  // Extract unique departments
  const departments = ["ALL", ...Array.from(new Set(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((job) => {
    const matchesDept = selectedDept === "ALL" || job.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getApplyHref = (job: JobOpening) => {
    if (job.applyLink && job.applyLink.trim().length > 0) {
      if (job.applyLink.startsWith("http://") || job.applyLink.startsWith("https://") || job.applyLink.startsWith("mailto:")) {
        return job.applyLink;
      }
      return `https://${job.applyLink}`;
    }
    return `mailto:neos.astra.india@gmail.com?subject=Application%20for%20${encodeURIComponent(job.title)}%20Position`;
  };

  return (
    <div className="relative">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#4DE8E0]/10 via-[#8B7CFF]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 md:px-12 md:pt-28 md:pb-20 text-center max-w-5xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#4DE8E0]/30 bg-[#4DE8E0]/10 text-xs font-mono text-[#4DE8E0] tracking-wider uppercase mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> CAREERS & OPPORTUNITIES
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F3F6FB] leading-tight">
          Shape the Future of <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#4DE8E0] via-[#64B5F6] to-[#8B7CFF] bg-clip-text text-transparent">
            AI & STEM Education
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[#8891A8] max-w-2xl mx-auto leading-relaxed">
          We are looking for passionate innovators, educators, engineers, and creators to help empower the next generation of pioneers at Neos Astra.
        </p>
      </section>

      {/* Search & Filter Bar */}
      <section className="px-6 md:px-12 max-w-6xl mx-auto mb-12">
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420]/80 p-4 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8891A8]" />
            <input
              type="text"
              placeholder="Search position or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] pl-10 pr-4 py-2.5 text-sm text-[#F3F6FB] placeholder-[#555E75] focus:border-[#4DE8E0] focus:outline-none transition-colors"
            />
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDept === dept
                    ? "bg-[#4DE8E0] text-[#090C14] shadow-[0_0_15px_rgba(77,232,224,0.3)]"
                    : "bg-[#151C2C] text-[#8891A8] hover:text-[#F3F6FB] border border-[#1D2436]"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings Grid */}
      <section className="px-6 md:px-12 max-w-6xl mx-auto pb-24">
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 sm:p-7 transition-all duration-300 hover:border-[#4DE8E0]/50 hover:shadow-[0_10px_30px_rgba(77,232,224,0.08)] hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="rounded-md border border-[#8B7CFF]/30 bg-[#8B7CFF]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#8B7CFF] uppercase">
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8891A8]">
                      <Clock className="h-3.5 w-3.5" /> {job.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#F3F6FB] group-hover:text-[#4DE8E0] transition-colors">
                    {job.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#8891A8]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#4DE8E0]" /> {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-[#4ADE80]" /> {job.salary}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-[#8891A8] line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#1D2436] flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveJobModal(job)}
                    className="text-xs font-semibold text-[#8891A8] hover:text-[#F3F6FB] flex items-center gap-1 transition-colors"
                  >
                    View details & requirements <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <a
                    href={getApplyHref(job)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#4DE8E0] px-4 py-2 text-xs font-bold text-[#090C14] transition-all hover:bg-[#38BDF8] hover:shadow-[0_0_15px_rgba(77,232,224,0.4)]"
                  >
                    Apply Now <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#1D2436] bg-[#0F1420] p-10 sm:p-16 text-center max-w-3xl mx-auto shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4DE8E0]/10 border border-[#4DE8E0]/30 text-[#4DE8E0] mb-6">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#F3F6FB]">No Active Job Openings Currently</h3>
            <p className="mt-3 text-sm text-[#8891A8] max-w-lg mx-auto leading-relaxed">
              We don't have an immediate opening matching your filter, but we're always looking for outstanding talent to join our team!
            </p>
            <div className="mt-8">
              <a
                href="mailto:neos.astra.india@gmail.com?subject=General%20Career%20Inquiry%20-%20Neos%20Astra"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4DE8E0] px-6 py-3 text-sm font-bold text-[#090C14] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(77,232,224,0.3)]"
              >
                <Send className="h-4 w-4" /> Send Open Application
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#1D2436] bg-[#0F1420] p-6 sm:p-8 text-[#F3F6FB] shadow-2xl">
            <button
              onClick={() => setActiveJobModal(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-md border border-[#8B7CFF]/30 bg-[#8B7CFF]/10 px-3 py-1 font-mono text-xs font-bold text-[#8B7CFF] uppercase">
                {activeJobModal.department}
              </span>
              <span className="rounded-md border border-[#4DE8E0]/30 bg-[#4DE8E0]/10 px-3 py-1 font-mono text-xs font-bold text-[#4DE8E0]">
                {activeJobModal.type}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F6FB]">
              {activeJobModal.title}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#8891A8] pb-6 border-b border-[#1D2436]">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#4DE8E0]" /> {activeJobModal.location}
              </span>
              {activeJobModal.salary && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-[#4ADE80]" /> {activeJobModal.salary}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#4DE8E0]">
                Job Overview
              </h4>
              <p className="mt-2 text-sm text-[#C7CCDA] whitespace-pre-line leading-relaxed">
                {activeJobModal.description}
              </p>
            </div>

            {/* Requirements */}
            {activeJobModal.requirements && (
              <div className="mt-6 pt-6 border-t border-[#1D2436]">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#8B7CFF]">
                  Requirements & Qualifications
                </h4>
                <p className="mt-2 text-sm text-[#C7CCDA] whitespace-pre-line leading-relaxed">
                  {activeJobModal.requirements}
                </p>
              </div>
            )}

            {/* Apply CTA */}
            <div className="mt-8 pt-6 border-t border-[#1D2436] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#8891A8]">
                Ready to make an impact? Submit your application directly to our team.
              </p>
              <a
                href={getApplyHref(activeJobModal)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#4DE8E0] px-6 py-3 text-sm font-bold text-[#090C14] transition-all hover:bg-[#38BDF8] hover:shadow-[0_0_20px_rgba(77,232,224,0.4)]"
              >
                Apply for this role <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
