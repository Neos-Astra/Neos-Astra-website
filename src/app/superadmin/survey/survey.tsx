"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Eye, X, RefreshCw, Trash2, Calendar, FileSpreadsheet } from "lucide-react";
import AdminShell from "@/app/components/AdminShell";

interface SurveyResponse {
  id: string;
  researchId: string | null;
  date: string | null;
  participantRole: string | null;
  orgSize: string | null;
  answers: Record<string, any>;
  createdAt: string;
}

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default function SurveyManagement() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "YESTERDAY" | "THIS_MONTH" | "CUSTOM">("ALL");
  const [customDate, setCustomDate] = useState<string>("");

  const fetchResponses = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/survey");
      const data = await res.json();
      if (Array.isArray(data)) setResponses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses(true);
  }, []);

  const handleDelete = async (id: string, researchId: string | null) => {
    const label = researchId ? `Research ID "${researchId}"` : "this submission";
    if (!confirm(`Are you sure you want to delete ${label}?`)) return;

    setResponses((prev) => prev.filter((item) => item.id !== id));
    if (selectedResponse && selectedResponse.id === id) setSelectedResponse(null);

    try {
      await fetch(`/api/survey/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchResponses();
    }
  };

  const todayCount = responses.filter((r) => isSameDay(new Date(r.createdAt), new Date())).length;

  const filtered = responses.filter((r) => {
    const rId = r.researchId || "";
    const role = r.participantRole || "";
    const org = r.orgSize || "";
    const dateVal = r.date || "";

    const matchesSearch =
      rId.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase()) ||
      org.toLowerCase().includes(search.toLowerCase()) ||
      dateVal.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === "ALL") return true;

    const itemDate = new Date(r.createdAt);
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

  // Export filtered survey responses to CSV
  const exportToCSV = () => {
    if (filtered.length === 0) {
      alert("No survey responses found for the current filter to export.");
      return;
    }

    // Extract all unique answer keys across all filtered responses
    const allKeysSet = new Set<string>();
    filtered.forEach((r) => {
      if (r.answers && typeof r.answers === "object") {
        Object.keys(r.answers).forEach((k) => allKeysSet.add(k));
      }
    });

    const answerKeys = Array.from(allKeysSet).sort();

    const headers = [
      "Response ID",
      "Submission Date",
      "Research ID",
      "Date",
      "Primary Role",
      "Org Size",
      ...answerKeys,
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      if (Array.isArray(val)) return `"${val.join("; ").replace(/"/g, '""')}"`;
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filtered.map((r) => {
      const ans = r.answers || {};
      const rowAns = answerKeys.map((k) => escapeCSV(ans[k]));
      return [
        escapeCSV(r.id),
        escapeCSV(new Date(r.createdAt).toLocaleString("en-IN")),
        escapeCSV(r.researchId || ""),
        escapeCSV(r.date || ""),
        escapeCSV(r.participantRole || ""),
        escapeCSV(r.orgSize || ""),
        ...rowAns,
      ].join(",");
    });

    const csvString = [headers.map(escapeCSV).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `NGO_Survey_Submissions_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminShell title="NGO Survey Submissions">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#F3F6FB]">NGO 24-Day AI Survey Responses</h1>
            <span className="rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-3 py-0.5 text-xs font-bold text-[#38BDF8]">
              Today: {todayCount}
            </span>
          </div>
          <p className="text-sm text-[#8891A8] mt-1">
            {responses.length} total questionnaire submission{responses.length !== 1 ? "s" : ""} received
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all w-full sm:w-auto"
            title="Download currently filtered survey responses to CSV"
          >
            <FileSpreadsheet className="h-4 w-4" /> Download CSV ({filtered.length})
          </button>
          <button
            onClick={() => fetchResponses(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#1D2436] px-4 py-2.5 text-sm text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all w-full sm:w-auto"
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
            placeholder="Search by Research ID, role, org size, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] placeholder:text-[#8891A8]/60 text-sm transition-all"
          />
        </div>

        {/* Date Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-[#1D2436] bg-[#0F1420] p-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-[#8891A8] font-medium mr-1 flex items-center gap-1 w-full sm:w-auto mb-1 sm:mb-0">
              <Calendar className="h-3.5 w-3.5 text-[#38BDF8]" /> Filter Date:
            </span>

            <button
              onClick={() => setDateFilter("ALL")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                dateFilter === "ALL"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              All Time ({responses.length})
            </button>

            <button
              onClick={() => setDateFilter("TODAY")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                dateFilter === "TODAY"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              Today ({todayCount})
            </button>

            <button
              onClick={() => setDateFilter("YESTERDAY")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                dateFilter === "YESTERDAY"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={() => setDateFilter("THIS_MONTH")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                dateFilter === "THIS_MONTH"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => setDateFilter("CUSTOM")}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                dateFilter === "CUSTOM"
                  ? "bg-[#38BDF8] text-[#090C14] font-bold"
                  : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
              }`}
            >
              Custom Date
            </button>

            {dateFilter === "CUSTOM" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full sm:w-auto mt-1 sm:mt-0 px-3 py-1 bg-[#090C14] border border-[#38BDF8]/40 text-[#38BDF8] text-xs rounded-lg outline-none font-mono"
              />
            )}
          </div>

          <div className="text-xs text-[#8891A8] self-end md:self-auto">
            Showing <span className="font-bold text-[#38BDF8]">{filtered.length}</span> response{filtered.length !== 1 ? "s" : ""}
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
          <FileText className="h-12 w-12 text-[#8891A8] opacity-40 mb-4" />
          <p className="text-[#F3F6FB] font-semibold">No survey submissions found</p>
          <p className="text-sm text-[#8891A8] mt-1">
            {search ? "Try a different search term" : "Submissions from /form will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#1D2436]">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-[#1D2436] bg-[#0F1420]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Research ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Org Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Consent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Date Submitted</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => (
                <tr key={res.id} className="border-b border-[#1D2436] bg-[#090C14] hover:bg-[#0F1420] transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#F3F6FB]">
                    {res.researchId || <span className="text-[#8891A8] italic">Anonymous</span>}
                  </td>
                  <td className="px-4 py-3 text-[#4DE8E0] font-medium">
                    {res.participantRole || res.answers?.A4 || "—"}
                  </td>
                  <td className="px-4 py-3 text-[#8891A8]">
                    {res.orgSize || res.answers?.A6 || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                      {res.answers?.R1 || "Agreed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8891A8]">
                    {new Date(res.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedResponse(res)}
                        className="flex items-center gap-1 rounded-lg border border-[#1D2436] px-3 py-1.5 text-xs text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all"
                      >
                        <Eye className="h-3 w-3" /> View Answers
                      </button>
                      <button
                        onClick={() => handleDelete(res.id, res.researchId)}
                        title="Delete Response"
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
      {selectedResponse && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div className="relative w-full max-w-4xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
                <div>
                  <h2 className="font-bold text-[#F3F6FB] text-lg">
                    Survey Response: {selectedResponse.researchId || "Anonymous"}
                  </h2>
                  <p className="text-xs text-[#4DE8E0]">
                    Submitted on {new Date(selectedResponse.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <button onClick={() => setSelectedResponse(null)} className="text-[#8891A8] hover:text-[#F3F6FB]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Detailed Answers Grid */}
              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-[#1D2436] bg-[#090C14]">
                  <div>
                    <p className="text-xs text-[#8891A8] uppercase font-mono">Research ID</p>
                    <p className="font-bold text-white">{selectedResponse.researchId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8891A8] uppercase font-mono">Date Field</p>
                    <p className="font-bold text-white">{selectedResponse.date || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8891A8] uppercase font-mono">Role</p>
                    <p className="font-bold text-[#4DE8E0]">{selectedResponse.participantRole || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8891A8] uppercase font-mono">Org Size</p>
                    <p className="font-bold text-white">{selectedResponse.orgSize || "—"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-[#38BDF8] border-b border-[#1D2436] pb-1">Answers Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedResponse.answers || {}).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-lg border border-[#1D2436] bg-[#090C14] text-xs">
                        <span className="font-bold text-[#4DE8E0] font-mono">{key}: </span>
                        <span className="text-[#C7CCDA]">
                          {Array.isArray(val) ? val.join(", ") : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#1D2436] pt-4 mt-6">
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="px-5 py-2 rounded-xl bg-[#1D2436] text-white text-xs font-semibold hover:bg-[#2A344D]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
