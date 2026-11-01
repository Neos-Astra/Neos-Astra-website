"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PaymentVerifyPage() {
  const [studentName, setStudentName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      if (dropped.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentName.trim() || !schoolName.trim() || !emailId.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (!file) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("studentName", studentName.trim());
      formData.append("schoolName", schoolName.trim());
      formData.append("emailId", emailId.trim());
      formData.append("utrNumber", utrNumber.trim());
      formData.append("screenshot", file);

      const res = await fetch("/api/payment-submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit. Please try again.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-[#090C14] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Success Animation */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30">
            <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#F3F6FB]">Payment Submitted! ✅</h1>
          <p className="mt-3 text-sm text-[#8891A8] leading-relaxed">
            Your payment details have been submitted successfully.<br />
            Our admin team will verify your payment shortly.
          </p>

          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-emerald-400 font-semibold">What happens next?</p>
            <p className="mt-1.5 text-xs text-[#8891A8]">
              Admin will review your payment screenshot and update the status. You will see the confirmation once verified.
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#4DE8E0] px-6 py-3 text-sm font-bold text-[#090C14] transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C14]">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#4DE8E0]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#8B7CFF]/5 blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#1D2436] bg-[#090C14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 shrink-0">
              <Image
                src="/logo.jpg"
                alt="Neos Astra Logo"
                fill
                sizes="36px"
                className="rounded-full object-cover bg-white ring-2 ring-[#4DE8E0]/40"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#F3F6FB] text-sm leading-tight group-hover:text-[#4DE8E0] transition-colors">
                NEOS <span className="text-[#4DE8E0]">ASTRA</span>
              </span>
              <span className="text-[9px] tracking-wider text-[#8891A8] uppercase font-semibold">
                Payment Verification
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs text-[#8891A8] hover:text-[#4DE8E0] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="relative mx-auto max-w-xl px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4DE8E0] to-[#8B7CFF] shadow-lg shadow-[#4DE8E0]/20">
            <svg className="h-7 w-7 text-[#090C14]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F3F6FB]">Submit Payment Proof</h1>
          <p className="mt-2 text-sm text-[#8891A8]">
            Fill in your details and upload the payment screenshot for verification
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 sm:p-8 shadow-xl"
        >
          {/* Error Alert */}
          {error && (
            <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          {/* Student Name */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold text-[#8891A8] uppercase tracking-wider">
              Student Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/30 transition-all"
            />
          </div>

          {/* School Name */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold text-[#8891A8] uppercase tracking-wider">
              School / College Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Enter your school or college name"
              required
              className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/30 transition-all"
            />
          </div>

          {/* Email ID */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold text-[#8891A8] uppercase tracking-wider">
              Email ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/30 transition-all"
            />
          </div>

          {/* UTR Number */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold text-[#8891A8] uppercase tracking-wider">
              UTR / Transaction Number <span className="text-[#555E73]">(Optional)</span>
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 439201948120"
              className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/30 transition-all"
            />
          </div>

          {/* Payment Screenshot Upload */}
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-semibold text-[#8891A8] uppercase tracking-wider">
              Payment Screenshot <span className="text-rose-400">*</span>
            </label>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {preview ? (
              <div className="relative rounded-xl border border-[#4DE8E0]/30 bg-[#0A0D16] p-3 overflow-hidden">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={preview}
                    alt="Payment Screenshot Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-[#8891A8] truncate max-w-[200px]">
                    {file?.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1D2436] bg-[#0A0D16] px-6 py-10 transition-all hover:border-[#4DE8E0]/40 hover:bg-[#0F1420]"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4DE8E0]/10">
                  <svg className="h-6 w-6 text-[#4DE8E0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#F3F6FB]">
                  Click to upload or drag & drop
                </p>
                <p className="mt-1 text-xs text-[#555E73]">
                  JPG, PNG, or WEBP • Max 5MB
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] px-6 py-3.5 text-sm font-bold text-[#090C14] transition-all hover:opacity-95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4DE8E0]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Payment Proof"
            )}
          </button>

          {/* Info Box */}
          <div className="mt-5 rounded-xl border border-[#1D2436] bg-[#0A0D16] p-4">
            <p className="text-[11px] text-[#8891A8] leading-relaxed">
              <strong className="text-[#4DE8E0]">ℹ️ Note:</strong> After submission, our admin team will verify your payment within 24 hours. Please ensure the screenshot is clear and shows the full transaction details.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

