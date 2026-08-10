"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Eye, X, RefreshCw, Trash2, ShieldCheck, Download, Calendar, FileSpreadsheet, CheckCircle } from "lucide-react";
import AdminShell from "@/app/components/AdminShell";
import { generateOfficialFeeReceiptHTML } from "@/lib/receiptTemplate";

interface Inquiry {
  id: string;
  studentName: string;
  dob: string | null;
  gender: string | null;
  classGrade: string | null;
  school: string | null;
  studentPhone: string;
  studentEmail: string;
  guardianName: string | null;
  courseTitle: string;
  message: string | null;
  status: string;
  createdAt: string;
}

interface CourseItem {
  id: string;
  title: string;
  category: string;
  admissionFee: string;
  kitPrice: string;
  hasKit: boolean;
  gstPercent: number;
  price: string;
}

function parseAmt(val: string | undefined): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}
function fmtAmt(val: number): string {
  return `₹${val.toLocaleString("en-IN")}`;
}

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default function InquiriesManagement() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "YESTERDAY" | "THIS_MONTH" | "CUSTOM">("ALL");
  const [customDate, setCustomDate] = useState<string>("");

  // Conversion Modal state
  const [convertingInquiry, setConvertingInquiry] = useState<Inquiry | null>(null);
  const [convertForm, setConvertForm] = useState({
    admissionFee: "",
    kitPrice: "",
    hasKit: false,
    gstPercent: 0,
    total: "",
  });
  const [converting, setConverting] = useState(false);

  const fetchInquiries = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [inqRes, courseRes] = await Promise.all([
        fetch("/api/inquiries"),
        fetch("/api/courses"),
      ]);
      const inqData = await inqRes.json();
      const courseData = await courseRes.json();

      if (Array.isArray(inqData)) setInquiries(inqData);
      if (Array.isArray(courseData)) setCourses(courseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(true);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchInquiries();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete inquiry from "${name}"?`)) return;

    setInquiries((prev) => prev.filter((item) => item.id !== id));
    if (selectedInquiry && selectedInquiry.id === id) setSelectedInquiry(null);

    try {
      await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchInquiries();
    }
  };

  const startConversion = (inq: Inquiry) => {
    // Find matching course details if available
    const match = courses.find(
      (c) => c.title.toLowerCase() === inq.courseTitle.toLowerCase()
    );

    const isRobo = Boolean(
      match?.hasKit ||
      inq.courseTitle.toLowerCase().includes("robotics") ||
      match?.category.toLowerCase().includes("robotics")
    );

    const admissionFee = match?.admissionFee || "₹3,000";
    const kitPrice = isRobo ? (match?.kitPrice || "₹1,100") : "";
    const gstPercent = match?.gstPercent ?? 18;

    const base = parseAmt(admissionFee) + (isRobo ? parseAmt(kitPrice) : 0);
    const gstAmt = Math.round((base * gstPercent) / 100);
    const totalVal = match?.price || fmtAmt(base + gstAmt);

    setConvertForm({
      admissionFee,
      kitPrice,
      hasKit: isRobo,
      gstPercent,
      total: totalVal,
    });
    setConvertingInquiry(inq);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingInquiry) return;

    setConverting(true);
    try {
      // 1. Create official Enrollment in DB
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: convertingInquiry.studentName,
          dob: convertingInquiry.dob,
          gender: convertingInquiry.gender,
          classGrade: convertingInquiry.classGrade,
          school: convertingInquiry.school,
          studentPhone: convertingInquiry.studentPhone,
          studentEmail: convertingInquiry.studentEmail,
          guardianName: convertingInquiry.guardianName,
          courseTitle: convertingInquiry.courseTitle,
          admissionFee: convertForm.admissionFee,
          kitPrice: convertForm.kitPrice,
          hasKit: convertForm.hasKit,
          gstPercent: convertForm.gstPercent,
          total: convertForm.total,
          message: convertingInquiry.message,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to convert inquiry into official enrollment.");
        return;
      }

      // 2. Mark inquiry status as CONVERTED
      await updateStatus(convertingInquiry.id, "CONVERTED");

      setConvertingInquiry(null);
      alert(`Success! Student converted to official enrollment with Reg No: ${json.registrationNo}`);
      fetchInquiries();
    } catch (err) {
      console.error(err);
      alert("Error converting inquiry to enrollment.");
    } finally {
      setConverting(false);
    }
  };

  // Filter inquiries by search and date filter
  const todayCount = inquiries.filter((i) => isSameDay(new Date(i.createdAt), new Date())).length;

  const filtered = inquiries.filter((i) => {
    const matchesSearch =
      i.studentName.toLowerCase().includes(search.toLowerCase()) ||
      i.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      i.studentPhone.toLowerCase().includes(search.toLowerCase()) ||
      i.courseTitle.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === "ALL") return true;

    const itemDate = new Date(i.createdAt);
    const now = new Date();

    if (dateFilter === "TODAY") {
      return isSameDay(itemDate, now);
    }

    if (dateFilter === "YESTERDAY") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return isSameDay(itemDate, yesterday);
    }

    if (dateFilter === "THIS_MONTH") {
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth()
      );
    }

    if (dateFilter === "CUSTOM" && customDate) {
      const target = new Date(customDate);
      return isSameDay(itemDate, target);
    }

    return true;
  });

  // Export filtered inquiries to Excel (.csv format)
  const exportToExcelCSV = () => {
    if (filtered.length === 0) {
      alert("No web lead records found for the current filter to export.");
      return;
    }

    const headers = [
      "Student Name",
      "Phone",
      "Email",
      "Interested Course",
      "Status",
      "Submission Date",
      "Class/Grade",
      "School/College",
      "Guardian Name",
      "Message",
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filtered.map((i) => {
      return [
        escapeCSV(i.studentName),
        escapeCSV(i.studentPhone),
        escapeCSV(i.studentEmail),
        escapeCSV(i.courseTitle),
        escapeCSV(i.status),
        escapeCSV(new Date(i.createdAt).toLocaleDateString("en-IN")),
        escapeCSV(i.classGrade || ""),
        escapeCSV(i.school || ""),
        escapeCSV(i.guardianName || ""),
        escapeCSV(i.message || ""),
      ].join(",");
    });

    const csvString = [headers.map(escapeCSV).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split("T")[0];
    const filterTag = dateFilter === "CUSTOM" && customDate ? customDate : dateFilter;
    link.setAttribute("href", url);
    link.setAttribute("download", `Web_Leads_${filterTag}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadgeClass = (s: string) => {
    if (s === "CONVERTED") return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (s === "CONTACTED") return "text-cyan-400 border-cyan-400/30 bg-cyan-400/10";
    if (s === "ARCHIVED") return "text-slate-500 border-slate-500/30 bg-slate-500/10";
    return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
  };

  return (
    <AdminShell title="Public Web Enquiries & Leads">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#F3F6FB]">Public Enquiries</h1>
            <span className="rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-3 py-0.5 text-xs font-bold text-[#38BDF8]">
              Today: {todayCount}
            </span>
          </div>
          <p className="text-sm text-[#8891A8] mt-1">
            {inquiries.length} total web lead{inquiries.length !== 1 ? "s" : ""} received
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToExcelCSV}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            title="Download currently filtered web leads to Excel file"
          >
            <FileSpreadsheet className="h-4 w-4" /> Download Excel ({filtered.length})
          </button>
          <button
            onClick={() => fetchInquiries(true)}
            className="flex items-center gap-2 rounded-xl border border-[#1D2436] px-4 py-2.5 text-sm text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8891A8]" />
          <input
            type="text"
            placeholder="Search by student name, email, phone, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] placeholder:text-[#8891A8]/60 text-sm transition-all"
          />
        </div>

        {/* Date Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1D2436] bg-[#0F1420] p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#8891A8] font-medium mr-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#38BDF8]" /> Filter Date:
            </span>

            <button
              onClick={() => setDateFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                dateFilter === "ALL"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              All Time ({inquiries.length})
            </button>

            <button
              onClick={() => setDateFilter("TODAY")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                dateFilter === "TODAY"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              Today ({todayCount})
            </button>

            <button
              onClick={() => setDateFilter("YESTERDAY")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                dateFilter === "YESTERDAY"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={() => setDateFilter("THIS_MONTH")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                dateFilter === "THIS_MONTH"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => setDateFilter("CUSTOM")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                dateFilter === "CUSTOM"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              Select Custom Date
            </button>

            {dateFilter === "CUSTOM" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="ml-1 px-3 py-1 bg-[#090C14] border border-[#38BDF8]/40 text-[#38BDF8] text-xs rounded-lg outline-none font-mono"
              />
            )}
          </div>

          <div className="text-xs text-[#8891A8]">
            Showing <span className="font-bold text-[#38BDF8]">{filtered.length}</span> lead{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D2436] border-t-[#4DE8E0]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1D2436] bg-[#0F1420] py-20">
          <Users className="h-12 w-12 text-[#8891A8] opacity-40 mb-4" />
          <p className="text-[#F3F6FB] font-semibold">No public enquiries found</p>
          <p className="text-sm text-[#8891A8] mt-1">
            {search ? "Try a different search term" : "Web enquiries will appear here when visitors fill out forms"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#1D2436]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1D2436] bg-[#0F1420]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Interested Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inq) => (
                <tr key={inq.id} className="border-b border-[#1D2436] bg-[#090C14] hover:bg-[#0F1420] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#F3F6FB]">{inq.studentName}</p>
                    <p className="text-xs text-[#8891A8]">{inq.school || inq.classGrade || "Web Lead"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#4DE8E0] font-mono">{inq.studentPhone}</p>
                    <p className="text-xs text-[#8891A8]">{inq.studentEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#F3F6FB]">{inq.courseTitle}</td>
                  <td className="px-4 py-3">
                    <select
                      value={inq.status}
                      onChange={(ev) => updateStatus(inq.id, ev.target.value)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#090C14] cursor-pointer outline-none transition-all ${statusBadgeClass(
                        inq.status
                      )}`}
                    >
                      <option value="NEW" className="bg-[#0F1420] text-yellow-400 font-bold">
                        NEW
                      </option>
                      <option value="CONTACTED" className="bg-[#0F1420] text-cyan-400 font-bold">
                        CONTACTED
                      </option>
                      <option value="CONVERTED" className="bg-[#0F1420] text-emerald-400 font-bold">
                        CONVERTED
                      </option>
                      <option value="ARCHIVED" className="bg-[#0F1420] text-slate-400 font-bold">
                        ARCHIVED
                      </option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8891A8]">
                    {new Date(inq.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="flex items-center gap-1 rounded-lg border border-[#1D2436] px-3 py-1.5 text-xs text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                      {inq.status === "CONVERTED" ? (
                        <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle className="h-3 w-3" /> Converted
                        </span>
                      ) : (
                        <button
                          onClick={() => startConversion(inq)}
                          className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                          <ShieldCheck className="h-3 w-3" /> Convert to Enrollment
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inq.id, inq.studentName)}
                        title="Delete Inquiry"
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div className="relative w-full max-w-xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
                <div>
                  <h2 className="font-bold text-[#F3F6FB]">{selectedInquiry.studentName}</h2>
                  <p className="text-xs text-[#4DE8E0]">Web Lead / Enquiry Details</p>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="text-[#8891A8] hover:text-[#F3F6FB]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div><p className="text-xs uppercase text-[#8891A8]">Course</p><p className="font-semibold text-white">{selectedInquiry.courseTitle}</p></div>
                <div><p className="text-xs uppercase text-[#8891A8]">Phone</p><p className="font-mono text-[#4DE8E0]">{selectedInquiry.studentPhone}</p></div>
                <div><p className="text-xs uppercase text-[#8891A8]">Email</p><p className="font-medium text-white">{selectedInquiry.studentEmail}</p></div>
                <div><p className="text-xs uppercase text-[#8891A8]">Date of Birth</p><p className="font-medium text-white">{selectedInquiry.dob || "—"}</p></div>
                <div><p className="text-xs uppercase text-[#8891A8]">Gender</p><p className="font-medium text-white">{selectedInquiry.gender || "—"}</p></div>
                <div><p className="text-xs uppercase text-[#8891A8]">Class / Grade</p><p className="font-medium text-white">{selectedInquiry.classGrade || "—"}</p></div>
                <div className="col-span-2"><p className="text-xs uppercase text-[#8891A8]">College / School / NGO</p><p className="font-medium text-white">{selectedInquiry.school || "—"}</p></div>
                <div className="col-span-2"><p className="text-xs uppercase text-[#8891A8]">Guardian Name</p><p className="font-medium text-white">{selectedInquiry.guardianName || "—"}</p></div>
              </div>

              {selectedInquiry.message && (
                <div className="mb-6 rounded-xl border border-[#1D2436] bg-[#090C14] p-4">
                  <p className="text-xs uppercase tracking-wide text-[#8891A8] mb-1">Message from Student</p>
                  <p className="text-sm text-[#C7CCDA]">{selectedInquiry.message}</p>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-[#1D2436] pt-4">
                {selectedInquiry.status === "CONVERTED" ? (
                  <span className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-400">
                    <CheckCircle className="h-4 w-4" /> Already Converted
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const inq = selectedInquiry;
                      setSelectedInquiry(null);
                      startConversion(inq);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all"
                  >
                    <ShieldCheck className="h-4 w-4" /> Convert to Official Enrollment
                  </button>
                )}
                <p className="text-xs text-[#8891A8]">
                  Submitted: {new Date(selectedInquiry.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Modal */}
      {convertingInquiry && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div className="relative w-full max-w-xl rounded-2xl border border-emerald-500/30 bg-[#0F1420] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
                <div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    OFFICIAL ADULT REGISTRATION
                  </span>
                  <h2 className="text-lg font-bold text-[#F3F6FB] mt-1">Convert Lead to Official Enrollment</h2>
                  <p className="text-xs text-[#8891A8]">Generating official registration number & fee receipt</p>
                </div>
                <button onClick={() => setConvertingInquiry(null)} className="text-[#8891A8] hover:text-[#F3F6FB]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConvertSubmit} className="space-y-4">
                <div className="rounded-xl border border-[#1D2436] bg-[#090C14] p-4 text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-[#8891A8]">Student Name:</span><span className="font-bold text-white">{convertingInquiry.studentName}</span></div>
                  <div className="flex justify-between"><span className="text-[#8891A8]">Email / Phone:</span><span className="text-cyan-300">{convertingInquiry.studentEmail} | {convertingInquiry.studentPhone}</span></div>
                  <div className="flex justify-between border-t border-[#1D2436] pt-1.5 mt-1"><span className="text-[#8891A8]">Course:</span><span className="font-bold text-emerald-400">{convertingInquiry.courseTitle}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">Admission Fee</label>
                    <input
                      type="text"
                      value={convertForm.admissionFee}
                      onChange={(e) => {
                        const val = e.target.value;
                        const base = parseAmt(val) + (convertForm.hasKit ? parseAmt(convertForm.kitPrice) : 0);
                        const gstAmt = Math.round((base * convertForm.gstPercent) / 100);
                        setConvertForm((prev) => ({
                          ...prev,
                          admissionFee: val,
                          total: fmtAmt(base + gstAmt),
                        }));
                      }}
                      className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] text-sm rounded-xl focus:border-[#4DE8E0] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">GST %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={convertForm.gstPercent}
                      onChange={(e) => {
                        const gstVal = parseFloat(e.target.value) || 0;
                        const base = parseAmt(convertForm.admissionFee) + (convertForm.hasKit ? parseAmt(convertForm.kitPrice) : 0);
                        const gstAmt = Math.round((base * gstVal) / 100);
                        setConvertForm((prev) => ({
                          ...prev,
                          gstPercent: gstVal,
                          total: fmtAmt(base + gstAmt),
                        }));
                      }}
                      className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] text-sm rounded-xl focus:border-[#4DE8E0] outline-none"
                    />
                  </div>
                </div>

                {convertForm.hasKit && (
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">Kit Price (Robotics)</label>
                    <input
                      type="text"
                      value={convertForm.kitPrice}
                      onChange={(e) => {
                        const kVal = e.target.value;
                        const base = parseAmt(convertForm.admissionFee) + parseAmt(kVal);
                        const gstAmt = Math.round((base * convertForm.gstPercent) / 100);
                        setConvertForm((prev) => ({
                          ...prev,
                          kitPrice: kVal,
                          total: fmtAmt(base + gstAmt),
                        }));
                      }}
                      className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] text-sm rounded-xl focus:border-[#4DE8E0] outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <span className="text-xs font-semibold text-emerald-400">Total Official Fee (incl. GST)</span>
                  <span className="text-lg font-bold text-white">{convertForm.total}</span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1D2436]">
                  <button
                    type="button"
                    onClick={() => setConvertingInquiry(null)}
                    className="px-4 py-2.5 border border-[#1D2436] text-[#8891A8] text-sm rounded-xl hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={converting}
                    className="px-6 py-2.5 bg-emerald-500 text-slate-950 text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2"
                  >
                    {converting ? "Processing..." : "Confirm & Create Official Enrollment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
