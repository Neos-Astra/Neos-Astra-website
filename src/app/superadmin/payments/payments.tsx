"use client";

import { useState, useEffect, useMemo } from "react";
import AdminShell from "@/app/components/AdminShell";
import {
  CreditCard,
  Search,
  RefreshCw,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
  Calendar,
  IndianRupee,
  History,
  Settings,
  X,
  Plus,
  Trash2,
  ArrowRight,
  User,
  Phone,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { generateMonthlyFeeReceiptHTML } from "@/lib/receiptTemplate";
import { generateWhatsAppReminderUrl, buildFeeReminderText } from "@/lib/whatsappReminder";

interface Cycle {
  monthIndex: number;
  cycleLabel: string;
  dueDate: string;
  dueDateFormatted: string;
  status: "PAID" | "OVERDUE" | "DUE_SOON" | "UPCOMING";
  amount: number;
  daysOverdue?: number;
  daysRemaining?: number;
  paidDate: string | null;
  paidDateFormatted: string | null;
  paymentMethod: string | null;
  receiptNo: string | null;
  transactionRef: string | null;
  notes: string | null;
  paymentId: string | null;
}

interface StudentPaymentInfo {
  id: string;
  registrationNo: string;
  studentName: string;
  guardianName: string | null;
  studentPhone: string;
  studentEmail: string;
  courseTitle: string;
  admissionDate: string;
  admissionDateFormatted: string;
  billingDay: number;
  monthlyFee: number;
  overallStatus: "OVERDUE" | "DUE_SOON" | "PAID";
  nextDueCycle: Cycle | null;
  overdueCyclesCount: number;
  totalPaidAmount: number;
  cycles: Cycle[];
}

interface SummaryData {
  totalStudents: number;
  totalCollectedThisMonth: number;
  totalPendingAmount: number;
  overdueStudentsCount: number;
  dueSoonStudentsCount: number;
}

function fmtCurrency(val: number): string {
  return `₹${val.toLocaleString("en-IN")}`;
}

export default function PaymentsManagement() {
  const [students, setStudents] = useState<StudentPaymentInfo[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalStudents: 0,
    totalCollectedThisMonth: 0,
    totalPendingAmount: 0,
    overdueStudentsCount: 0,
    dueSoonStudentsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "OVERDUE" | "DUE_SOON" | "PAID">("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("ALL");

  // Modals state
  const [selectedStudentForLedger, setSelectedStudentForLedger] = useState<StudentPaymentInfo | null>(null);
  const [paymentModalData, setPaymentModalData] = useState<{
    student: StudentPaymentInfo;
    cycle: Cycle;
  } | null>(null);
  const [billingSettingsData, setBillingSettingsData] = useState<{
    student: StudentPaymentInfo;
    billingDay: number;
    monthlyFee: number;
  } | null>(null);

  // Payment form state
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formMethod, setFormMethod] = useState<string>("UPI");
  const [formTxnRef, setFormTxnRef] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formPaidDate, setFormPaidDate] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPayments = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(true);
  }, []);

  // Unique course titles for the course filter dropdown
  const uniqueCourseTitles = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.courseTitle).filter(Boolean))).sort();
  }, [students]);

  // Course-filtered students pool (for computing tab counts for selected course)
  const coursePool = useMemo(() => {
    if (courseFilter === "ALL") return students;
    return students.filter((s) => s.courseTitle === courseFilter);
  }, [students, courseFilter]);

  const tabCounts = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    let paid = 0;
    coursePool.forEach((s) => {
      if (s.overallStatus === "OVERDUE") overdue++;
      else if (s.overallStatus === "DUE_SOON") dueSoon++;
      else if (s.overallStatus === "PAID") paid++;
    });
    return {
      total: coursePool.length,
      overdue,
      dueSoon,
      paid,
    };
  }, [coursePool]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Course filter
      if (courseFilter !== "ALL" && s.courseTitle !== courseFilter) return false;

      // Tab filter
      if (activeTab === "OVERDUE" && s.overallStatus !== "OVERDUE") return false;
      if (activeTab === "DUE_SOON" && s.overallStatus !== "DUE_SOON") return false;
      if (activeTab === "PAID" && s.overallStatus !== "PAID") return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.studentName.toLowerCase().includes(q);
        const matchPhone = s.studentPhone.includes(q);
        const matchReg = s.registrationNo.toLowerCase().includes(q);
        const matchCourse = s.courseTitle.toLowerCase().includes(q);
        const matchGuardian = s.guardianName?.toLowerCase().includes(q) || false;
        if (!matchName && !matchPhone && !matchReg && !matchCourse && !matchGuardian) {
          return false;
        }
      }

      return true;
    });
  }, [students, courseFilter, activeTab, search]);

  // Open Payment Modal
  const handleOpenPaymentModal = (student: StudentPaymentInfo, targetCycle?: Cycle) => {
    const cycleToPay = targetCycle || student.nextDueCycle || student.cycles[0];
    setPaymentModalData({
      student,
      cycle: cycleToPay,
    });
    setFormAmount(cycleToPay.amount || student.monthlyFee);
    setFormMethod("UPI");
    setFormTxnRef("");
    setFormNotes("");
    setFormPaidDate(new Date().toISOString().split("T")[0]);
  };

  // Submit Payment Record
  const handleRecordPayment = async (andPrintReceipt: boolean = true) => {
    if (!paymentModalData) return;
    setSubmittingPayment(true);
    try {
      const payload = {
        enrollmentId: paymentModalData.student.id,
        cycleMonthIndex: paymentModalData.cycle.monthIndex,
        cycleLabel: paymentModalData.cycle.cycleLabel,
        amount: Number(formAmount),
        paymentMethod: formMethod,
        transactionRef: formTxnRef,
        notes: formNotes,
        paidDate: formPaidDate ? new Date(formPaidDate).toISOString() : new Date().toISOString(),
        dueDate: paymentModalData.cycle.dueDate,
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to record payment.");
        return;
      }

      // If user wants print receipt
      if (andPrintReceipt && data.receipt) {
        printMonthlyReceipt(data.receipt);
      }

      setPaymentModalData(null);
      await fetchPayments();

      // If ledger is open, update selected student
      if (selectedStudentForLedger && selectedStudentForLedger.id === paymentModalData.student.id) {
        const updatedStudent = students.find((s) => s.id === paymentModalData.student.id);
        if (updatedStudent) setSelectedStudentForLedger(updatedStudent);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving payment.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete payment record.");
        return;
      }
      await fetchPayments();
      if (selectedStudentForLedger) {
        setSelectedStudentForLedger(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting payment.");
    }
  };

  // Save Billing Settings (Day & Fee)
  const handleSaveBillingSettings = async () => {
    if (!billingSettingsData) return;
    try {
      const res = await fetch(`/api/enrollments/${billingSettingsData.student.id}/billing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingDay: billingSettingsData.billingDay,
          monthlyFee: `₹${billingSettingsData.monthlyFee}`,
        }),
      });
      if (!res.ok) {
        alert("Failed to update billing settings.");
        return;
      }
      setBillingSettingsData(null);
      await fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Error updating billing settings.");
    }
  };

  // Print Monthly Fee Receipt
  const printMonthlyReceipt = (receiptData: any) => {
    const html = generateMonthlyFeeReceiptHTML({
      receiptNo: receiptData.receiptNo,
      registrationNo: receiptData.registrationNo,
      studentName: receiptData.studentName,
      courseTitle: receiptData.courseTitle,
      cycleLabel: receiptData.cycleLabel,
      amount: receiptData.amount,
      paymentMode: receiptData.paymentMode || receiptData.paymentMethod,
      transactionRef: receiptData.transactionRef,
      date: receiptData.date || receiptData.paidDateFormatted,
      notes: receiptData.notes,
    });

    const printWin = window.open("", "_blank", "width=900,height=800");
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
    }
  };

  // Copy WhatsApp Reminder text
  const handleCopyReminder = (student: StudentPaymentInfo) => {
    const cycle = student.nextDueCycle || student.cycles[0];
    const text = buildFeeReminderText({
      studentName: student.studentName,
      guardianName: student.guardianName,
      studentPhone: student.studentPhone,
      courseTitle: student.courseTitle,
      cycleLabel: cycle?.cycleLabel || "Monthly Fee",
      amount: cycle?.amount || student.monthlyFee,
      dueDate: cycle?.dueDateFormatted || `${student.billingDay}th of month`,
      isOverdue: student.overallStatus === "OVERDUE",
      daysOverdue: cycle?.daysOverdue,
    });

    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminShell title="Fee & Payments Management">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-[#4DE8E0]" />
              <h1 className="text-xl font-bold text-[#F3F6FB]">Student Fee & Recurring Billing</h1>
            </div>
            <p className="mt-1 text-xs text-[#8891A8]">
              Automated anniversary-based monthly fee tracking, overdue detection & 1-click WhatsApp reminders.
            </p>
          </div>
          <button
            onClick={() => fetchPayments(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1D2436] bg-[#0F1420] px-3.5 py-2 text-xs font-medium text-[#F3F6FB] transition-colors hover:border-[#4DE8E0]/40 hover:text-[#4DE8E0]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#4DE8E0]" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Collected This Month */}
          <div className="rounded-xl border border-[#1D2436] bg-[#0F1420]/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#8891A8]">Collected This Month</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4DE8E0]/10 text-[#4DE8E0]">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#4DE8E0]">
              {fmtCurrency(summary.totalCollectedThisMonth)}
            </p>
            <p className="mt-1 text-[11px] text-[#8891A8]">Total fee received in calendar month</p>
          </div>

          {/* Card 2: Overdue Students */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-rose-400">Overdue Students</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-400">
              {summary.overdueStudentsCount} Students
            </p>
            <p className="mt-1 text-[11px] text-rose-300/80">
              Pending: {fmtCurrency(summary.totalPendingAmount)}
            </p>
          </div>

          {/* Card 3: Due Soon */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-amber-400">Due in Next 7 Days</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-400">
              {summary.dueSoonStudentsCount} Students
            </p>
            <p className="mt-1 text-[11px] text-amber-300/80">Upcoming anniversary cycle</p>
          </div>

          {/* Card 4: Total Enrolled */}
          <div className="rounded-xl border border-[#1D2436] bg-[#0F1420]/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#8891A8]">Total Enrolled Students</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B7CFF]/10 text-[#8B7CFF]">
                <User className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#F3F6FB]">{summary.totalStudents}</p>
            <p className="mt-1 text-[11px] text-[#8891A8]">Active students on monthly cycle</p>
          </div>
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#1D2436] bg-[#0A0D16] p-1">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "ALL"
                  ? "bg-[#1D2436] text-[#F3F6FB]"
                  : "text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              All Students ({tabCounts.total})
            </button>
            <button
              onClick={() => setActiveTab("OVERDUE")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "OVERDUE"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-rose-400 hover:bg-rose-500/10"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full bg-rose-400 ${tabCounts.overdue > 0 ? "animate-pulse" : ""}`} />
              Overdue ({tabCounts.overdue})
            </button>
            <button
              onClick={() => setActiveTab("DUE_SOON")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "DUE_SOON"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Due Soon ({tabCounts.dueSoon})
            </button>
            <button
              onClick={() => setActiveTab("PAID")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "PAID"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Up to Date ({tabCounts.paid})
            </button>
          </div>

          {/* Search Box & Course Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8891A8]" />
              <input
                type="text"
                placeholder="Search by student, phone, reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1D2436] bg-[#0F1420] py-2 pl-9 pr-3 text-xs text-[#F3F6FB] placeholder-[#8891A8] focus:border-[#4DE8E0] focus:outline-none transition-all"
              />
            </div>

            {/* Course Filter Dropdown */}
            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full sm:w-auto pl-3.5 pr-8 py-2 rounded-lg bg-[#0F1420] border border-[#4DE8E0]/30 text-[#4DE8E0] font-semibold text-xs focus:outline-none focus:border-[#4DE8E0] transition-all appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0F1420] text-[#F3F6FB]">🎓 All Courses</option>
                {uniqueCourseTitles.map((title) => (
                  <option key={title} value={title} className="bg-[#0F1420] text-[#F3F6FB]">
                    {title}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4DE8E0] text-[10px]">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Student Table / Cards */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#1D2436] bg-[#0F1420]">
            <RefreshCw className="h-6 w-6 animate-spin text-[#4DE8E0]" />
            <p className="mt-3 text-xs text-[#8891A8]">Calculating anniversary billing cycles...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#1D2436] bg-[#0F1420] p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400/60" />
            <p className="mt-3 text-sm font-semibold text-[#F3F6FB]">
              {activeTab === "OVERDUE"
                ? `No Overdue Students ${courseFilter !== "ALL" ? `in "${courseFilter}"` : ""}`
                : activeTab === "DUE_SOON"
                ? `No Upcoming Dues ${courseFilter !== "ALL" ? `in "${courseFilter}"` : ""}`
                : "No students found"}
            </p>
            <p className="mt-1 text-xs text-[#8891A8] max-w-md">
              {activeTab === "OVERDUE"
                ? `Is course ke sabhi students ki fee up-to-date hai! Inka next billing cycle aage ki dates me aayega.`
                : "No student matches the current filter or search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#1D2436] bg-[#0F1420]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1D2436] bg-[#0A0D16] text-[#8891A8]">
                    <th className="px-4 py-3 font-semibold">Student & Contact</th>
                    <th className="px-4 py-3 font-semibold">Course & Monthly Fee</th>
                    <th className="px-4 py-3 font-semibold">Billing Cycle Anchor</th>
                    <th className="px-4 py-3 font-semibold">Current Fee Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D2436]/60">
                  {filteredStudents.map((student) => {
                    const nextCycle = student.nextDueCycle;
                    const isOverdue = student.overallStatus === "OVERDUE";
                    const isDueSoon = student.overallStatus === "DUE_SOON";

                    const waUrl = nextCycle
                      ? generateWhatsAppReminderUrl({
                          studentName: student.studentName,
                          guardianName: student.guardianName,
                          studentPhone: student.studentPhone,
                          courseTitle: student.courseTitle,
                          cycleLabel: nextCycle.cycleLabel,
                          amount: nextCycle.amount || student.monthlyFee,
                          dueDate: nextCycle.dueDateFormatted,
                          isOverdue,
                          daysOverdue: nextCycle.daysOverdue,
                        })
                      : "#";

                    return (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-[#151B2B]/60"
                      >
                        {/* Student Details */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[#F3F6FB]">{student.studentName}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8891A8]">
                            <span className="font-mono text-[#4DE8E0]">{student.registrationNo}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {student.studentPhone}
                            </span>
                          </div>
                          {student.guardianName && (
                            <div className="mt-0.5 text-[10px] text-[#8891A8]">
                              Parent: {student.guardianName}
                            </div>
                          )}
                        </td>

                        {/* Course & Fee */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-medium text-[#F3F6FB]">
                            <BookOpen className="h-3.5 w-3.5 text-[#8B7CFF]" />
                            {student.courseTitle}
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-emerald-400">
                            {fmtCurrency(student.monthlyFee)} / month
                          </div>
                        </td>

                        {/* Billing Cycle Anchor */}
                        <td className="px-4 py-3.5">
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-[#1D2436]/60 px-2.5 py-1 text-[11px] font-medium text-[#F3F6FB]">
                            <Calendar className="h-3 w-3 text-[#4DE8E0]" />
                            Due on {student.billingDay}th of month
                          </div>
                          <div className="mt-1 text-[10px] text-[#8891A8]">
                            Joined: {student.admissionDateFormatted}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5">
                          {isOverdue && nextCycle ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/30">
                                <AlertTriangle className="h-3 w-3" />
                                OVERDUE: {nextCycle.daysOverdue} Days
                              </span>
                              <p className="mt-1 text-[11px] font-medium text-rose-300">
                                {nextCycle.cycleLabel} (Due {nextCycle.dueDateFormatted})
                              </p>
                            </div>
                          ) : isDueSoon && nextCycle ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                                <Clock className="h-3 w-3" />
                                DUE IN {nextCycle.daysRemaining} DAYS
                              </span>
                              <p className="mt-1 text-[11px] text-[#8891A8]">
                                {nextCycle.cycleLabel} (Due {nextCycle.dueDateFormatted})
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                UP TO DATE
                              </span>
                              <p className="mt-1 text-[11px] text-[#8891A8]">
                                Next: {nextCycle?.dueDateFormatted || "Upcoming cycle"}
                              </p>
                            </div>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Collect Fee Button */}
                            <button
                              onClick={() => handleOpenPaymentModal(student)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#4DE8E0] px-3 py-1.5 text-xs font-semibold text-[#090C14] transition-opacity hover:opacity-90 shadow-sm"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Collect Fee
                            </button>

                            {/* WhatsApp Reminder (wa.me) */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Send WhatsApp Reminder"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>

                            {/* Copy Reminder Text */}
                            <button
                              onClick={() => handleCopyReminder(student)}
                              title="Copy Reminder Message"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-colors hover:border-[#4DE8E0] hover:text-[#4DE8E0]"
                            >
                              {copiedId === student.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Student Ledger / History */}
                            <button
                              onClick={() => setSelectedStudentForLedger(student)}
                              title="View Fee Ledger / History"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-colors hover:border-[#8B7CFF] hover:text-[#8B7CFF]"
                            >
                              <History className="h-3.5 w-3.5" />
                            </button>

                            {/* Edit Billing Settings */}
                            <button
                              onClick={() =>
                                setBillingSettingsData({
                                  student,
                                  billingDay: student.billingDay,
                                  monthlyFee: student.monthlyFee,
                                })
                              }
                              title="Edit Billing Day / Fee"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#1D2436] bg-[#0F1420] text-[#8891A8] transition-colors hover:border-amber-400 hover:text-amber-400"
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODAL 1: RECORD PAYMENT ================= */}
        {paymentModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setPaymentModalData(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4DE8E0]/10 text-[#4DE8E0]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F3F6FB]">Collect & Record Monthly Fee</h3>
                  <p className="text-xs text-[#8891A8]">
                    {paymentModalData.student.studentName} ({paymentModalData.student.registrationNo})
                  </p>
                </div>
              </div>

              {/* Cycle Info Box */}
              <div className="mt-4 rounded-xl border border-[#1D2436] bg-[#0A0D16] p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8891A8]">Course:</span>
                  <span className="font-medium text-[#F3F6FB]">{paymentModalData.student.courseTitle}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[#8891A8]">Fee Cycle:</span>
                  <span className="font-bold text-[#4DE8E0]">{paymentModalData.cycle.cycleLabel}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[#8891A8]">Due Date:</span>
                  <span className="text-[#F3F6FB]">{paymentModalData.cycle.dueDateFormatted}</span>
                </div>
              </div>

              {/* Form */}
              <div className="mt-4 space-y-3.5">
                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-[#8891A8]">Fee Amount (₹)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[#1D2436] bg-[#0A0D16] px-3 py-2 text-sm font-bold text-[#4DE8E0] focus:border-[#4DE8E0] focus:outline-none"
                    placeholder="₹3,000"
                  />
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="text-xs font-semibold text-[#8891A8]">Payment Mode</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1D2436] bg-[#0A0D16] px-3 py-2 text-xs text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm / QR)</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS)</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="ONLINE">Online Portal</option>
                  </select>
                </div>

                {/* Payment Date & Txn Ref */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#8891A8]">Payment Date</label>
                    <input
                      type="date"
                      value={formPaidDate}
                      onChange={(e) => setFormPaidDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#1D2436] bg-[#0A0D16] px-3 py-2 text-xs text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#8891A8]">Ref / UTR / Txn ID</label>
                    <input
                      type="text"
                      value={formTxnRef}
                      onChange={(e) => setFormTxnRef(e.target.value)}
                      placeholder="e.g. 43920194812"
                      className="mt-1 w-full rounded-lg border border-[#1D2436] bg-[#0A0D16] px-3 py-2 text-xs text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-[#8891A8]">Internal Notes (Optional)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Received by admin via cash"
                    className="mt-1 w-full rounded-lg border border-[#1D2436] bg-[#0A0D16] px-3 py-2 text-xs text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentModalData(null)}
                  className="rounded-lg border border-[#1D2436] bg-[#0A0D16] px-4 py-2 text-xs font-medium text-[#8891A8] hover:text-[#F3F6FB]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingPayment}
                  onClick={() => handleRecordPayment(false)}
                  className="rounded-lg border border-[#1D2436] bg-[#1D2436] px-4 py-2 text-xs font-semibold text-[#F3F6FB] hover:bg-[#2A344E]"
                >
                  Save Only
                </button>
                <button
                  type="button"
                  disabled={submittingPayment}
                  onClick={() => handleRecordPayment(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] px-4 py-2 text-xs font-bold text-[#090C14] transition-opacity hover:opacity-95"
                >
                  <Printer className="h-3.5 w-3.5" />
                  {submittingPayment ? "Saving..." : "Collect & Print Receipt"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: STUDENT FEE LEDGER (HISTORY) ================= */}
        {selectedStudentForLedger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setSelectedStudentForLedger(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B7CFF]/15 text-[#8B7CFF]">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F3F6FB]">
                    {selectedStudentForLedger.studentName} — Fee Ledger
                  </h3>
                  <p className="text-xs text-[#8891A8]">
                    Reg No: <span className="font-mono text-[#4DE8E0]">{selectedStudentForLedger.registrationNo}</span> | Course: {selectedStudentForLedger.courseTitle}
                  </p>
                </div>
              </div>

              {/* Summary Sub-header */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-3">
                  <p className="text-[11px] text-[#8891A8]">Billing Day</p>
                  <p className="mt-0.5 text-sm font-bold text-[#F3F6FB]">
                    Every {selectedStudentForLedger.billingDay}th of month
                  </p>
                </div>
                <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-3">
                  <p className="text-[11px] text-[#8891A8]">Monthly Fee</p>
                  <p className="mt-0.5 text-sm font-bold text-emerald-400">
                    {fmtCurrency(selectedStudentForLedger.monthlyFee)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#1D2436] bg-[#0A0D16] p-3">
                  <p className="text-[11px] text-[#8891A8]">Total Paid to Date</p>
                  <p className="mt-0.5 text-sm font-bold text-[#4DE8E0]">
                    {fmtCurrency(selectedStudentForLedger.totalPaidAmount)}
                  </p>
                </div>
              </div>

              {/* Timeline Table of Cycles */}
              <div className="mt-5">
                <h4 className="text-xs font-semibold text-[#8891A8] uppercase tracking-wider">
                  Monthly Cycle Breakdown
                </h4>
                <div className="mt-2.5 space-y-2">
                  {selectedStudentForLedger.cycles.map((c) => {
                    const isPaid = c.status === "PAID";
                    const isOverdue = c.status === "OVERDUE";
                    const isDueSoon = c.status === "DUE_SOON";

                    return (
                      <div
                        key={c.monthIndex}
                        className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                          isPaid
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : isOverdue
                            ? "border-rose-500/20 bg-rose-500/5"
                            : isDueSoon
                            ? "border-amber-500/20 bg-amber-500/5"
                            : "border-[#1D2436] bg-[#0A0D16]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                              isPaid
                                ? "bg-emerald-500/20 text-emerald-400"
                                : isOverdue
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-[#1D2436] text-[#8891A8]"
                            }`}
                          >
                            M{c.monthIndex}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#F3F6FB] text-xs">{c.cycleLabel}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isPaid
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : isOverdue
                                    ? "bg-rose-500/20 text-rose-400"
                                    : isDueSoon
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-[#1D2436] text-[#8891A8]"
                                }`}
                              >
                                {isPaid ? "PAID" : isOverdue ? `OVERDUE (${c.daysOverdue}d)` : isDueSoon ? "DUE SOON" : "UPCOMING"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8891A8]">
                              Due: {c.dueDateFormatted}
                              {isPaid && c.paidDateFormatted && ` • Paid on ${c.paidDateFormatted} via ${c.paymentMethod}`}
                              {c.receiptNo && ` • Rec: ${c.receiptNo}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#F3F6FB]">{fmtCurrency(c.amount)}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isPaid ? (
                              <>
                                <button
                                  onClick={() =>
                                    printMonthlyReceipt({
                                      receiptNo: c.receiptNo || `NA-FEE-${selectedStudentForLedger.registrationNo}`,
                                      registrationNo: selectedStudentForLedger.registrationNo,
                                      studentName: selectedStudentForLedger.studentName,
                                      courseTitle: selectedStudentForLedger.courseTitle,
                                      cycleLabel: c.cycleLabel,
                                      amount: c.amount,
                                      paymentMode: c.paymentMethod || "UPI",
                                      transactionRef: c.transactionRef,
                                      date: c.paidDateFormatted,
                                      notes: c.notes,
                                    })
                                  }
                                  title="Print Receipt"
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#1D2436] bg-[#0F1420] px-2.5 py-1 text-xs font-medium text-[#4DE8E0] hover:border-[#4DE8E0]"
                                >
                                  <Printer className="h-3 w-3" />
                                  Receipt
                                </button>
                                {c.paymentId && c.paymentId !== "INITIAL_REGISTRATION" && (
                                  <button
                                    onClick={() => handleDeletePayment(c.paymentId!)}
                                    title="Delete Payment Record"
                                    className="rounded-lg p-1.5 text-rose-400/70 hover:bg-rose-500/10 hover:text-rose-400"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedStudentForLedger(null);
                                  handleOpenPaymentModal(selectedStudentForLedger, c);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#4DE8E0] px-3 py-1 text-xs font-semibold text-[#090C14] hover:opacity-90"
                              >
                                <Plus className="h-3 w-3" />
                                Collect
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 3: EDIT BILLING SETTINGS ================= */}
        {billingSettingsData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              <button
                onClick={() => setBillingSettingsData(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F3F6FB]">Customize Student Billing Cycle</h3>
                  <p className="text-xs text-[#8891A8]">{billingSettingsData.student.studentName}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#8891A8]">
                    Monthly Billing Day (Day of Month, 1 to 31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={billingSettingsData.billingDay}
                    onChange={(e) =>
                      setBillingSettingsData({
                        ...billingSettingsData,
                        billingDay: Math.max(1, Math.min(31, parseInt(e.target.value) || 1)),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#1D2436] bg-[#0A0D16] px-3 py-2 text-xs text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-[#8891A8]">
                    Student will be billed on the {billingSettingsData.billingDay}th of every month.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8891A8]">Monthly Fee Amount (₹)</label>
                  <input
                    type="number"
                    value={billingSettingsData.monthlyFee}
                    onChange={(e) =>
                      setBillingSettingsData({
                        ...billingSettingsData,
                        monthlyFee: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#1D2436] bg-[#0A0D16] px-3 py-2 text-xs font-bold text-emerald-400 focus:border-[#4DE8E0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setBillingSettingsData(null)}
                  className="rounded-lg border border-[#1D2436] bg-[#0A0D16] px-4 py-2 text-xs font-medium text-[#8891A8] hover:text-[#F3F6FB]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBillingSettings}
                  className="rounded-lg bg-[#4DE8E0] px-4 py-2 text-xs font-bold text-[#090C14] hover:opacity-90"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
