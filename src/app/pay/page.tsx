"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import {
  CreditCard,
  Building2,
  User,
  Mail,
  GraduationCap,
  Copy,
  Check,
  Smartphone,
  QrCode,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Upload,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";

export default function DirectUPIPaymentPage() {
  // Form fields in exact required order
  const [studentName, setStudentName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [classGrade, setClassGrade] = useState("");

  // Post-payment optional verification fields
  const [utrNumber, setUtrNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Flow & UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecordId, setSubmittedRecordId] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fixed payment configuration
  const MERCHANT_UPI_ID = "3451323a@bandhan";
  const PAYEE_NAME = "Neos Astra";
  const FIXED_AMOUNT = "2006.00";
  const DISPLAY_AMOUNT = "₹2,006";
  const TRANSACTION_NOTE = "Neos Astra Student Registration";

  // Standard URL-encoded UPI Payment URI
  const upiPaymentUri = `upi://pay?pa=${encodeURIComponent(
    MERCHANT_UPI_ID
  )}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${encodeURIComponent(
    FIXED_AMOUNT
  )}&cu=INR&tn=${encodeURIComponent(TRANSACTION_NOTE)}`;

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobileDevice(mobileRegex.test(userAgent.toLowerCase()));
    };
    checkMobile();
  }, []);

  // Generate QR code for standard UPI URI
  useEffect(() => {
    QRCode.toDataURL(upiPaymentUri, {
      width: 320,
      margin: 2,
      color: {
        dark: "#090C14",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [upiPaymentUri]);

  // Copy UPI ID to clipboard
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Handle Main Pay Now Button Click
  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate all fields
    if (!studentName.trim()) {
      setErrorMessage("Please enter the student's full name.");
      return;
    }
    if (!schoolName.trim()) {
      setErrorMessage("Please enter the school or college name.");
      return;
    }
    if (!emailId.trim() || !emailId.includes("@") || !emailId.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!classGrade.trim()) {
      setErrorMessage("Please enter your class / grade (e.g. Class 10, Class 12).");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Immediately record registration into database so Admin sees it in Pay Proofs
      const res = await fetch("/api/payment-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          schoolName: schoolName.trim(),
          emailId: emailId.trim().toLowerCase(),
          classGrade: classGrade.trim(),
          utrNumber: "",
          amount: FIXED_AMOUNT,
          paymentMethod: "UPI",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to record registration. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (data.submission?.id) {
        setSubmittedRecordId(data.submission.id);
      }

      // 2. Set flow state to payment initiated (shows "Payment submitted — awaiting verification")
      setPaymentInitiated(true);

      // 3. If on mobile, immediately trigger the UPI URI to launch installed UPI apps (GPay, PhonePe, Paytm, BHIM)
      if (isMobileDevice) {
        // Direct click event handler invocation for operating system URI handler
        window.location.href = upiPaymentUri;
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      setErrorMessage("Unable to initiate payment. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optional: Submit UTR Number or Screenshot after returning from UPI App
  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittedRecordId && !utrNumber.trim() && !file) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append("studentName", studentName.trim());
        formData.append("schoolName", schoolName.trim());
        formData.append("emailId", emailId.trim());
        formData.append("classGrade", classGrade.trim());
        formData.append("utrNumber", utrNumber.trim());
        formData.append("screenshot", file);

        await fetch("/api/payment-submissions", {
          method: "POST",
          body: formData,
        });
      } else if (submittedRecordId && utrNumber.trim()) {
        await fetch(`/api/payment-submissions/${submittedRecordId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "PENDING",
            adminNotes: `Class: ${classGrade} | Direct UPI ₹2,006 | UTR: ${utrNumber.trim()}`,
          }),
        });
      }

      setProofSubmitted(true);
    } catch (err) {
      console.error("Proof submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] selection:bg-[#4DE8E0]/30 selection:text-[#4DE8E0]">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-[#4DE8E0]/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-[#8B7CFF]/10 blur-[120px]" />
      </div>

      

      {/* Main Container */}
      <main className="relative mx-auto max-w-xl px-4 py-8 sm:py-12">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4DE8E0]/30 bg-[#4DE8E0]/10 px-3.5 py-1 text-xs font-semibold text-[#4DE8E0] mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> Direct Merchant UPI Payment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FB] tracking-tight">
            Student Registration & Fee Payment
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#8891A8] max-w-md mx-auto">
            Complete your registration details below and pay securely via any UPI app (GPay, PhonePe, Paytm, BHIM).
          </p>
        </div>

        {/* ================= STEP 1: REGISTRATION & PAYMENT FORM ================= */}
        {!paymentInitiated ? (
          <form
            onSubmit={handlePayNow}
            className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 sm:p-8 shadow-2xl space-y-6"
          >
            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Field 1: Student Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#8891A8] uppercase tracking-wider mb-2">
                <User className="h-3.5 w-3.5 text-[#4DE8E0]" />
                1. Student Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student full name"
                required
                className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/40 transition-all"
              />
            </div>

            {/* Field 2: School Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#8891A8] uppercase tracking-wider mb-2">
                <Building2 className="h-3.5 w-3.5 text-[#8B7CFF]" />
                2. School Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter current school / college name"
                required
                className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/40 transition-all"
              />
            </div>

            {/* Field 3: Email ID */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#8891A8] uppercase tracking-wider mb-2">
                <Mail className="h-3.5 w-3.5 text-[#4ADE80]" />
                3. Email ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="your.email@gmail.com"
                required
                className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/40 transition-all"
              />
            </div>

            {/* Field 4: Class */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#8891A8] uppercase tracking-wider mb-2">
                <GraduationCap className="h-3.5 w-3.5 text-[#FACC15]" />
                4. Class <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                placeholder="e.g. Class 9, Class 10, Class 12, Degree"
                required
                className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none focus:ring-1 focus:ring-[#4DE8E0]/40 transition-all"
              />
            </div>

            {/* Section 2: Fixed Payment Details Display */}
            <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-4.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8891A8]">Company Name</span>
                <span className="font-bold text-[#F3F6FB]">{PAYEE_NAME}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8891A8]">Payment Method</span>
                <span className="font-semibold text-[#4DE8E0] inline-flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> UPI (GPay / PhonePe / Paytm / BHIM)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8891A8]">Bandhan Merchant UPI ID</span>
                <span className="font-mono text-xs text-[#8B7CFF]">{MERCHANT_UPI_ID}</span>
              </div>
              <div className="pt-2.5 border-t border-[#1D2436] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#F3F6FB]">Monthly Subscription Fee</span>
                  <p className="text-[10px] text-[#8891A8]">Fixed standard rate • Non-editable</p>
                </div>
                <span className="text-xl font-extrabold text-[#4DE8E0]">
                  {DISPLAY_AMOUNT}
                </span>
              </div>
            </div>

            {/* Section 3: Prominent Pay Now Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-[#4DE8E0] via-[#5EEAD4] to-[#8B7CFF] px-6 py-4 text-sm sm:text-base font-bold text-[#090C14] transition-all hover:opacity-95 hover:shadow-lg hover:shadow-[#4DE8E0]/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <Smartphone className="h-5 w-5" />
                  Pay ₹2,006 via UPI
                </>
              )}
            </button>

            {/* Security notice */}
            <div className="flex items-start gap-2 text-[11px] text-[#8891A8] leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-[#4DE8E0] shrink-0 mt-0.5" />
              <span>
                Zero transaction fees. Payment directly transfers to Neos Astra's verified Bandhan Bank Merchant account.
              </span>
            </div>
          </form>
        ) : (
          /* ================= STEP 2: POST-PAYMENT CONFIRMATION & QR / VERIFICATION ================= */
          <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Status Banner */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-amber-300">
                Payment submitted — awaiting verification.
              </h2>
              <p className="mt-1 text-xs text-[#8891A8] max-w-md mx-auto">
                Thank you, <strong className="text-[#F3F6FB]">{studentName}</strong>! Your registration has been received. Our admin team will verify your payment through Bandhan Bank Merchant Pay transaction history.
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8891A8]">Student Name:</span>
                <span className="font-semibold text-[#F3F6FB]">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8891A8]">School & Class:</span>
                <span className="font-semibold text-[#F3F6FB]">{schoolName} ({classGrade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8891A8]">Email Address:</span>
                <span className="font-semibold text-[#F3F6FB]">{emailId}</span>
              </div>
              <div className="flex justify-between border-t border-[#1D2436] pt-2">
                <span className="text-[#8891A8]">Subscription Amount:</span>
                <span className="font-bold text-[#4DE8E0]">₹2,006.00</span>
              </div>
            </div>

            {/* Mobile UPI App Launcher & Fallback */}
            {isMobileDevice ? (
              <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-4 text-center space-y-3">
                <p className="text-xs text-[#8891A8]">
                  Did your UPI app not open automatically? Click below to retry:
                </p>
                <a
                  href={upiPaymentUri}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4DE8E0] px-4 py-3 text-sm font-bold text-[#090C14] hover:opacity-90 transition-all"
                >
                  <Smartphone className="h-4 w-4" /> Open Compatible UPI App
                </a>
                <p className="text-[10px] text-[#555E73]">
                  Works with Google Pay, PhonePe, Paytm, BHIM, or any UPI-enabled banking app.
                </p>
              </div>
            ) : (
              /* Desktop: High-Resolution Dynamic QR Code */
              <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-5 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#4DE8E0]">
                  <QrCode className="h-4 w-4" /> Scan to Pay with Any UPI App
                </div>

                {qrCodeDataUrl ? (
                  <div className="inline-block rounded-2xl bg-white p-3 shadow-lg">
                    <img
                      src={qrCodeDataUrl}
                      alt="UPI Payment QR Code"
                      className="h-56 w-56 sm:h-64 sm:w-64 object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center mx-auto text-xs text-[#8891A8]">
                    Generating QR code...
                  </div>
                )}

                <div className="text-xs text-[#8891A8]">
                  Amount: <strong className="text-[#4DE8E0]">₹2,006.00</strong> • Payee: <strong className="text-[#F3F6FB]">{PAYEE_NAME}</strong>
                </div>
              </div>
            )}

            {/* Manual UPI ID Details with 1-Click Copy */}
            <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-4 space-y-2">
              <span className="text-[11px] font-semibold text-[#8891A8] uppercase tracking-wider block">
                Bandhan Bank Merchant UPI Details
              </span>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-[#1D2436] bg-[#0F1420] px-3.5 py-2.5">
                <div>
                  <p className="text-[10px] text-[#8891A8]">Merchant UPI ID</p>
                  <p className="font-mono text-sm font-bold text-[#4DE8E0]">{MERCHANT_UPI_ID}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#4DE8E0]/40 bg-[#4DE8E0]/10 px-3 py-1.5 text-xs font-semibold text-[#4DE8E0] hover:bg-[#4DE8E0] hover:text-[#090C14] transition-all"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional UTR / Screenshot Attachment */}
            {!proofSubmitted ? (
              <form onSubmit={handleProofSubmit} className="space-y-4 pt-2 border-t border-[#1D2436]">
                <div>
                  <label className="text-xs font-semibold text-[#F3F6FB] block mb-1">
                    Have you completed the payment? (Optional)
                  </label>
                  <p className="text-[11px] text-[#8891A8] mb-2">
                    Enter the 12-digit UPI UTR number from your payment app to speed up verification:
                  </p>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 439201948120 (12-digit UTR)"
                    className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-2.5 text-xs text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none"
                  />
                </div>

                {/* Optional Screenshot */}
                <div>
                  <label className="text-xs font-semibold text-[#8891A8] block mb-1">
                    Attach Payment Screenshot (Optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile(f);
                        setFilePreview(URL.createObjectURL(f));
                      }
                    }}
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="flex items-center justify-between rounded-lg border border-[#4DE8E0]/30 bg-[#0A0D16] p-2 text-xs">
                      <span className="text-[#4DE8E0] truncate max-w-[200px]">{file?.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                        }}
                        className="text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1D2436] bg-[#0A0D16] py-2.5 text-xs text-[#8891A8] hover:border-[#4DE8E0]/40 hover:text-[#4DE8E0] transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload Screenshot
                    </button>
                  )}
                </div>

                {(utrNumber.trim() || file) && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-[#1D2436] hover:bg-[#2A344E] text-xs font-bold text-[#F3F6FB] py-2.5 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Submitting Proof..." : "Submit UTR / Screenshot for Faster Verification"}
                  </button>
                )}
              </form>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-xs text-emerald-400">
                <Check className="h-4 w-4 inline mr-1" /> UTR / Proof submitted! Admin will verify it shortly.
              </div>
            )}

            {/* Verification Disclaimer */}
            <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-4 text-[11px] text-[#8891A8] space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Info className="h-3.5 w-3.5 shrink-0" /> Important Verification Notice:
              </div>
              <p>
                Actual payments are verified directly using Bandhan Bank Merchant Pay transaction statements. Your account is not marked as paid simply because an app opened. Please allow up to 2-4 hours for verification during working hours.
              </p>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-[#8891A8] hover:text-[#4DE8E0] transition-colors"
              >
                ← Return to Neos Astra Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

