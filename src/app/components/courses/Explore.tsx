"use client";

import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// Neos Astra — Course Enrollment Form (FINAL VERSION)
// All issues fixed: layout, scrolling, navigation, footer
// ---------------------------------------------------------------------------

const COURSES = [
  {
    id: "robotics-ai",
    name: "Robotics & AI",
    subtitle: "Hands-on Engineering Program",
    duration: "4 Weeks",
    admissionFee: "₹2,000",
    kitPrice: "₹1,100",
    total: "₹3,100",
    highlights: [
      "Build real robots from scratch",
      "AI & Machine Learning basics",
      "Sensors, Arduino & IoT",
      "Live project + certification",
    ],
    badge: "Most Popular",
  },
];

type FormData = {
  studentName: string;
  dob: string;
  gender: string;
  classGrade: string;
  school: string;
  studentPhone: string;
  studentEmail: string;
  guardianName: string;
  courseTitle: string;
  message: string;
};

const emptyForm: FormData = {
  studentName: "",
  dob: "",
  gender: "",
  classGrade: "",
  school: "",
  studentPhone: "",
  studentEmail: "",
  guardianName: "",
  courseTitle: "Robotics & AI",
  message: "",
};

type RegistrationResult = {
  registrationNo: string;
  submittedAt: string;
  data: FormData;
};

interface CourseItem {
  id: string;
  name: string;
  subtitle: string;
  duration: string;
  admissionFee: string;
  kitPrice: string;
  total: string;
  highlights: string[];
  badge: string;
}

