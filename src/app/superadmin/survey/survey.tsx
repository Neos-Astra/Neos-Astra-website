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

const QUESTION_MAP: Record<string, string> = {
  ngo: "NGO Name (PREM / ISARA / LIPICA / ARUNA)",
  A1: "A1. Age",
  A2: "A2. Gender",
  A3: "A3. Highest educational qualification",
  A4: "A4. Primary role",
  A5: "A5. Years in NGO/social sector",
  A6: "A6. Approximate organisation size",
  A7: "A7. Primary area(s) of work",
  A8: "A8. Proportion of work with vulnerable populations",
  B1: "B1. Frequency of AI use before programme",
  B2: "B2. AI tools used before programme",
  B3: "B3. Overall AI proficiency before programme (1-5)",
  B4: "B4. Confidence learning new AI tool without help (1-5)",
  B5: "B5. Perception of AI usefulness before programme",
  F1: "F1. Current AI use frequency",
  F2: "F2. Activities actually used AI for",
  F3: "F3. Approx. time saved weekly",
  F4: "F4. Has AI improved work quality",
  F5: "F5. Tasks enabled by AI previously impossible",
  F6: "F6. Reduced need for colleague assistance",
  F7: "F7. Introduced AI tool/workflow into org",
  F7_description: "F7 Description: Introduced AI workflow details",
  G6: "G6. Org guidelines for employee data",
  G7: "G7. Org guidelines for beneficiary data",
  G8: "G8. Entered real org info into AI",
  G9: "G9. Entered beneficiary info into AI",
  H1: "H1. Trust in AI-generated info",
  H2: "H2. Verification frequency for factual info",
  H3: "H3. Sources used for verification",
  H4: "H4. Change in verification tendency",
  I1: "I1. MCQ: AI statistic verification",
  I2: "I2. MCQ: Effective prompt formulation",
  I3: "I3. MCQ: Anonymising beneficiary data",
  I4: "I4. MCQ: Definition of AI hallucination",
  I5: "I5. MCQ: Handling demographic bias in AI",
  I6: "I6. MCQ: Meaningful human oversight",
  I7: "I7. MCQ: Least appropriate task for automation",
  I8: "I8. MCQ: AI citation accuracy assumption",
  I9: "I9. MCQ: Responsible AI adoption description",
  I10: "I10. MCQ: Key question before deploying AI",
  K1: "K1. Created more accessible content with AI",
  K2: "K2. Accessibility applications used",
  K3: "K3. AI can reduce digital exclusion",
  K4: "K4. AI can create new forms of exclusion",
  K5: "K5. Groups potentially disadvantaged by AI",
  L1: "L1. Formal AI-use policy in org",
  L2: "L2. Guidance received on responsible AI use",
  L3: "L3. Org guidelines on confidential data",
  L4: "L4. Org verification process before publishing",
  M0: "M0. Overall usefulness of 24-day programme (0-10)",
  M1: "M1. Change in understanding of AI",
  M2: "M2. Change in confidence using AI",
  M3: "M3. Change in actual AI use",
  M4: "M4. Change in awareness of AI risks",
  M5: "M5. Change in privacy/data risk awareness",
  M6: "M6. Change in evaluating AI outputs",
  M7: "M7. Change in identifying NGO AI applications",
  M8: "M8. Change in willingness to introduce AI to org",
  O1: "O1. How tasks were performed before AI",
  O2: "O2. How tasks are performed after programme",
  O3: "O3. Activities comfortable with AI recommendations + human decision",
  P1: "P1. Most surprising thing learned about AI",
  P2: "P2. Task can now do using AI previously couldn't",
  P3: "P3. Situation where AI was wrong/misleading",
  P4: "P4. Programme impact on privacy understanding",
  P5: "P5. Programme impact on beneficiary risk understanding",
  P6: "P6. Most valuable AI application for organisation",
  P7: "P7. Biggest risk of AI adoption for organisation",
  P8: "P8. What prevents more effective AI use in org",
  P9: "P9. AI policy/guidance wanted in organisation",
  P10: "P10. One topic to add to programme",
  P11: "P11. Other AI tools you want to learn about",
  P12: "P12. Painful official/field tasks wishing AI tool existed for",
  Q1: "Q1. Is AI primarily empowering, risky, or both?",
  Q2: "Q2. Explanation for reflection",
  R1: "R1. Research consent statement",
  R2: "R2. Optional follow-up interview",
};

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
  const [ngoFilter, setNgoFilter] = useState<string>("ALL");

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this survey submission?")) return;

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
    const role = r.participantRole || r.answers?.A4 || "";
    const org = r.orgSize || r.answers?.A6 || "";
    const ngo = r.answers?.ngo || r.researchId || "";
    const dateVal = r.date || "";

    if (ngoFilter !== "ALL" && ngo.toUpperCase() !== ngoFilter.toUpperCase()) {
      return false;
    }

    const matchesSearch =
      ngo.toLowerCase().includes(search.toLowerCase()) ||
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

    const allKeysSet = new Set<string>();
    filtered.forEach((r) => {
      if (r.answers && typeof r.answers === "object") {
        Object.keys(r.answers).forEach((k) => allKeysSet.add(k));
      }
    });

    const answerKeys = Array.from(allKeysSet).sort();

    const headers = [
      "Response ID",
      "Submission Timestamp",
      "NGO Name",
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
        escapeCSV(ans.ngo || ""),
        escapeCSV(r.participantRole || ans.A4 || ""),
        escapeCSV(r.orgSize || ans.A6 || ""),
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
            {responses.length} total submission{responses.length !== 1 ? "s" : ""} recorded in database
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all w-full sm:w-auto"
            title="Download currently filtered survey responses to CSV"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV ({filtered.length})
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
            placeholder="Search by participant role, org size, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] placeholder:text-[#8891A8]/60 text-sm transition-all"
          />
        </div>

        {/* NGO Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-xl border border-[#1D2436] bg-[#0F1420] p-3 text-xs">
          <span className="text-[#8891A8] font-semibold mr-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span> Filter by NGO:
          </span>
          {["ALL", "PREM", "ISARA", "LIPICA", "ARUNA"].map((ngo) => {
            const isSelected = ngoFilter === ngo;
            const count = ngo === "ALL" 
              ? responses.length 
              : responses.filter(r => (r.answers?.ngo || r.researchId || "").toUpperCase() === ngo).length;
            return (
              <button
                key={ngo}
                onClick={() => setNgoFilter(ngo)}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  isSelected
                    ? "bg-[#38BDF8] text-[#090C14] shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                    : "bg-[#090C14] border border-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB] hover:border-[#38BDF8]/40"
                }`}
              >
                {ngo === "ALL" ? "All NGOs" : ngo} ({count})
              </button>
            );
          })}
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">NGO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Participant Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Org Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Submitted At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => (
                <tr key={res.id} className="border-b border-[#1D2436] bg-[#090C14] hover:bg-[#0F1420] transition-colors">
                  <td className="px-4 py-3 font-extrabold text-[#38BDF8]">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-xs font-bold tracking-wide">
                      {res.answers?.ngo || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#4DE8E0]">
                    {res.participantRole || res.answers?.A4 || "Participant"}
                  </td>
                  <td className="px-4 py-3 text-[#F3F6FB]">
                    {res.orgSize || res.answers?.A6 || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8891A8]">
                    {new Date(res.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedResponse(res)}
                        className="flex items-center gap-1 rounded-lg border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-3 py-1.5 text-xs font-semibold text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Full Questionnaire
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        title="Delete Response"
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="min-h-full flex items-center justify-center py-6">
            <div className="relative w-full max-w-4xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-3 py-1 rounded-lg bg-[#38BDF8]/20 border border-[#38BDF8]/50 text-[#38BDF8] text-xs font-black tracking-wide uppercase">
                      NGO: {selectedResponse.answers?.ngo || selectedResponse.researchId || "Not specified"}
                    </span>
                  </div>
                  <h2 className="font-bold text-[#F3F6FB] text-xl">
                    Questionnaire Response ({selectedResponse.participantRole || selectedResponse.answers?.A4 || "Participant"})
                  </h2>
                  <p className="text-xs text-[#4DE8E0] mt-1">
                    Submitted on {new Date(selectedResponse.createdAt).toLocaleString("en-IN")} &nbsp;|&nbsp; Response ID: {selectedResponse.id}
                  </p>
                </div>
                <button onClick={() => setSelectedResponse(null)} className="text-[#8891A8] hover:text-[#F3F6FB]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-[#1D2436] bg-[#090C14] mb-6">
                <div>
                  <p className="text-[11px] text-[#38BDF8] uppercase font-mono font-bold">Selected NGO</p>
                  <p className="font-black text-[#38BDF8] text-base">{selectedResponse.answers?.ngo || selectedResponse.researchId || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8891A8] uppercase font-mono">Role (A4)</p>
                  <p className="font-bold text-[#4DE8E0] text-sm">{selectedResponse.participantRole || selectedResponse.answers?.A4 || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8891A8] uppercase font-mono">Org Size (A6)</p>
                  <p className="font-bold text-white text-sm">{selectedResponse.orgSize || selectedResponse.answers?.A6 || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8891A8] uppercase font-mono">Submitted At</p>
                  <p className="font-bold text-slate-300 text-xs">{new Date(selectedResponse.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              {/* Detailed Answers Grid */}
              <div className="max-h-[65vh] overflow-y-auto pr-2 space-y-6 text-sm">
                {/* Qualitative Questions (P1 - P12) */}
                <div className="space-y-3">
                  <h3 className="font-bold text-[#4DE8E0] text-sm border-b border-[#1D2436] pb-1 uppercase tracking-wider">
                    Qualitative Research Answers (Section P)
                  </h3>
                  <div className="space-y-3">
                    {["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"].map((pk) => {
                      const ansVal = selectedResponse.answers?.[pk];
                      if (!ansVal) return null;
                      return (
                        <div key={pk} className="p-3.5 rounded-xl border border-[#1D2436] bg-[#090C14]">
                          <p className="font-bold text-[#38BDF8] text-xs mb-1">
                            {QUESTION_MAP[pk] || pk}:
                          </p>
                          <p className="text-[#F3F6FB] text-xs leading-relaxed whitespace-pre-wrap">
                            {String(ansVal)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Answers Breakdown */}
                <div className="space-y-3">
                  <h3 className="font-bold text-[#8B7CFF] text-sm border-b border-[#1D2436] pb-1 uppercase tracking-wider">
                    Complete Answers Dictionary (A to R)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedResponse.answers || {}).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-lg border border-[#1D2436] bg-[#090C14] text-xs">
                        <span className="font-bold text-[#4DE8E0] font-mono">
                          {QUESTION_MAP[key] || key}:{" "}
                        </span>
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
                  className="px-6 py-2.5 rounded-xl bg-[#1D2436] text-white text-xs font-bold hover:bg-[#2A344D] transition-all"
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
