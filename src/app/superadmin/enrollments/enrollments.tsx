"use client";

import { useState, useEffect } from "react";
import { Users, Search, Eye, X, RefreshCw, Printer, Trash2, Plus, Save } from "lucide-react";
import AdminShell from "@/app/components/AdminShell";
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
  hasKit?: boolean;
  gstPercent?: number;
  total?: string;
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

function getEnrollmentDetails(e: Enrollment) {
  const isRobo = Boolean(
    e.hasKit === true ||
    e.courseTitle?.toLowerCase().includes("robotics")
  );
  const admissionAmt = parseAmt(e.admissionFee);
  const kitAmt = isRobo ? parseAmt(e.kitPrice) : 0;
  const baseAmt = admissionAmt + kitAmt;

  let gstPercent = e.gstPercent ?? 0;
  let totalAmt = parseAmt(e.total);

  if (totalAmt > baseAmt && baseAmt > 0 && gstPercent === 0) {
    const diff = totalAmt - baseAmt;
    gstPercent = Math.round((diff / baseAmt) * 100);
  }

  const gstAmt = Math.round(baseAmt * gstPercent / 100);

  if (totalAmt === 0) {
    totalAmt = baseAmt + gstAmt;
  }

  const totalStr = e.total || fmtAmt(totalAmt);

  return {
    isRobo,
    admissionAmt,
    kitAmt,
    baseAmt,
    gstPercent,
    gstAmt,
    totalAmt,
    totalStr,
  };
}

