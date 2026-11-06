"use client";

import { useState, useEffect, useMemo } from "react";
import AdminShell from "@/app/components/AdminShell";
import Image from "next/image";
import {
  FileCheck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  Trash2,
  AlertTriangle,
  Mail,
  Building2,
  User,
  Hash,
  Calendar,
  Filter,
  Copy,
  Check,
} from "lucide-react";

interface PaymentSubmission {
  id: string;
  registrationNo?: string | null;
  studentName: string;
  schoolName: string;
  emailId: string;
  screenshotUrl: string;
  utrNumber: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentSubmissionsManagement() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("ALL");

  // Modal states
  const [viewScreenshot, setViewScreenshot] = useState<PaymentSubmission | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotesModal, setAdminNotesModal] = useState<PaymentSubmission | null>(null);
  const [notesText, setNotesText] = useState("");

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSubmissions = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/payment-submissions");
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(true);
  }, []);

  // Filtered submissions
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (activeTab !== "ALL" && s.status !== activeTab) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (s.registrationNo && s.registrationNo.toLowerCase().includes(q)) ||
          s.studentName.toLowerCase().includes(q) ||
          s.schoolName.toLowerCase().includes(q) ||
          s.emailId.toLowerCase().includes(q) ||
          (s.utrNumber && s.utrNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [submissions, activeTab, search]);

  // Update status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/payment-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        alert("Failed to update status.");
        return;
      }
      await fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Save admin notes
  const handleSaveNotes = async () => {
    if (!adminNotesModal) return;
    try {
      const res = await fetch(`/api/payment-submissions/${adminNotesModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: adminNotesModal.status, adminNotes: notesText }),
      });
      if (!res.ok) {
        alert("Failed to save notes.");
        return;
      }
      setAdminNotesModal(null);
      await fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert("Error saving notes.");
    }
  };

  // Delete submission
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment submission? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/payment-submissions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete.");
        return;
      }
      await fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert("Error deleting submission.");
    }
  };

  // Copy email
  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/20">
            <Clock className="h-3 w-3" /> PENDING
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> VERIFIED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold text-rose-400 ring-1 ring-rose-500/20">
            <XCircle className="h-3 w-3" /> REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminShell title="Payment Submissions">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-[#4DE8E0]" />
              <h1 className="text-xl font-bold text-[#F3F6FB]">Payment Proof Submissions</h1>
            </div>
            <p className="mt-1 text-xs text-[#8891A8]">
              Review and verify student payment screenshots submitted via the public form.
            </p>
          </div>
          <button
            onClick={() => fetchSubmissions(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1D2436] bg-[#0F1420] px-3.5 py-2 text-xs font-medium text-[#F3F6FB] transition-colors hover:border-[#4DE8E0]/40 hover:text-[#4DE8E0]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#4DE8E0]" : ""}`} />
            Refresh
          </button>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#1D2436] bg-[#0F1420] p-4">
            <p className="text-[11px] font-semibold text-[#8891A8] uppercase tracking-wider">Total</p>
            <p className="mt-1 text-2xl font-bold text-[#F3F6FB]">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Verified</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.verified}</p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-rose-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tab Buttons */}
          <div className="flex items-center gap-1 rounded-lg border border-[#1D2436] bg-[#0A0D16] p-1">
            {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const count =
                tab === "ALL" ? stats.total :
                tab === "PENDING" ? stats.pending :
                tab === "VERIFIED" ? stats.verified : stats.rejected;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#4DE8E0]/15 text-[#4DE8E0] ring-1 ring-[#4DE8E0]/30"
                      : "text-[#8891A8] hover:text-[#F3F6FB]"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8891A8]" />
            <input
              type="text"
              placeholder="Search by name, school, email, UTR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#1D2436] bg-[#0F1420] py-2 pl-9 pr-3 text-xs text-[#F3F6FB] placeholder-[#8891A8] focus:border-[#4DE8E0] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Submissions Table / Cards */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#1D2436] bg-[#0F1420]">
            <RefreshCw className="h-6 w-6 animate-spin text-[#4DE8E0]" />
            <p className="mt-3 text-xs text-[#8891A8]">Loading payment submissions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#1D2436] bg-[#0F1420] p-6 text-center">
            <FileCheck className="h-10 w-10 text-[#4DE8E0]/40" />
            <p className="mt-3 text-sm font-semibold text-[#F3F6FB]">No submissions found</p>
            <p className="mt-1 text-xs text-[#8891A8]">
              {activeTab !== "ALL"
                ? `No ${activeTab.toLowerCase()} submissions.`
                : "No payment submissions yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#1D2436] bg-[#0F1420]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1D2436] bg-[#0A0D16] text-[#8891A8]">
                    <th className="px-4 py-3 font-semibold">Student Details</th>
                    <th className="px-4 py-3 font-semibold">School</th>
                    <th className="px-4 py-3 font-semibold">UTR / Ref</th>
                    <th className="px-4 py-3 font-semibold">Screenshot</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Submitted</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D2436]/60">
                  {filtered.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-[#151B2B]/60">
                      {/* Student Details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <User className="h-3.5 w-3.5 text-[#4DE8E0]" />
                          <span className="font-semibold text-[#F3F6FB]">{s.studentName}</span>
                          {s.registrationNo && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#4DE8E0]/15 text-[#4DE8E0] border border-[#4DE8E0]/30 font-bold">
                              {s.registrationNo}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#8891A8]">
                          <Mail className="h-3 w-3" />
                          <span>{s.emailId}</span>
                          <button
                            onClick={() => handleCopyEmail(s.emailId, s.id)}
                            className="ml-1 text-[#555E73] hover:text-[#4DE8E0] transition-colors"
                            title="Copy email"
                          >
                            {copiedId === s.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      {/* School */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#8B7CFF]" />
                          <span className="text-[#F3F6FB]">{s.schoolName}</span>
                        </div>
                      </td>

                      {/* UTR */}
                      <td className="px-4 py-3.5">
                        {s.utrNumber ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#4DE8E0]">
                            <Hash className="h-3 w-3" />
                            {s.utrNumber}
                          </span>
                        ) : (
                          <span className="text-[#555E73] italic">—</span>
                        )}
                      </td>

                      {/* Screenshot Thumbnail */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setViewScreenshot(s)}
                          className="group relative h-12 w-16 overflow-hidden rounded-lg border border-[#1D2436] bg-[#0A0D16] transition-all hover:border-[#4DE8E0]/40 hover:ring-2 hover:ring-[#4DE8E0]/20"
                        >
                          <Image
                            src={s.screenshotUrl}
                            alt="Screenshot"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {statusBadge(s.status)}
                        {s.adminNotes && (
                          <p className="mt-1 max-w-[150px] truncate text-[10px] text-[#8891A8] italic">
                            📝 {s.adminNotes}
                          </p>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8891A8]">
                          <Calendar className="h-3 w-3" />
                          {formatDate(s.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Verify Button */}
                          {s.status !== "VERIFIED" && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, "VERIFIED")}
                              disabled={updatingId === s.id}
                              title="Mark as Verified"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
                            >
                              {updatingId === s.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {/* Reject Button */}
                          {s.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, "REJECTED")}
                              disabled={updatingId === s.id}
                              title="Mark as Rejected"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}

                          {/* Reset to Pending */}
                          {s.status !== "PENDING" && (
                            <button
                              onClick={() => handleUpdateStatus(s.id, "PENDING")}
                              disabled={updatingId === s.id}
                              title="Reset to Pending"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-colors hover:bg-amber-500 hover:text-white disabled:opacity-50"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                          )}

                          {/* Add Notes */}
                          <button
                            onClick={() => {
                              setAdminNotesModal(s);
                              setNotesText(s.adminNotes || "");
                            }}
                            title="Add Admin Notes"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-colors hover:border-[#8B7CFF] hover:text-[#8B7CFF]"
                          >
                            📝
                          </button>

                          {/* View Screenshot */}
                          <button
                            onClick={() => setViewScreenshot(s)}
                            title="View Screenshot"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-colors hover:border-[#4DE8E0] hover:text-[#4DE8E0]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(s.id)}
                            title="Delete Submission"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-colors hover:border-rose-500 hover:text-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODAL: VIEW SCREENSHOT ================= */}
        {viewScreenshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              {/* Close */}
              <button
                onClick={() => setViewScreenshot(null)}
                className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB]"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4DE8E0]/15 text-[#4DE8E0]">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F3F6FB]">Payment Screenshot</h3>
                  <p className="text-xs text-[#8891A8]">
                    {viewScreenshot.studentName} • {viewScreenshot.schoolName}
                  </p>
                </div>
              </div>

              {/* Student Info */}
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-[#1D2436] bg-[#0A0D16] p-3">
                <div>
                  <p className="text-[10px] text-[#8891A8]">Email</p>
                  <p className="text-xs font-medium text-[#F3F6FB]">{viewScreenshot.emailId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8891A8]">UTR / Ref No</p>
                  <p className="text-xs font-mono font-medium text-[#4DE8E0]">
                    {viewScreenshot.utrNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8891A8]">Submitted</p>
                  <p className="text-xs font-medium text-[#F3F6FB]">{formatDate(viewScreenshot.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8891A8]">Status</p>
                  {statusBadge(viewScreenshot.status)}
                </div>
              </div>

              {/* Screenshot Image */}
              <div className="relative w-full overflow-hidden rounded-xl border border-[#1D2436] bg-[#0A0D16]" style={{ maxHeight: "60vh" }}>
                <img
                  src={viewScreenshot.screenshotUrl}
                  alt="Payment Screenshot"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: "60vh" }}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex items-center justify-end gap-2.5">
                {viewScreenshot.status !== "VERIFIED" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(viewScreenshot.id, "VERIFIED");
                      setViewScreenshot(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verify Payment
                  </button>
                )}
                {viewScreenshot.status !== "REJECTED" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(viewScreenshot.id, "REJECTED");
                      setViewScreenshot(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-rose-600"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                )}
                <button
                  onClick={() => setViewScreenshot(null)}
                  className="rounded-lg border border-[#1D2436] bg-[#0A0D16] px-4 py-2 text-xs font-medium text-[#8891A8] hover:text-[#F3F6FB]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADMIN NOTES ================= */}
        {adminNotesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              <button
                onClick={() => setAdminNotesModal(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B7CFF]/15 text-[#8B7CFF]">
                  📝
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F3F6FB]">Admin Notes</h3>
                  <p className="text-xs text-[#8891A8]">{adminNotesModal.studentName}</p>
                </div>
              </div>

              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Add internal notes about this payment..."
                rows={4}
                className="w-full rounded-xl border border-[#1D2436] bg-[#0A0D16] px-4 py-3 text-sm text-[#F3F6FB] placeholder-[#555E73] focus:border-[#4DE8E0] focus:outline-none resize-none"
              />

              <div className="mt-4 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setAdminNotesModal(null)}
                  className="rounded-lg border border-[#1D2436] bg-[#0A0D16] px-4 py-2 text-xs font-medium text-[#8891A8] hover:text-[#F3F6FB]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="rounded-lg bg-[#4DE8E0] px-4 py-2 text-xs font-bold text-[#090C14] hover:opacity-90"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