export default function Explore() {
  const [coursesList, setCoursesList] = useState<CourseItem[]>(COURSES);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState<RegistrationResult | null>(null);
  const [apiError, setApiError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseItem>(COURSES[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const courseParam = params.get("course");
      if (courseParam) {
        const match = COURSES.find(
          (item) => item.name.toLowerCase() === courseParam.toLowerCase()
        );
        if (match) {
          setSelectedCourse(match);
          setForm((prev) => ({ ...prev, courseTitle: match.name }));
        }
      }
    }

    fetch("/api/courses")
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CourseItem[] = data.map((c: any) => ({
            id: c.id,
            name: c.title || "Untitled Course",
            subtitle: c.track || c.category || "Engineering Program",
            duration: c.duration || "4 Weeks",
            admissionFee: c.admissionFee || "₹2,000",
            kitPrice: c.kitPrice || "₹1,100",
            total: c.price || "₹3,100",
            highlights: [
              "Build real projects from scratch",
              "AI & Technology fundamentals",
              "Sensors, Microcontrollers & IoT",
              "Live project + certification",
            ],
            badge: c.badge || "Popular",
          }));
          setCoursesList(mapped);

          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const courseParam = params.get("course");
            if (courseParam) {
              const match = mapped.find(
                (item) => item.name.toLowerCase() === courseParam.toLowerCase()
              );
              if (match) {
                setSelectedCourse(match);
                setForm((prev) => ({ ...prev, courseTitle: match.name }));
              } else {
                setSelectedCourse(mapped[0]);
                setForm((prev) => ({ ...prev, courseTitle: mapped[0].name }));
              }
            } else {
              setSelectedCourse(mapped[0]);
              setForm((prev) => ({ ...prev, courseTitle: mapped[0].name }));
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.studentName.trim()) next.studentName = "Required";
    if (!form.dob) next.dob = "Required";
    if (!form.gender) next.gender = "Required";
    if (!form.studentPhone.trim()) next.studentPhone = "Required";
    if (!form.studentEmail.trim()) next.studentEmail = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.studentEmail))
      next.studentEmail = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courseTitle: selectedCourse.name }),
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(json.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const submittedAt = new Date().toLocaleString("en-IN", {
        dateStyle: "long",
        timeStyle: "short",
      });

      setRegistration({
        registrationNo: json.registrationNo,
        submittedAt,
        data: { ...form, courseTitle: selectedCourse.name },
      });
    } catch (err) {
      setApiError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (registration) {
    return (
      <RegistrationReceipt
        registration={registration}
        course={selectedCourse}
        onNew={() => {
          setForm(emptyForm);
          setErrors({});
          setRegistration(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* ========== HEADER / NAVIGATION ========== */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">
              NEOS <span className="text-cyan-400">ASTRA</span>
            </span>
            <span className="hidden text-xs text-slate-500 sm:inline">School of Innovation</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Courses</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">About</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Team</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Events</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Community</a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-lg border border-white/10 px-4 py-1.5 text-sm text-slate-300 hover:bg-white/5 md:block">
              Login
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="block text-slate-300 hover:text-white md:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="border-t border-white/5 bg-[#030712]/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm">
              <a href="#" className="text-slate-300 hover:text-white">Home</a>
              <a href="#" className="text-slate-300 hover:text-white">Courses</a>
              <a href="#" className="text-slate-300 hover:text-white">About</a>
              <a href="#" className="text-slate-300 hover:text-white">Team</a>
              <a href="#" className="text-slate-300 hover:text-white">Events</a>
              <a href="#" className="text-slate-300 hover:text-white">Community</a>
              <button className="mt-2 rounded-lg border border-white/10 px-4 py-2 text-left text-slate-300 hover:bg-white/5">
                Login
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="relative overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Hero Badge */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              ENROLLMENT OPEN — 2026 BATCH
            </span>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Enroll in{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Neos Astra
              </span>
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              India's next-gen STEM program. Pick your course, fill your details,
              and secure your spot today.
            </p>
          </div>

          {/* ===== 2-COLUMN LAYOUT ===== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_480px]">
            {/* LEFT: Course Card */}
            <div className="space-y-4">
              {coursesList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setSelectedCourse(c); update("courseTitle", c.name); }}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    selectedCourse.id === c.id
                      ? "border-cyan-400/60 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                          {c.badge}
                        </span>
                        <span className="text-xs text-slate-500">• {c.duration}</span>
                      </div>
                      <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{c.name}</h2>
                      <p className="text-sm text-slate-400">{c.subtitle}</p>
                    </div>
                  </div>

                  {/* Highlights - 2 columns */}
                  <ul className="mt-4 grid grid-cols-2 gap-1.5">
                    {c.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Fee Breakdown - Compact Horizontal */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Admission</p>
                        <p className="font-bold text-white">{c.admissionFee}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Kit</p>
                        <p className="font-bold text-white">{c.kitPrice}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-px bg-white/10" />
                      <div>
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-xl font-bold text-cyan-400">{c.total}</p>
                      </div>
                    </div>
                  </div>

                  {selectedCourse.id === c.id && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Selected Course
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT: Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h2 className="text-base font-semibold text-white">Student Details</h2>
                <span className="text-xs text-slate-500">* Required</span>
              </div>

              {apiError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {apiError}
                </div>
              )}

              {/* ROW 1: Full Name (full width) */}
              <Field label="Student Full Name" required error={errors.studentName}>
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={form.studentName}
                  onChange={(e) => update("studentName", e.target.value)}
                  className={inputClass(!!errors.studentName)}
                />
              </Field>

              {/* ROW 2: DOB + Gender */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth" required error={errors.dob}>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => update("dob", e.target.value)}
                    className={inputClass(!!errors.dob)}
                  />
                </Field>
                <Field label="Gender" required error={errors.gender}>
                  <select
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className={inputClass(!!errors.gender)}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>

              {/* ROW 3: Class + School */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Class / Grade" optional>
                  <select
                    value={form.classGrade}
                    onChange={(e) => update("classGrade", e.target.value)}
                    className={inputClass(false)}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={`Class ${g}`}>Class {g}</option>
                    ))}
                    <option value="College">College</option>
                  </select>
                </Field>
                <Field label="School / College" optional>
                  <input
                    type="text"
                    placeholder="Institution name"
                    value={form.school}
                    onChange={(e) => update("school", e.target.value)}
                    className={inputClass(false)}
                  />
                </Field>
              </div>

              {/* ROW 4: Phone + Email */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone Number" required error={errors.studentPhone}>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.studentPhone}
                    onChange={(e) => update("studentPhone", e.target.value)}
                    className={inputClass(!!errors.studentPhone)}
                  />
                </Field>
                <Field label="Email Address" required error={errors.studentEmail}>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={form.studentEmail}
                    onChange={(e) => update("studentEmail", e.target.value)}
                    className={inputClass(!!errors.studentEmail)}
                  />
                </Field>
              </div>

              {/* ROW 5: Guardian (full) */}
              <Field label="Parent / Guardian Name" optional>
                <input
                  type="text"
                  placeholder="Guardian name"
                  value={form.guardianName}
                  onChange={(e) => update("guardianName", e.target.value)}
                  className={inputClass(false)}
                />
              </Field>

              {/* ROW 6: Message (full) */}
              <Field label="Message" optional>
                <textarea
                  rows={2}
                  placeholder="Any questions or requirements..."
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className={`${inputClass(false)} resize-none`}
                />
              </Field>

              {/* Summary Bar */}
              <div className="flex items-center justify-between rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm">
                <div>
                  <span className="text-slate-400">Enrolling for: </span>
                  <span className="font-semibold text-cyan-300">{selectedCourse.name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Total: </span>
                  <span className="text-lg font-bold text-white">{selectedCourse.total}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 py-3 font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Submitting...
                  </>
                ) : (
                  "🎓 Submit Enrollment"
                )}
              </button>
              <p className="text-center text-xs text-slate-500">
                By submitting, you agree to our terms and privacy policy.
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-white/5 bg-[#030712]/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="text-xl font-black tracking-tight">
                NEOS <span className="text-cyan-400">ASTRA</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                School of Innovation
              </p>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                Next-gen education in artificial intelligence, robotics, and
                hands-on STEM — empowering future innovators.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 className="text-sm font-semibold text-white">EXPLORE</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white">COMPANY</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white">CONTACT</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  hello@neosastra.com
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +91 98765 43210
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Neos Astra — School of Innovation. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------
function Field({
  label, required, optional, error, children,
}: {
  label: string; required?: boolean; optional?: boolean;
  error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400"> *</span>}
        {optional && <span className="text-slate-500"> (Optional)</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border ${
    hasError ? "border-red-500/60" : "border-slate-700"
  } bg-slate-900/60 px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-400`;
}

// ---------------------------------------------------------------------------
// Registration Receipt (on-screen) + printable pop-up
// ---------------------------------------------------------------------------
function RegistrationReceipt({
  registration, course, onNew,
}: {
  registration: RegistrationResult;
  course: CourseItem;
  onNew: () => void;
}) {
  const { registrationNo, submittedAt, data } = registration;

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Enrollment Confirmed 🎉</h1>
            <p className="text-sm text-slate-400">
              Saved to database · Print or save as PDF for your records.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onNew}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              New Enrollment
            </button>
            <button
              onClick={() => printReceipt({ registrationNo, submittedAt, data, course })}
              className="rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:opacity-90"
            >
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-xl font-black tracking-wide">
                NEOS <span className="text-cyan-400">ASTRA</span>
              </h2>
              <p className="text-xs text-slate-500">School of Innovation — Enrollment Receipt</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Registration No.</p>
              <p className="font-mono text-sm font-bold text-cyan-400">{registrationNo}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <ReceiptRow label="Student Name" value={data.studentName} />
            <ReceiptRow label="Date of Birth" value={data.dob || "—"} />
            <ReceiptRow label="Gender" value={data.gender || "—"} />
            <ReceiptRow label="Class / Grade" value={data.classGrade || "—"} />
            <ReceiptRow label="School / College" value={data.school || "—"} className="col-span-2" />
            <ReceiptRow label="Phone" value={data.studentPhone} />
            <ReceiptRow label="Email" value={data.studentEmail} />
            <ReceiptRow label="Parent / Guardian" value={data.guardianName || "—"} className="col-span-2" />
          </div>

          <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Course Enrolled</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-bold text-white">{course.name}</p>
                <p className="text-xs text-slate-500">{course.subtitle} · {course.duration}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Admission Fee</span>
                <span className="font-semibold text-white">{course.admissionFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kit Price</span>
                <span className="font-semibold text-white">{course.kitPrice}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="font-bold text-white">Total Amount</span>
                <span className="text-lg font-bold text-cyan-400">{course.total}</span>
              </div>
            </div>
          </div>

          {data.message && (
            <div className="mb-6">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Message</p>
              <p className="text-sm text-slate-300">{data.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
            <span>Submitted: {submittedAt}</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-400 font-semibold">
              ✓ Status: CONFIRMED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function printReceipt({
  registrationNo, submittedAt, data, course,
}: {
  registrationNo: string;
  submittedAt: string;
  data: FormData;
  course: CourseItem;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Neos Astra Enrollment Receipt — ${registrationNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 40px 50px; font-size: 13px; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #06b6d4; margin-bottom: 24px; }
    .brand-name { font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #0e1726; }
    .brand-name span { color: #06b6d4; }
    .brand-sub { font-size: 11px; color: #6b7280; margin-top: 3px; letter-spacing: 0.5px; }
    .reg-box { text-align: right; background: #f0fdfe; border: 1px solid #a5f3fc; border-radius: 8px; padding: 10px 16px; }
    .reg-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }
    .reg-no { font-family: monospace; font-size: 16px; font-weight: 800; color: #0891b2; margin-top: 3px; }

    .receipt-title { text-align: center; margin-bottom: 24px; }
    .receipt-title h2 { font-size: 16px; font-weight: 700; color: #111; letter-spacing: 1px; text-transform: uppercase; }
    .receipt-title p { font-size: 11px; color: #9ca3af; margin-top: 4px; }

    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #06b6d4; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }

    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full { grid-column: span 2; }
    .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; display: block; margin-bottom: 3px; }
    .field p { font-size: 13px; font-weight: 600; color: #111; }

    .fee-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .fee-table th { background: #f8fafc; text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
    .fee-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
    .fee-table tr:last-child td { border-bottom: none; background: #f0fdfe; font-weight: 700; font-size: 14px; color: #0891b2; }
    .course-name { font-weight: 700; font-size: 14px; }
    .course-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }

    .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #15803d; border: 1px solid #86efac; }

    .footer { margin-top: 32px; border-top: 2px dashed #e5e7eb; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer-left p { font-size: 11px; color: #9ca3af; line-height: 1.6; }
    .footer-right { text-align: right; }
    .footer-right .sig-line { border-top: 1px solid #111; width: 160px; margin-left: auto; padding-top: 4px; font-size: 10px; color: #9ca3af; }

    .watermark { position: fixed; bottom: 40px; right: 40px; font-size: 10px; color: #d1d5db; letter-spacing: 1px; }

    @media print {
      body { padding: 30px 40px; }
      .watermark { display: none; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="brand-name">NEOS <span>ASTRA</span></div>
      <div class="brand-sub">School of Innovation · STEM Education</div>
    </div>
    <div class="reg-box">
      <div class="reg-label">Registration No.</div>
      <div class="reg-no">${registrationNo}</div>
    </div>
  </div>

  <div class="receipt-title">
    <h2>Course Enrollment Receipt</h2>
    <p>Date: ${submittedAt}</p>
  </div>

  <div class="section">
    <div class="section-title">Student Information</div>
    <div class="grid2">
      <div class="field"><label>Student Name</label><p>${data.studentName}</p></div>
      <div class="field"><label>Date of Birth</label><p>${data.dob || "—"}</p></div>
      <div class="field"><label>Gender</label><p>${data.gender || "—"}</p></div>
      <div class="field"><label>Class / Grade</label><p>${data.classGrade || "—"}</p></div>
      <div class="field full"><label>School / Institution</label><p>${data.school || "—"}</p></div>
      <div class="field"><label>Phone Number</label><p>${data.studentPhone}</p></div>
      <div class="field"><label>Email Address</label><p>${data.studentEmail}</p></div>
      <div class="field full"><label>Parent / Guardian Name</label><p>${data.guardianName || "—"}</p></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Course & Fee Details</div>
    <table class="fee-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="course-name">${course.name}</div>
            <div class="course-sub">${course.subtitle} · ${course.duration}</div>
          </td>
          <td style="text-align:right"></td>
        </tr>
        <tr>
          <td>Admission Fee</td>
          <td style="text-align:right; font-weight:600">${course.admissionFee}</td>
        </tr>
        <tr>
          <td>Kit Price</td>
          <td style="text-align:right; font-weight:600">${course.kitPrice}</td>
        </tr>
        <tr>
          <td>Total Amount</td>
          <td style="text-align:right">${course.total}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${data.message ? `
  <div class="section">
    <div class="section-title">Additional Message</div>
    <p style="color:#374151;line-height:1.6">${data.message}</p>
  </div>` : ""}

  <div style="margin-bottom:24px">
    <span class="status">✓ Status: CONFIRMED</span>
  </div>

  <div class="footer">
    <div class="footer-left">
      <p><strong>Neos Astra — School of Innovation</strong></p>
      <p>hello@neosastra.com · +91 98765 43210</p>
      <p style="margin-top:6px;font-size:10px">This is a computer-generated receipt. No signature required.</p>
    </div>
    <div class="footer-right">
      <div class="sig-line">Authorized Signatory</div>
    </div>
  </div>

  <div class="watermark">NEOS ASTRA · ${new Date().getFullYear()}</div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=860,height=750");
  if (!printWin) {
    alert("Pop-up blocked! Allow popups for this site in your browser, then try again.");
    return;
  }
  printWin.document.write(html);
  printWin.document.close();
}

function ReceiptRow({
  label, value, className = "",
}: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 font-medium text-white">{value}</p>
    </div>
  );
}