export default function EnrollmentsManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Enrollment | null>(null);

  // New Official Enrollment modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    dob: "",
    gender: "Male",
    classGrade: "",
    school: "",
    guardianName: "",
    courseTitle: "",
    admissionFee: "₹3,000",
    kitPrice: "",
    hasKit: false,
    gstPercent: 18,
    total: "₹3,540",
    message: "",
  });
  const [submittingNew, setSubmittingNew] = useState(false);

  const fetchEnrollments = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const [enrRes, crsRes] = await Promise.all([
        fetch("/api/enrollments"),
        fetch("/api/courses"),
      ]);
      const enrData = await enrRes.json();
      const crsData = await crsRes.json();

      if (Array.isArray(enrData)) setEnrollments(enrData);
      if (Array.isArray(crsData)) {
        setCourses(crsData);
        if (crsData.length > 0 && !newForm.courseTitle) {
          const first = crsData[0];
          const isRobo = Boolean(first.hasKit || first.category.toLowerCase().includes("robotics"));
          const base = parseAmt(first.admissionFee) + (isRobo ? parseAmt(first.kitPrice) : 0);
          const gstAmt = Math.round((base * (first.gstPercent || 18)) / 100);
          setNewForm((prev) => ({
            ...prev,
            courseTitle: first.title,
            admissionFee: first.admissionFee || "₹3,000",
            kitPrice: isRobo ? first.kitPrice : "",
            hasKit: isRobo,
            gstPercent: first.gstPercent ?? 18,
            total: first.price || fmtAmt(base + gstAmt),
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(true); }, []);

  const handleSelectCourseInForm = (courseTitleStr: string) => {
    const match = courses.find((c) => c.title === courseTitleStr);
    const isRobo = Boolean(match?.hasKit || courseTitleStr.toLowerCase().includes("robotics"));
    const admissionFee = match?.admissionFee || "₹3,000";
    const kitPrice = isRobo ? (match?.kitPrice || "₹1,100") : "";
    const gstPercent = match?.gstPercent ?? 18;
    const base = parseAmt(admissionFee) + (isRobo ? parseAmt(kitPrice) : 0);
    const gstAmt = Math.round((base * gstPercent) / 100);

    setNewForm((prev) => ({
      ...prev,
      courseTitle: courseTitleStr,
      admissionFee,
      kitPrice,
      hasKit: isRobo,
      gstPercent,
      total: match?.price || fmtAmt(base + gstAmt),
    }));
  };

  const handleCreateOfficialEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.studentName || !newForm.studentPhone || !newForm.studentEmail || !newForm.courseTitle) {
      alert("Name, Email, Phone, and Course are required.");
      return;
    }

    setSubmittingNew(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to create enrollment.");
        return;
      }

      // Automatically print official receipt
      const html = generateOfficialFeeReceiptHTML({
        registrationNo: json.registrationNo,
        studentName: newForm.studentName,
        courseTitle: newForm.courseTitle,
        admissionFee: newForm.admissionFee,
        kitPrice: newForm.hasKit ? newForm.kitPrice : "",
        hasKit: newForm.hasKit,
        gstPercent: newForm.gstPercent,
        total: newForm.total,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });

      setIsNewModalOpen(false);

      const printWin = window.open("", "_blank", "width=900,height=800");
      if (printWin) {
        printWin.document.write(html);
        printWin.document.close();
      }

      alert(`Official Student Registered! Registration No: ${json.registrationNo}`);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      alert("Error creating enrollment.");
    } finally {
      setSubmittingNew(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
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

    setEnrollments((prev) => prev.filter((item) => item.id !== id));
    if (selected && selected.id === id) {
      setSelected(null);
    }

    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
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

  const handlePrintReceipt = (eRecord: Enrollment) => {
    const details = getEnrollmentDetails(eRecord);

    const html = generateOfficialFeeReceiptHTML({
      registrationNo: eRecord.registrationNo,
      studentName: eRecord.studentName,
      courseTitle: eRecord.courseTitle,
      admissionFee: eRecord.admissionFee,
      kitPrice: details.isRobo ? eRecord.kitPrice : "",
      hasKit: details.isRobo,
      gstPercent: details.gstPercent,
      total: details.totalStr,
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

  const inputClass = "w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors";

  return (
    <AdminShell title="Official Confirmed Enrollments">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F6FB]">Official Enrollments</h1>
          <p className="text-sm text-[#8891A8]">
            {enrollments.length} total verified student{enrollments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEnrollments(true)}
            className="flex items-center gap-2 rounded-xl border border-[#1D2436] px-4 py-2.5 text-sm text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#4DE8E0] px-4 py-2.5 text-sm font-semibold text-[#090C14] hover:bg-[#5FF0E8] transition-all"
          >
            <Plus className="h-4 w-4" /> Register New Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8891A8]" />
        <input
          type="text"
          placeholder="Search by name, email, reg no, course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] placeholder:text-[#8891A8]/60 text-sm transition-all"
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
          <p className="text-[#F3F6FB] font-semibold">No official enrollments found</p>
          <p className="text-sm text-[#8891A8] mt-1">
            {search ? "Try a different search term" : "Click 'Register New Student' or convert a public lead"}
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
              {filtered.map((e) => {
                const details = getEnrollmentDetails(e);
                return (
                  <tr key={e.id} className="border-b border-[#1D2436] bg-[#090C14] hover:bg-[#0F1420] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#4DE8E0]">{e.registrationNo}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#F3F6FB]">{e.studentName}</p>
                      <p className="text-xs text-[#8891A8]">{e.studentEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[#F3F6FB]">{e.courseTitle}</td>
                    <td className="px-4 py-3 font-bold text-[#4DE8E0]">{details.totalStr}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Official Student Enrollment Modal */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div className="relative w-full max-w-xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#F3F6FB]">Register New Official Student</h2>
                  <p className="text-xs text-[#8891A8]">Generates official registration number & fee receipt</p>
                </div>
                <button onClick={() => setIsNewModalOpen(false)} className="text-[#8891A8] hover:text-[#F3F6FB]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOfficialEnrollment} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newForm.studentName}
                    onChange={(e) => setNewForm({ ...newForm, studentName: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Navin Tiwari"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={newForm.studentPhone}
                      onChange={(e) => setNewForm({ ...newForm, studentPhone: e.target.value })}
                      className={inputClass}
                      placeholder="+91..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newForm.studentEmail}
                      onChange={(e) => setNewForm({ ...newForm, studentEmail: e.target.value })}
                      className={inputClass}
                      placeholder="student@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={newForm.dob}
                      onChange={(e) => setNewForm({ ...newForm, dob: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">Gender</label>
                    <select
                      value={newForm.gender}
                      onChange={(e) => setNewForm({ ...newForm, gender: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">Class / Grade</label>
                    <input
                      type="text"
                      value={newForm.classGrade}
                      onChange={(e) => setNewForm({ ...newForm, classGrade: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Class 10 / B.Tech"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8891A8] mb-1.5">College / School / NGO Name</label>
                    <input
                      type="text"
                      value={newForm.school}
                      onChange={(e) => setNewForm({ ...newForm, school: e.target.value })}
                      className={inputClass}
                      placeholder="Institution Name"
                    />
                  </div>
                </div>

                {/* Select Course */}
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Select Course *</label>
                  <select
                    value={newForm.courseTitle}
                    onChange={(e) => handleSelectCourseInForm(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#4DE8E0]/40 text-[#4DE8E0] font-bold text-sm rounded-xl outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.title} className="bg-[#0F1420] text-white">
                        {c.title} ({c.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fee breakdown box */}
                <div className="rounded-xl border border-[#1D2436] bg-[#090C14] p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#4DE8E0]">💰 Fee & Tax Breakdown</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#8891A8] mb-1.5">Admission Fee</label>
                      <input
                        type="text"
                        value={newForm.admissionFee}
                        onChange={(e) => {
                          const val = e.target.value;
                          const base = parseAmt(val) + (newForm.hasKit ? parseAmt(newForm.kitPrice) : 0);
                          const gstAmt = Math.round((base * newForm.gstPercent) / 100);
                          setNewForm((prev) => ({
                            ...prev,
                            admissionFee: val,
                            total: fmtAmt(base + gstAmt),
                          }));
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8891A8] mb-1.5">GST %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newForm.gstPercent}
                        onChange={(e) => {
                          const gstVal = parseFloat(e.target.value) || 0;
                          const base = parseAmt(newForm.admissionFee) + (newForm.hasKit ? parseAmt(newForm.kitPrice) : 0);
                          const gstAmt = Math.round((base * gstVal) / 100);
                          setNewForm((prev) => ({
                            ...prev,
                            gstPercent: gstVal,
                            total: fmtAmt(base + gstAmt),
                          }));
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {newForm.hasKit && (
                    <div>
                      <label className="block text-xs text-[#8891A8] mb-1.5">Kit Price (Robotics)</label>
                      <input
                        type="text"
                        value={newForm.kitPrice}
                        onChange={(e) => {
                          const kVal = e.target.value;
                          const base = parseAmt(newForm.admissionFee) + parseAmt(kVal);
                          const gstAmt = Math.round((base * newForm.gstPercent) / 100);
                          setNewForm((prev) => ({
                            ...prev,
                            kitPrice: kVal,
                            total: fmtAmt(base + gstAmt),
                          }));
                        }}
                        className={inputClass}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl border border-[#4DE8E0]/30 bg-[#4DE8E0]/10 px-4 py-3">
                    <span className="text-xs font-semibold text-[#4DE8E0]">Total Fee (incl. GST)</span>
                    <span className="text-lg font-bold text-white">{newForm.total}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1D2436]">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2.5 border border-[#1D2436] text-[#8891A8] text-sm rounded-xl hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNew}
                    className="px-6 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-bold rounded-xl hover:bg-[#5FF0E8] transition-all flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> {submittingNew ? "Registering..." : "Register & Print Receipt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div className="relative w-full max-w-2xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
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

              {(() => {
                const details = getEnrollmentDetails(selected);
                return (
                  <div className="mb-6 rounded-xl border border-[#1D2436] bg-[#090C14] p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Course & Fee Breakdown</p>
                    <p className="font-bold text-[#F3F6FB] mb-3">{selected.courseTitle}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#8891A8]">Admission Fee</span>
                        <span className="font-semibold text-[#F3F6FB]">{selected.admissionFee || "—"}</span>
                      </div>
                      {details.isRobo && selected.kitPrice && (
                        <div className="flex justify-between">
                          <span className="text-[#8891A8]">Kit Price</span>
                          <span className="font-semibold text-[#F3F6FB]">{selected.kitPrice}</span>
                        </div>
                      )}
                      {details.gstPercent > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#8891A8]">GST ({details.gstPercent}%)</span>
                          <span className="font-semibold text-amber-400">{fmtAmt(details.gstAmt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-[#1D2436] pt-2">
                        <span className="font-bold text-[#F3F6FB]">Total Amount {details.gstPercent > 0 ? "(incl. GST)" : ""}</span>
                        <span className="font-bold text-[#4DE8E0]">{details.totalStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

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
        </div>
      )}
    </AdminShell>
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
