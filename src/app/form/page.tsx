"use client";

import React, { useState } from "react";

// Data structures for sections & questions
const TOOLS_LIST = [
  "ChatGPT",
  "Gemini",
  "Perplexity",
  "Google AI Studio",
  "Instrumental",
  "Grantable AI",
  "QuillBot",
  "Humanize",
  "Google Docs",
  "Google Sheets",
  "Gamma",
  "ElevenLabs",
  "HeyGen",
  "Notion AI",
  "Otter AI",
  "Canvas",
];

const SECTION_C_ROWS = [
  "I can identify useful AI applications for my work.",
  "I can write effective prompts/instructions.",
  "I can work with more than one AI tool.",
  "I can evaluate whether an AI answer is reliable.",
  "I can identify possible hallucinations.",
  "I understand the limitations of generative AI.",
  "I know what information should not be entered into an AI system.",
  "I can use AI without unnecessarily exposing personal/sensitive information.",
  "I can recognise potentially biased AI outputs.",
  "I can decide when AI should not be used.",
  "I can independently learn a new AI tool.",
  "I can integrate AI into an existing work process.",
  "I can explain AI risks to colleagues.",
  "I can use AI while retaining human responsibility for the final decision.",
];

const SECTION_D_ROWS = [
  "I understand the difference between traditional software automation and generative AI.",
  "I understand that generative AI can produce plausible but factually incorrect information.",
  "I understand that AI outputs depend partly on the information and instructions provided.",
  "I understand that different AI tools have different strengths and limitations.",
  "I can translate a real-world NGO problem into an appropriate AI task.",
  "I can break a complex task into smaller AI-assisted steps.",
  "I can formulate prompts specifying context, objective and desired output.",
  "I can iteratively improve an AI-generated result.",
  "I can combine multiple AI tools to complete a larger workflow.",
  "I routinely question AI-generated information rather than automatically accepting it.",
  "I know when AI-generated information should be independently verified.",
  "I can identify warning signs that an AI response may be hallucinated.",
  "I can distinguish an AI-generated opinion from evidence-supported information.",
  "I understand that fluent/confident AI output does not necessarily mean it is correct.",
  "I understand that AI systems can reproduce social biases.",
  "I understand that AI use can create privacy risks.",
  "I understand that AI-generated content can create legal or reputational risks.",
  "I understand why human oversight is necessary in consequential decisions.",
  "I understand that vulnerable populations may experience disproportionate harms from poorly designed AI.",
];

const SECTION_E_ROWS = [
  "I feel capable of learning an unfamiliar AI tool independently.",
  "I can usually figure out how to accomplish a new task using AI.",
  "I am comfortable experimenting with AI when I do not initially know the answer.",
  "I can decide whether a particular problem is suitable for AI.",
  "I can decide when AI should not be used.",
  "I can critically challenge an AI output even when it appears convincing.",
  "I can explain the limitations of AI to colleagues.",
  "AI has increased my ability to solve problems independently.",
  "I feel dependent on AI to complete tasks I previously performed myself.",
];

const SECTION_G_ROWS = [
  "Before this course, I understood that information entered into an AI system could create privacy/confidentiality risks.",
  "I know what categories of information from my organisation should not be entered into a public AI system.",
  "I would avoid entering identifiable beneficiary information into a public AI system unless appropriate safeguards existed.",
  "I know that removing a person's name does not necessarily make data anonymous.",
  "I consider privacy before deciding whether to use AI for an organisational task.",
];

const SECTION_J_ROWS = [
  "AI can unintentionally reinforce existing social inequalities.",
  "AI systems may affect vulnerable populations differently from the general population.",
  "AI-generated decisions affecting people should be explainable to an appropriate degree.",
  "People affected by significant AI-assisted decisions should have access to human review.",
  "Organisations should disclose significant uses of AI when appropriate.",
  "NGOs have a responsibility to assess the social consequences of AI systems they deploy.",
  "AI adoption is not successful if it increases exclusion for digitally disadvantaged groups.",
  "Efficiency gains should not automatically outweigh privacy or human-rights concerns.",
  "AI systems can reproduce biases in training data or surrounding social systems.",
  "AI governance should focus on communities with less ability to challenge automated decisions.",
];

const SECTION_L_ROWS = [
  "Senior leadership supports responsible AI experimentation.",
  "Employees are encouraged to experiment with AI.",
  "Employees know what AI uses are prohibited or inappropriate.",
  "My organisation has sufficient digital infrastructure to use AI effectively.",
  "My organisation has sufficient staff capacity to evaluate AI outputs.",
  "My organisation needs a formal responsible-AI framework.",
];

