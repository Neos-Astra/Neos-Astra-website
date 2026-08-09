"use client";

import { useState, useEffect } from "react";
import { Users, Search, Eye, X, Download, RefreshCw, Printer, Trash2 } from "lucide-react";
import { generateOfficialFeeReceiptHTML } from "@/lib/receiptTemplate";

interface Enrollment {
  id: string;
  registrationNo: string;
  studentName: string;
  dob: string | null;
  gender: string | null;
  classGrade: string | null;
  school: string | null;
  studentPhone: string;
  studentEmail: string;
  guardianName: string | null;
  courseTitle: string;
  admissionFee: string;
  kitPrice: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export default function EnrollmentsManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Enrollment | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments");
      const data = await res.json();
      if (Array.isArray(data)) setEnrollments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setEnrollments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selected && selected.id === id) {
      setSelected((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch("/api/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        console.error("Failed to update status");
        fetchEnrollments();
      }
    } catch (err) {
      console.error(err);
      fetchEnrollments();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete enrollment for "${name}"? This action cannot be undone.`)) {
      return;
    }

    // Optimistic removal
    setEnrollments((prev) => prev.filter((item) => item.id !== id));
    if (selected && selected.id === id) {
      setSelected(null);
    }

    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Fallback search param DELETE
        const res2 = await fetch(`/api/enrollments?id=${id}`, {
          method: "DELETE",
        });
        if (!res2.ok) {
          alert("Failed to delete enrollment. Please try again.");
          fetchEnrollments();
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete enrollment.");
      fetchEnrollments();
    }
  };

  const filtered = enrollments.filter((e) =>
    e.studentName.toLowerCase().includes(search.toLowerCase()) ||
    e.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
    e.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
    e.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === "CONFIRMED") return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (s === "REJECTED") return "text-red-400 border-red-400/30 bg-red-400/10";
    return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
  };

  const total = (e: Enrollment) => {
    const a = parseInt(e.admissionFee.replace(/[^0-9]/g, "") || "0");
    const k = parseInt(e.kitPrice.replace(/[^0-9]/g, "") || "0");
    return `₹${(a + k).toLocaleString("en-IN")}`;
  };

  const handlePrintReceipt = (eRecord: Enrollment) => {
    const html = generateOfficialFeeReceiptHTML({
      registrationNo: eRecord.registrationNo,
      studentName: eRecord.studentName,
      courseTitle: eRecord.courseTitle,
      admissionFee: eRecord.admissionFee,
      kitPrice: eRecord.kitPrice,
      total: total(eRecord),
      date: new Date(eRecord.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    });

    const printWin = window.open("", "_blank", "width=900,height=800");
    if (!printWin) {
      alert("Pop-up blocked! Allow popups for this site in your browser, then try again.");
      return;
    }
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F3F6FB]">Enrollments</h1>
            <p className="text-sm text-[#8891A8]">
              {enrollments.length} total enrollment{enrollments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={fetchEnrollments}
            className="flex items-center gap-2 rounded-lg border border-[#1D2436] px-4 py-2 text-sm text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8891A8]" />
          <input
            type="text"
            placeholder="Search by name, email, reg no, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] placeholder:text-[#8891A8]/60 text-sm transition-all"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D2436] border-t-[#4DE8E0]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1D2436] bg-[#0F1420] py-20">
            <Users className="h-12 w-12 text-[#8891A8] opacity-40 mb-4" />
            <p className="text-[#F3F6FB] font-semibold">No enrollments found</p>
            <p className="text-sm text-[#8891A8] mt-1">
              {search ? "Try a different search term" : "No one has enrolled yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1D2436]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1D2436] bg-[#0F1420]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Reg No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-[#1D2436] bg-[#090C14] hover:bg-[#0F1420] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#4DE8E0]">{e.registrationNo}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#F3F6FB]">{e.studentName}</p>
                      <p className="text-xs text-[#8891A8]">{e.studentEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[#F3F6FB]">{e.courseTitle}</td>
                    <td className="px-4 py-3 font-bold text-[#4DE8E0]">{total(e)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={e.status}
                        onChange={(ev) => updateStatus(e.id, ev.target.value)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#090C14] cursor-pointer outline-none transition-all ${statusColor(
                          e.status
                        )}`}
                      >
                        <option value="PENDING" className="bg-[#0F1420] text-yellow-400 font-bold">
                          PENDING
                        </option>
                        <option value="CONFIRMED" className="bg-[#0F1420] text-emerald-400 font-bold">
                          CONFIRMED
                        </option>
                        <option value="REJECTED" className="bg-[#0F1420] text-red-400 font-bold">
                          REJECTED
                        </option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8891A8]">
                      {new Date(e.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(e)}
                          className="flex items-center gap-1 rounded-lg border border-[#1D2436] px-3 py-1.5 text-xs text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(e)}
                          title="Print Official Fee Receipt"
                          className="flex items-center gap-1 rounded-lg border border-[#1D2436] px-3 py-1.5 text-xs text-[#4DE8E0] bg-[#4DE8E010] hover:bg-[#4DE8E020] transition-all"
                        >
                          <Printer className="h-3 w-3" /> Print
                        </button>
                        <button
                          onClick={() => handleDelete(e.id, e.studentName)}
                          title="Delete Enrollment"
                          className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
              <div>
                <h2 className="font-bold text-[#F3F6FB]">{selected.studentName}</h2>
                <p className="font-mono text-xs text-[#4DE8E0]">{selected.registrationNo}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintReceipt(selected)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#4DE8E033] bg-[#4DE8E010] px-3 py-1.5 text-xs font-bold text-[#4DE8E0] hover:bg-[#4DE8E020] transition-all"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <button
                  onClick={() => handleDelete(selected.id, selected.studentName)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
                <button onClick={() => setSelected(null)} className="text-[#8891A8] hover:text-[#F3F6FB] ml-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <Detail label="Date of Birth" value={selected.dob || "—"} />
              <Detail label="Gender" value={selected.gender || "—"} />
              <Detail label="Class / Grade" value={selected.classGrade || "—"} />
              <Detail label="Phone" value={selected.studentPhone} />
              <Detail label="Email" value={selected.studentEmail} className="col-span-2" />
              <Detail label="School" value={selected.school || "—"} className="col-span-2" />
              <Detail label="Guardian Name" value={selected.guardianName || "—"} className="col-span-2" />
            </div>

            <div className="mb-6 rounded-xl border border-[#1D2436] bg-[#090C14] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Course & Fees</p>
              <p className="font-bold text-[#F3F6FB] mb-3">{selected.courseTitle}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8891A8]">Admission Fee</span>
                  <span className="font-semibold text-[#F3F6FB]">{selected.admissionFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8891A8]">Kit Price</span>
                  <span className="font-semibold text-[#F3F6FB]">{selected.kitPrice}</span>
                </div>
                <div className="flex justify-between border-t border-[#1D2436] pt-2">
                  <span className="font-bold text-[#F3F6FB]">Total</span>
                  <span className="font-bold text-[#4DE8E0]">{total(selected)}</span>
                </div>
              </div>
            </div>

            {selected.message && (
              <div className="mb-6">
                <p className="mb-1 text-xs uppercase tracking-wide text-[#8891A8]">Message</p>
                <p className="text-sm text-[#C7CCDA]">{selected.message}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-[#1D2436] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8891A8]">Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateStatus(selected.id, "PENDING")}
                    className={`rounded-lg border px-3 py-1 text-xs font-bold transition-all ${
                      selected.status === "PENDING"
                        ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                        : "border-[#1D2436] bg-[#090C14] text-[#8891A8] hover:border-yellow-400/50 hover:text-yellow-400"
                    }`}
                  >
                    PENDING
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "CONFIRMED")}
                    className={`rounded-lg border px-3 py-1 text-xs font-bold transition-all ${
                      selected.status === "CONFIRMED"
                        ? "border-emerald-400 bg-emerald-400/20 text-emerald-400"
                        : "border-[#1D2436] bg-[#090C14] text-[#8891A8] hover:border-emerald-400/50 hover:text-emerald-400"
                    }`}
                  >
                    CONFIRMED
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "REJECTED")}
                    className={`rounded-lg border px-3 py-1 text-xs font-bold transition-all ${
                      selected.status === "REJECTED"
                        ? "border-red-400 bg-red-400/20 text-red-400"
                        : "border-[#1D2436] bg-[#090C14] text-[#8891A8] hover:border-red-400/50 hover:text-red-400"
                    }`}
                  >
                    REJECTED
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#8891A8]">
                Submitted: {new Date(selected.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wide text-[#8891A8]">{label}</p>
      <p className="mt-0.5 font-medium text-[#F3F6FB]">{value}</p>
    </div>
  );
}

function statusColor(s: string) {
  if (s === "CONFIRMED") return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (s === "REJECTED") return "text-red-400 border-red-400/30 bg-red-400/10";
  return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
}