export default function NgoSurveyPage() {
  const [date, setDate] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRadioChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key: string, value: string) => {
    setAnswers((prev) => {
      const current: string[] = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const handleTextChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleToolChange = (toolIndex: number, colIndex: number, val: string) => {
    const key = `N_${toolIndex}_${colIndex}`;
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!answers.ngo) {
      setErrorMsg("Please select your NGO at the top (PREM, ISARA, LIPICA, or ARUNA).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchId: "",
          date,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit survey");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 text-center shadow-xl">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-3">
            Thank you for completing the questionnaire.
          </h2>
          <p className="text-[#475569] text-base leading-relaxed mb-6">
            Your response has been recorded successfully in our database.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setDate("");
            }}
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-extrabold rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans relative py-6 sm:py-10">
      <style jsx global>{`
        .survey-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 16px;
          position: relative;
          z-index: 10;
        }
        .survey-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          box-shadow: 0 20px 45px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px #F1F5F9;
          overflow: hidden;
        }
        .survey-hero {
          padding: 36px 30px 28px;
          background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
          border-bottom: 1px solid #E2E8F0;
        }
        .survey-section {
          padding: 32px 30px;
          border-top: 1px solid #E2E8F0;
        }
        .q-title {
          font-weight: 700;
          line-height: 1.45;
          margin-bottom: 12px;
          color: #0F172A;
          font-size: 15px;
        }
        .opts-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .opt-label {
          position: relative;
          display: block;
          flex: 1 1 130px;
          cursor: pointer;
        }
        .opt-label input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .opt-label span {
          display: block;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 12px 14px;
          background: #FFFFFF;
          transition: all 0.2s ease;
          line-height: 1.35;
          font-size: 14px;
          color: #334155;
          font-weight: 500;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }
        .opt-label:hover span {
          border-color: #2563EB;
          color: #0F172A;
          background: #F8FAFC;
        }
        .opt-label input:checked + span {
          border-color: #2563EB;
          background: #EFF6FF;
          color: #1D4ED8;
          font-weight: 700;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .other-input {
          margin-top: 10px;
          width: 100%;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          background: #FFFFFF;
          color: #0F172A;
          transition: all 0.2s ease;
        }
        .other-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        @media (max-width: 700px) {
          .survey-hero,
          .survey-section {
            padding: 22px 16px;
          }
        }
      `}</style>

      <div className="survey-container">
        <div className="survey-card">
          {/* Top subtle gradient line */}
          <div className="h-1.5 bg-gradient-to-r from-[#0284C7] via-[#2563EB] to-[#7C3AED]" />

          {/* Hero Section */}
          <div className="survey-hero text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              NGO 24 DAYS – 24 TOOLS AI PROGRAMME
            </h1>
            <div className="text-[#2563EB] text-base sm:text-lg font-bold mt-2">
              Impact assessment &amp; course recalibration feedback questionnaire
            </div>
            
            <div className="mt-3">
              <span className="inline-block bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] px-4 py-1.5 rounded-full text-xs font-semibold">
                Estimated time: 20–25 minutes &nbsp;|&nbsp; Please answer based on your actual experience.
              </span>
            </div>

          </div>

          <form onSubmit={handleSubmit}>
            {/* NGO SELECTION AT THE TOP */}
            <div className="survey-section bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 text-center sm:text-left">
                  <div>
                    <label className="text-sm font-extrabold uppercase tracking-wider text-[#1E40AF] flex items-center justify-center sm:justify-start gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse"></span>
                      Select NGO Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Please select the NGO / organisation you represent
                    </p>
                  </div>
                  {answers.ngo && (
                    <span className="self-center sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] bg-[#EFF6FF] px-3 py-1 rounded-full border border-[#BFDBFE] shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                      Selected: {answers.ngo}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {["PREM", "ISARA", "LIPICA", "ARUNA"].map((ngo) => {
                    const isChecked = answers.ngo === ngo;
                    return (
                      <label
                        key={ngo}
                        className={`relative flex items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer font-bold text-sm sm:text-base tracking-wide transition-all duration-200 select-none ${
                          isChecked
                            ? "bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1D4ED8] shadow-[0_0_15px_rgba(37,99,235,0.15)] ring-1 ring-[#2563EB] scale-[1.02]"
                            : "bg-white border-[#CBD5E1] text-[#334155] hover:border-[#2563EB] hover:text-[#0F172A] hover:bg-[#F8FAFC] shadow-sm"
                        }`}
                      >
                        <input
                          type="radio"
                          name="ngo"
                          value={ngo}
                          checked={isChecked}
                          onChange={() => handleRadioChange("ngo", ngo)}
                          className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                        />
                        <span>{ngo}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION A */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                A. PARTICIPANT &amp; ORGANISATIONAL PROFILE
              </h2>

              {/* A1 */}
              <RadioQuestion
                id="A1"
                title="Age"
                options={["Under 25", "25–34", "35–44", "45–54", "55–64", "65+"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              {/* A2 */}
              <RadioQuestion
                id="A2"
                title="Gender"
                options={["Male", "Female", "Non-binary / other", "Prefer not to say"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              {/* A3 */}
              <RadioQuestion
                id="A3"
                title="Highest educational qualification"
                options={[
                  "School",
                  "Diploma",
                  "Bachelor's",
                  "Master's",
                  "MPhil/PhD",
                  "Professional qualification",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onSelect={handleRadioChange}
                onTextChange={handleTextChange}
              />

              {/* A4 */}
              <RadioQuestion
                id="A4"
                title="Primary role"
                options={[
                  "Founder/Director/Leadership",
                  "Programme/Project management",
                  "Field/community worker",
                  "Teaching/training",
                  "Research",
                  "Fundraising/development",
                  "Communications/social media",
                  "Administration/operations",
                  "Finance/accounts",
                  "IT/digital",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onSelect={handleRadioChange}
                onTextChange={handleTextChange}
              />

              {/* A5 */}
              <RadioQuestion
                id="A5"
                title="Years in NGO/social sector"
                options={["<1", "1–3", "4–7", "8–15", ">15"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              {/* A6 */}
              <RadioQuestion
                id="A6"
                title="Approximate organisation size"
                options={["1–10", "11–25", "26–50", "51–100", "101–500", ">500"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              {/* A7 */}
              <CheckboxQuestion
                id="A7"
                title="Primary area(s) of work — select all"
                options={[
                  "Education",
                  "Disability",
                  "Women/gender",
                  "Children/youth",
                  "Health",
                  "Elderly",
                  "Rural development",
                  "Tribal/indigenous communities",
                  "Livelihoods",
                  "Environment/climate",
                  "Human rights",
                  "Governance/legal aid",
                  "Poverty/social protection",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />

              {/* A8 */}
              <RadioQuestion
                id="A8"
                title="Approx. proportion of work involving potentially vulnerable populations"
                options={["None", "<25%", "25–50%", "51–75%", ">75%"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {/* SECTION B */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                B. BASELINE AI USAGE &amp; LITERACY
              </h2>

              <RadioQuestion
                id="B1"
                title="Before this programme, how often did you use AI tools?"
                options={[
                  "Never",
                  "< monthly",
                  "Monthly",
                  "Weekly",
                  "Several times/week",
                  "Daily",
                  "Several times/day",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <CheckboxQuestion
                id="B2"
                title="Which AI tools had you used before the programme? Select all."
                options={[
                  "ChatGPT",
                  "Gemini",
                  "Perplexity",
                  "Google AI Studio",
                  "Grantable AI",
                  "QuillBot",
                  "Humanize",
                  "Google Docs/AI features",
                  "Google Sheets/AI features",
                  "Gamma",
                  "ElevenLabs",
                  "HeyGen",
                  "Notion AI",
                  "Otter AI",
                  "Canva/Canvas",
                  "Other",
                  "None",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />

              <RadioQuestion
                id="B3"
                title="Before the programme, rate your overall AI proficiency: 1 2 3 4 5 (Very low → Very high)"
                options={["1", "2", "3", "4", "5"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <RadioQuestion
                id="B4"
                title="Before the programme, how confident were you learning a new AI tool without assistance?"
                options={[
                  "1 Not at all",
                  "2 Slightly",
                  "3 Moderately",
                  "4 Very",
                  "5 Extremely",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <CheckboxQuestion
                id="B5"
                title="Before the programme, what did you think AI was mainly useful for? Select up to 3."
                options={[
                  "Writing",
                  "Search/information",
                  "Summarising",
                  "Translation",
                  "Images",
                  "Video",
                  "Data analysis",
                  "Research",
                  "Education/training",
                  "Automation",
                  "Programming",
                  "Fundraising/grants",
                  "Administration",
                  "Unsure",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />
            </div>

            {/* SECTION C */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-1">
                C. RETROSPECTIVE CHANGE FROM BEFORE THE COURSE
              </h2>
              <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                <div className="text-xs sm:text-sm text-[#1E3A8A] font-bold">
                  Compared with your ability before the programme:
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#2563EB] font-semibold">
                  <span>1 = Much worse</span>
                  <span>•</span>
                  <span>5 = Much better</span>
                </div>
              </div>
              <CompactRatingGroup
                id="C"
                rows={SECTION_C_ROWS}
                labels={["1 Much worse", "2 Slightly worse", "3 Same", "4 Slightly better", "5 Much better"]}
                minLabel="Much worse"
                maxLabel="Much better"
                answers={answers}
                onSelect={handleRadioChange}
              />

              <h2 className="text-xl font-extrabold text-[#0F172A] mt-8 mb-1">
                D. CURRENT AI LITERACY
              </h2>
              <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                <div className="text-xs sm:text-sm text-[#1E3A8A] font-bold">
                  Rate your current AI literacy statements:
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#2563EB] font-semibold">
                  <span>1 = Strongly Disagree</span>
                  <span>•</span>
                  <span>5 = Strongly Agree</span>
                </div>
              </div>
              <CompactRatingGroup
                id="D"
                rows={SECTION_D_ROWS}
                labels={["1 Strongly disagree", "2 Disagree", "3 Neither", "4 Agree", "5 Strongly agree"]}
                minLabel="Strongly disagree"
                maxLabel="Strongly agree"
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {/* SECTION E & F */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-1">
                E. AI SELF-EFFICACY &amp; AGENCY
              </h2>
              <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                <div className="text-xs sm:text-sm text-[#1E3A8A] font-bold">
                  Rate your confidence and agency with AI:
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#2563EB] font-semibold">
                  <span>1 = Strongly Disagree</span>
                  <span>•</span>
                  <span>5 = Strongly Agree</span>
                </div>
              </div>
              <CompactRatingGroup
                id="E"
                rows={SECTION_E_ROWS}
                labels={["1 Strongly disagree", "2 Disagree", "3 Neither", "4 Agree", "5 Strongly agree"]}
                minLabel="Strongly disagree"
                maxLabel="Strongly agree"
                answers={answers}
                onSelect={handleRadioChange}
              />

              <h2 className="text-xl font-extrabold text-[#0F172A] mt-8 mb-4">
                F. ACTUAL USE &amp; WORKPLACE IMPACT
              </h2>

              <RadioQuestion
                id="F1"
                title="How often do you currently use AI?"
                options={["Never", "< weekly", "1–2 times/week", "3–5 times/week", "Daily", "Several times/day"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <CheckboxQuestion
                id="F2"
                title="For which activities have you actually used AI since beginning the programme? Select all."
                options={[
                  "Writing/editing",
                  "Translation",
                  "Research/search",
                  "Summarisation",
                  "Reports",
                  "Grant proposals/fundraising",
                  "Social media",
                  "Presentations",
                  "Images",
                  "Video",
                  "Training/education",
                  "Data analysis/visualisation",
                  "Coding/automation",
                  "Meeting transcription",
                  "Administration",
                  "Strategic planning",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />

              <RadioQuestion
                id="F3"
                title="Approx. time saved in a typical working week:"
                options={["None", "<1 hr", "1–3 hrs", "3–5 hrs", "5–10 hrs", ">10 hrs", "Difficult to estimate"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <RadioQuestion
                id="F4"
                title="Has AI improved the quality of your work?"
                options={[
                  "Significantly decreased",
                  "Slightly decreased",
                  "No meaningful change",
                  "Slightly improved",
                  "Significantly improved",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <RadioQuestion
                id="F5"
                title="Has AI enabled you to perform tasks you previously could not perform?"
                options={["Yes, many", "Yes, a few", "Not really", "No"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <RadioQuestion
                id="F6"
                title="Has AI reduced your need to seek assistance from colleagues for some tasks?"
                options={["Significantly", "Somewhat", "No change", "Increased assistance needed"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <RadioQuestion
                id="F7"
                title="Have you introduced an AI tool/workflow into your organisation?"
                options={["Yes", "No", "Planning to", "Not sure"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <div className="mt-4 mb-6">
                <label className="q-title block">If yes, briefly describe:</label>
                <textarea
                  value={answers["F7_description"] || ""}
                  onChange={(e) => handleTextChange("F7_description", e.target.value)}
                  className="w-full border 1.5px border-[#CBD5E1] rounded-xl p-3.5 min-h-[110px] text-sm bg-white text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* SECTION G & H */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                G. PRIVACY &amp; DATA GOVERNANCE
              </h2>
              <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                <div className="text-xs sm:text-sm text-[#1E3A8A] font-bold">
                  Rate your understanding of privacy &amp; data governance:
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#2563EB] font-semibold">
                  <span>1 = Strongly Disagree</span>
                  <span>•</span>
                  <span>5 = Strongly Agree</span>
                </div>
              </div>
              <CompactRatingGroup
                id="G"
                rows={SECTION_G_ROWS}
                minLabel="Strongly disagree"
                maxLabel="Strongly agree"
                answers={answers}
                onSelect={handleRadioChange}
              />

              <div className="mt-6">
                <RadioQuestion
                  id="G6"
                  title="My organisation has clear guidelines governing what employee information can be entered into AI:"
                  options={["Yes", "No", "Partially", "I don't know"]}
                  answers={answers}
                  onSelect={handleRadioChange}
                />
                <RadioQuestion
                  id="G7"
                  title="My organisation has guidelines governing beneficiary/client data and AI:"
                  options={["Yes", "No", "Partially", "I don't know"]}
                  answers={answers}
                  onSelect={handleRadioChange}
                />
                <RadioQuestion
                  id="G8"
                  title="Have you ever entered real organisational information into an AI tool?"
                  options={["Never", "Occasionally", "Frequently", "Very frequently", "Prefer not to say"]}
                  answers={answers}
                  onSelect={handleRadioChange}
                />
                <RadioQuestion
                  id="G9"
                  title="Have you ever entered beneficiary/client information into an AI tool?"
                  options={[
                    "Never",
                    "Yes, after anonymisation",
                    "Yes, identifiable information",
                    "Unsure",
                    "Prefer not to say",
                  ]}
                  answers={answers}
                  onSelect={handleRadioChange}
                />
              </div>

              <h2 className="text-xl font-extrabold text-[#0F172A] mt-8 mb-4">
                H. TRUST, VERIFICATION &amp; HALLUCINATION
              </h2>
              <RadioQuestion
                id="H1"
                title="How much do you currently trust AI-generated information?"
                options={["Not at all", "Slightly", "Moderately", "Very", "Extremely"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="H2"
                title="When AI provides factual information for important work, how often do you verify it?"
                options={["Never", "Rarely", "Sometimes", "Often", "Always"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <CheckboxQuestion
                id="H3"
                title="What sources do you normally use for verification? Select all."
                options={[
                  "Web search",
                  "Government sites",
                  "Academic papers",
                  "Official organisational sources",
                  "Human expert",
                  "Primary documents",
                  "Another AI system",
                  "I generally don't verify",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />
              <RadioQuestion
                id="H4"
                title="Has the course changed your tendency to verify AI outputs?"
                options={["Much less", "Slightly less", "No change", "Slightly more", "Much more"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {/* SECTION I */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-1">
                I. OBJECTIVE AI LITERACY — MULTIPLE CHOICE
              </h2>
              <p className="text-sm text-[#64748B] mb-4">
                Select one answer for each. These questions test practical judgement, not memory.
              </p>

              <RadioQuestion
                id="I1"
                title="An AI system gives you a confident answer containing a statistic. Before using it in an NGO report you should:"
                options={[
                  "A. Use it because it sounds confident",
                  "B. Ask the same AI to repeat it",
                  "C. Verify it against an authoritative/primary source",
                  "D. Remove the statistic but keep the rest",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I2"
                title="Which prompt is most likely to produce a useful result?"
                options={[
                  "A. “Write something about our NGO.”",
                  "B. “Tell me everything about education.”",
                  "C. Specify role, context, task, constraints and what needs verification",
                  "D. “Make this better.”",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I3"
                title="An NGO worker wants AI to summarise a beneficiary case containing names, phone numbers and medical information. First step:"
                options={[
                  "A. Upload everything",
                  "B. Remove/anonymise sensitive information and assess tool suitability",
                  "C. Upload and delete later",
                  "D. Ask AI not to remember it",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I4"
                title="AI hallucination most accurately means:"
                options={[
                  "A. AI becomes conscious",
                  "B. AI produces plausible but false information",
                  "C. AI stops working",
                  "D. User made a spelling mistake",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I5"
                title="An AI recruitment recommendation consistently ranks one demographic group lower. The NGO should:"
                options={[
                  "A. Trust the model",
                  "B. Investigate data/model/process for potential bias",
                  "C. Hide the results",
                  "D. Increase confidence setting",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I6"
                title="Meaningful human oversight means:"
                options={[
                  "A. Human clicks approve without checking",
                  "B. Human remains responsible for evaluating consequential outputs",
                  "C. Only managers use AI",
                  "D. Every output is rewritten",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I7"
                title="Which task is least appropriate for completely automated AI decision-making?"
                options={[
                  "A. Social-media captions",
                  "B. Brainstorming project names",
                  "C. Deciding whether a vulnerable person receives a critical social benefit",
                  "D. Converting text to bullet points",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I8"
                title="An AI-generated citation looks legitimate. What should you assume?"
                options={[
                  "A. It is genuine",
                  "B. It is genuine if author is recognisable",
                  "C. It should still be independently checked",
                  "D. AI citations cannot be false",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I9"
                title="Responsible AI adoption is best described as:"
                options={[
                  "A. Maximise AI use",
                  "B. Avoid AI completely",
                  "C. Use AI for value while managing risks, oversight and affected people's rights",
                  "D. Let employees decide without policies",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="I10"
                title="Before introducing AI into an NGO workflow affecting vulnerable people, the most important question is:"
                options={[
                  "A. Is it popular?",
                  "B. Is the interface attractive?",
                  "C. What benefits, risks, affected rights and accountability mechanisms are involved?",
                  "D. Can it finish faster?",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {/* SECTION J & K */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-1">
                J. ETHICS, HUMAN RIGHTS &amp; VULNERABILITY
              </h2>
              <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                <div className="text-xs sm:text-sm text-[#1E3A8A] font-bold">
                  Rate each statement from <strong className="text-[#2563EB] font-black">1</strong> (Strongly Disagree) to <strong className="text-[#2563EB] font-black">5</strong> (Strongly Agree):
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#2563EB] font-semibold">
                  <span>1 = Strongly Disagree</span>
                  <span>•</span>
                  <span>5 = Strongly Agree</span>
                </div>
              </div>

              <CompactRatingGroup
                id="J"
                rows={SECTION_J_ROWS}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <h2 className="text-xl font-extrabold text-[#0F172A] mt-8 mb-4">
                K. ACCESSIBILITY &amp; INCLUSION
              </h2>
              <RadioQuestion
                id="K1"
                title="Have AI tools helped you create content more accessible to beneficiaries?"
                options={["Yes, significantly", "Yes, somewhat", "Not yet", "No", "Not applicable"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <CheckboxQuestion
                id="K2"
                title="Which accessibility applications have you used? Select all."
                options={[
                  "Translation",
                  "Simplifying language",
                  "Text-to-speech",
                  "Speech-to-text",
                  "Image descriptions",
                  "Caption generation",
                  "Structured/large documents",
                  "Educational adaptation",
                  "None",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />
              <RadioQuestion
                id="K3"
                title="AI can reduce digital exclusion."
                options={["1 Strongly disagree", "2", "3 Neutral", "4", "5 Strongly agree"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="K4"
                title="AI can also create new forms of exclusion."
                options={["1 Strongly disagree", "2", "3 Neutral", "4", "5 Strongly agree"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <CheckboxQuestion
                id="K5"
                title="Which groups could potentially be disadvantaged by AI in your area of work? Select all."
                options={[
                  "Persons with disabilities",
                  "Children",
                  "Women",
                  "Elderly",
                  "Rural communities",
                  "Tribal/indigenous communities",
                  "Low-income communities",
                  "People with low digital literacy",
                  "Minority-language speakers",
                  "Migrants",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />
            </div>

            {/* SECTION L */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                L. ORGANISATIONAL AI READINESS
              </h2>
              <RadioQuestion
                id="L1"
                title="My organisation currently has a formal AI-use policy."
                options={["Yes", "No", "Being developed", "I don't know"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="L2"
                title="Employees have received guidance on responsible AI use."
                options={["Yes", "No", "Informally", "I don't know"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="L3"
                title="My organisation has guidelines on confidential information and AI."
                options={["Yes", "No", "Partially", "I don't know"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="L4"
                title="My organisation has a process for checking AI-generated information before use/publication."
                options={["Yes", "No", "Sometimes", "I don't know"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-8">
                <div className="text-xs sm:text-sm text-[#1E3A8A] font-bold">
                  Rate your organisation&apos;s AI readiness statements:
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#2563EB] font-semibold">
                  <span>1 = Strongly Disagree</span>
                  <span>•</span>
                  <span>5 = Strongly Agree</span>
                </div>
              </div>

              <CompactRatingGroup
                id="L"
                rows={SECTION_L_ROWS}
                minLabel="Strongly disagree"
                maxLabel="Strongly agree"
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {/* SECTION M */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                M. IMPACT OF THE 24-DAY PROGRAMME
              </h2>
              <div className="mb-6">
                <div className="q-title">
                  Overall usefulness of the programme (0 = not useful, 10 = extremely useful):
                </div>
                <div className="opts-grid">
                  {Array.from({ length: 11 }, (_, i) => (
                    <label key={i} className="opt-label">
                      <input
                        type="radio"
                        name="M0"
                        value={String(i)}
                        checked={answers["M0"] === String(i)}
                        onChange={() => handleRadioChange("M0", String(i))}
                      />
                      <span>{i}</span>
                    </label>
                  ))}
                </div>
              </div>

              {[
                { id: "M1", title: "Change in understanding of AI (1–5):" },
                { id: "M2", title: "Change in confidence using AI (1–5):" },
                { id: "M3", title: "Change in actual AI use (1–5):" },
                { id: "M4", title: "Change in awareness of AI risks (1–5):" },
                { id: "M5", title: "Change in awareness of privacy/data risks (1–5):" },
                { id: "M6", title: "Change in ability to evaluate AI outputs (1–5):" },
                { id: "M7", title: "Change in ability to identify NGO AI applications (1–5):" },
                { id: "M8", title: "Change in willingness to introduce AI into your organisation (1–5):" },
              ].map((q) => (
                <RadioQuestion
                  key={q.id}
                  id={q.id}
                  title={q.title}
                  options={["1", "2", "3", "4", "5"]}
                  answers={answers}
                  onSelect={handleRadioChange}
                />
              ))}
            </div>

            {/* SECTION N */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-1">
                N. TOOL-LEVEL ADOPTION
              </h2>
              <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] mt-2">
                <p className="text-xs sm:text-sm text-[#1E3A8A] font-bold mb-2">For each tool, answer Yes/No for each column, and rate Usefulness &amp; Confidence (1 = Low → 5 = High):</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#2563EB] font-medium">
                  <span>📋 Used before? · Learned here? · Use independently? · Used at work? · Continue?</span>
                </div>
              </div>

              <div className="space-y-4">
                {TOOLS_LIST.map((tool, i) => {
                  const cols = [
                    { label: "Used before?", key: `N_${i}_0` },
                    { label: "Learned here?", key: `N_${i}_1` },
                    { label: "Use independently?", key: `N_${i}_2` },
                    { label: "Used at work?", key: `N_${i}_3` },
                    { label: "Continue?", key: `N_${i}_4` },
                  ];

                  return (
                    <div
                      key={tool}
                      className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#93C5FD] shadow-sm transition-all duration-200"
                    >
                      {/* Tool Name */}
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                        <span className="text-sm sm:text-base font-extrabold text-[#0F172A]">{tool}</span>
                      </div>

                      {/* Yes / No toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                        {cols.map((col) => {
                          const val = answers[col.key];
                          return (
                            <div key={col.key} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                              <span className="text-[11px] sm:text-xs text-[#475569] font-medium flex-1">{col.label}</span>
                              <div className="flex gap-1.5">
                                {["Y", "N"].map((v) => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => handleToolChange(i, Number(col.key.split("_")[2]), v)}
                                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all duration-150 ${
                                      val === v
                                        ? v === "Y"
                                          ? "bg-[#10B981] text-white shadow-sm"
                                          : "bg-[#64748B] text-white shadow-sm"
                                        : "bg-white text-[#64748B] border border-[#CBD5E1] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                                    }`}
                                  >
                                    {v === "Y" ? "Yes" : "No"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Rating rows: Useful & Conf */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { label: "Usefulness (1–5)", colIdx: 5 },
                          { label: "Confidence (1–5)", colIdx: 6 },
                        ].map(({ label, colIdx }) => {
                          const rKey = `N_${i}_${colIdx}`;
                          const rVal = answers[rKey];
                          return (
                            <div key={rKey} className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                              <p className="text-[11px] sm:text-xs text-[#475569] font-medium mb-2">{label}</p>
                              <div className="flex items-center bg-white border border-[#CBD5E1] rounded-lg p-0.5 gap-0.5">
                                {[1, 2, 3, 4, 5].map((v) => {
                                  const isActive = rVal === String(v);
                                  return (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => handleToolChange(i, colIdx, String(v))}
                                      className={`flex-1 py-1.5 rounded-md text-xs font-black transition-all duration-150 ${
                                        isActive
                                          ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-sm"
                                          : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                                      }`}
                                    >
                                      {v}
                                    </button>
                                  );
                                })}
                              </div>
                              {rVal && <p className="text-[10px] text-[#2563EB] font-bold mt-1 text-right">✓ {rVal}/5</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION O */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                O. TASK TRANSFORMATION
              </h2>
              <CheckboxQuestion
                id="O1"
                title="Before the programme, how would you normally perform important tasks that you now use AI for? Select all."
                options={[
                  "Do it manually",
                  "Ask a colleague",
                  "Search Google",
                  "Hire an external professional",
                  "Use conventional software",
                  "Not performed because we lacked capability",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />
              <RadioQuestion
                id="O2"
                title="After the programme, how would you normally perform these tasks?"
                options={[
                  "Manually",
                  "AI-assisted",
                  "Mostly AI + human review",
                  "Fully automated",
                  "Still manual",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onSelect={handleRadioChange}
                onTextChange={handleTextChange}
              />
              <CheckboxQuestion
                id="O3"
                title="For which activities would you be comfortable with AI generating recommendations but requiring a human final decision? Select all."
                options={[
                  "Grant writing",
                  "Social media",
                  "Translation",
                  "Beneficiary communication",
                  "Recruitment",
                  "Beneficiary eligibility",
                  "Financial decisions",
                  "Health recommendations",
                  "Legal advice",
                  "Child-related decisions",
                  "Disability-related services",
                  "Other",
                ]}
                hasOther
                answers={answers}
                onToggle={handleCheckboxChange}
                onTextChange={handleTextChange}
              />
            </div>

            {/* SECTION P */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                P. QUALITATIVE RESEARCH QUESTIONS
              </h2>
              {[
                { id: "P1", title: "What was the most surprising thing you learned about AI during the programme?" },
                { id: "P2", title: "Describe one task you can now do using AI that you could not—or could not do as effectively—before." },
                { id: "P3", title: "Describe one situation in which you realised that AI could be wrong, misleading or unreliable." },
                { id: "P4", title: "Did the programme change your understanding of privacy/confidentiality when using AI? How?" },
                { id: "P5", title: "Did the programme change your understanding of risks AI could create for beneficiaries or vulnerable communities? How?" },
                { id: "P6", title: "What is the most valuable AI application you see for your organisation?" },
                { id: "P7", title: "What is the biggest risk of AI adoption for your organisation?" },
                { id: "P8", title: "What prevents your organisation from using AI more effectively?" },
                { id: "P9", title: "What AI-related policy or guidance would you like your organisation to have?" },
                { id: "P10", title: "If you could add one topic to the programme, what would it be?" },
                { id: "P11", title: "Which other AI tools would you like to learn about that we have not yet covered?" },
                { id: "P12", title: "Describe some of the painful and cumbersome official and field-level tasks for which you would wish an AI tool existed." },
              ].map((q) => (
                <TextareaQuestion
                  key={q.id}
                  id={q.id}
                  title={q.title}
                  answers={answers}
                  onChange={handleTextChange}
                />
              ))}
            </div>

            {/* SECTION Q */}
            <div className="survey-section">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                Q. OVERALL REFLECTION
              </h2>
              <RadioQuestion
                id="Q1"
                title="After completing this programme, do you believe AI is primarily a tool that empowers NGOs, a technology that creates new risks, or both? Why?"
                options={[
                  "Primarily empowering",
                  "Primarily risky",
                  "Both; benefits outweigh risks",
                  "Both; risks outweigh benefits",
                  "Neither / context-dependent",
                ]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <TextareaQuestion
                id="Q2"
                title="Why?"
                answers={answers}
                onChange={handleTextChange}
              />
            </div>


            {errorMsg && (
              <div className="mx-6 my-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="p-8 text-center bg-[#F8FAFC] border-t border-[#E2E8F0]">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] text-white hover:shadow-[0_10px_25px_rgba(37,99,235,0.3)] transform hover:scale-105 disabled:opacity-50 border-0 rounded-xl px-12 py-4 text-base font-extrabold cursor-pointer transition-all duration-300"
              >
                {submitting ? "Submitting..." : "Submit Questionnaire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function RadioQuestion({
  id,
  title,
  options,
  hasOther,
  answers,
  onSelect,
  onTextChange,
}: {
  id: string;
  title: string;
  options: string[];
  hasOther?: boolean;
  answers: Record<string, any>;
  onSelect: (id: string, val: string) => void;
  onTextChange?: (id: string, val: string) => void;
}) {
  const currentVal = answers[id] || "";
  return (
    <div className="mb-6">
      <div className="q-title">
        {id}. {title}
      </div>
      <div className="opts-grid">
        {options.map((opt) => (
          <label key={opt} className="opt-label">
            <input
              type="radio"
              name={id}
              value={opt}
              checked={currentVal === opt}
              onChange={() => onSelect(id, opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {hasOther && currentVal === "Other" && (
        <input
          type="text"
          className="other-input"
          placeholder="Other:"
          value={answers[`${id}_other`] || ""}
          onChange={(e) => onTextChange && onTextChange(`${id}_other`, e.target.value)}
        />
      )}
    </div>
  );
}

function CheckboxQuestion({
  id,
  title,
  options,
  hasOther,
  answers,
  onToggle,
  onTextChange,
}: {
  id: string;
  title: string;
  options: string[];
  hasOther?: boolean;
  answers: Record<string, any>;
  onToggle: (id: string, val: string) => void;
  onTextChange?: (id: string, val: string) => void;
}) {
  const selected: string[] = answers[id] || [];
  return (
    <div className="mb-6">
      <div className="q-title">
        {id}. {title}
      </div>
      <div className="opts-grid">
        {options.map((opt) => {
          const isChecked = selected.includes(opt);
          return (
            <label key={opt} className="opt-label">
              <input
                type="checkbox"
                name={id}
                value={opt}
                checked={isChecked}
                onChange={() => onToggle(id, opt)}
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
      {hasOther && selected.includes("Other") && (
        <input
          type="text"
          className="other-input"
          placeholder="Other:"
          value={answers[`${id}_other`] || ""}
          onChange={(e) => onTextChange && onTextChange(`${id}_other`, e.target.value)}
        />
      )}
    </div>
  );
}



function CompactRatingGroup({
  id,
  rows,
  labels,
  minLabel = "Strongly disagree",
  maxLabel = "Strongly agree",
  answers,
  onSelect,
}: {
  id: string;
  rows: string[];
  labels?: string[];
  minLabel?: string;
  maxLabel?: string;
  answers: Record<string, any>;
  onSelect: (id: string, val: string) => void;
}) {
  return (
    <div className="space-y-3 mb-6">
      {rows.map((rowText, idx) => {
        const key = `${id}_${idx}`;
        const selectedVal = answers[key];

        return (
          <div
            key={key}
            className="p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#93C5FD] transition-all duration-200 shadow-sm"
          >
            {/* Statement Header */}
            <div className="flex items-start gap-2.5 mb-2.5">
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-black flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-[#1E3A8A] font-bold leading-relaxed">
                {rowText}
              </p>
            </div>

            {/* Segmented 1-5 Rating Bar */}
            <div className="mt-2.5">
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl p-1 gap-1 w-full sm:max-w-md">
                {[1, 2, 3, 4, 5].map((num, optIdx) => {
                  const valStr = labels && labels[optIdx] ? labels[optIdx] : String(num);
                  const isChecked = selectedVal === valStr || selectedVal === String(num);

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onSelect(key, valStr)}
                      className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all duration-150 flex items-center justify-center cursor-pointer ${
                        isChecked
                          ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-md scale-[1.03]"
                          : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Sub-label indicators */}
              <div className="flex items-center justify-between w-full sm:max-w-md px-1 mt-1.5 text-[10px] sm:text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1">
                  <span className="text-[#334155] font-bold">1</span> ({minLabel})
                </span>
                {selectedVal && (
                  <span className="text-[#2563EB] font-bold text-[10px] sm:text-[11px]">
                    ✓ Rated: {selectedVal}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="text-[#334155] font-bold">5</span> ({maxLabel})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}




function TextareaQuestion({
  id,
  title,
  answers,
  onChange,
}: {
  id: string;
  title: string;
  answers: Record<string, any>;
  onChange: (id: string, val: string) => void;
}) {
  return (
    <div className="mb-6">
      <div className="q-title">
        {id}. {title}
      </div>
      <textarea
        value={answers[id] || ""}
        onChange={(e) => onChange(id, e.target.value)}
        className="w-full border 1.5px border-[#CBD5E1] rounded-xl p-3.5 min-h-[110px] text-sm bg-white text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]"
      />
    </div>
  );
}
