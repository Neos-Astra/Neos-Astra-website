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

    if (!answers.R1) {
      setErrorMsg("Please answer the research consent question (Section R).");
      return;
    }
    if (answers.R1 !== "I agree") {
      setErrorMsg("Research participation consent was not provided.");
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
      <div className="min-h-screen bg-[#090C14] py-16 px-4 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full bg-[#0B0F19] border border-[#1D2436] rounded-3xl p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <div className="w-16 h-16 bg-[#4DE8E0]/15 text-[#4DE8E0] border border-[#4DE8E0]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(77,232,224,0.2)]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] via-[#38BDF8] to-[#8B7CFF] mb-3">
            Thank you for completing the questionnaire.
          </h2>
          <p className="text-[#8891A8] text-base leading-relaxed mb-6">
            Your response has been recorded successfully in our database.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setDate("");
            }}
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#4DE8E0] to-[#8B7CFF] text-[#090C14] font-extrabold rounded-xl hover:shadow-[0_0_25px_rgba(77,232,224,0.4)] transition-all transform hover:scale-105"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] font-sans relative overflow-hidden py-6 sm:py-10">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#4DE8E0]/10 via-[#8B7CFF]/5 to-transparent blur-3xl pointer-events-none" />

      <style jsx global>{`
        .survey-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 16px;
          position: relative;
          z-index: 10;
        }
        .survey-card {
          background: rgba(11, 15, 25, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid #1D2436;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          overflow: hidden;
        }
        .survey-hero {
          padding: 36px 30px 28px;
          background: linear-gradient(135deg, rgba(15, 20, 32, 0.95), rgba(11, 15, 25, 0.98));
          border-bottom: 1px solid #1D2436;
        }
        .survey-section {
          padding: 32px 30px;
          border-top: 1px solid #1D2436;
        }
        .q-title {
          font-weight: 650;
          line-height: 1.45;
          margin-bottom: 12px;
          color: #F3F6FB;
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
          border: 1px solid #1D2436;
          border-radius: 12px;
          padding: 12px 14px;
          background: #090C14;
          transition: all 0.2s ease;
          line-height: 1.35;
          font-size: 14px;
          color: #94A3B8;
          text-align: center;
        }
        .opt-label:hover span {
          border-color: rgba(56, 189, 248, 0.4);
          color: #F3F6FB;
          background: #0F1420;
        }
        .opt-label input:checked + span {
          border-color: #4DE8E0;
          background: rgba(77, 232, 224, 0.12);
          color: #4DE8E0;
          font-weight: 700;
          box-shadow: 0 0 16px rgba(77, 232, 224, 0.2);
        }
        .other-input {
          margin-top: 10px;
          width: 100%;
          border: 1px solid #1D2436;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          background: #090C14;
          color: #F3F6FB;
          transition: all 0.2s ease;
        }
        .other-input:focus {
          border-color: #4DE8E0;
          box-shadow: 0 0 12px rgba(77, 232, 224, 0.2);
        }
        .matrix-wrap {
          overflow-x: auto;
          border: 1px solid #1D2436;
          border-radius: 14px;
          background: #090C14;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }
        .matrix-table th,
        .matrix-table td {
          border-bottom: 1px solid #1D2436;
          padding: 12px 10px;
          text-align: center;
        }
        .matrix-table th {
          background: #0F1420;
          color: #38BDF8;
          font-size: 13px;
          font-weight: 700;
        }
        .matrix-table th:first-child,
        .matrix-table td:first-child {
          text-align: left;
          min-width: 470px;
          font-size: 14px;
          color: #E2E8F0;
        }
        .matrix-table tr:hover td {
          background: #0E1321;
        }
        .matrix-table tr:last-child td {
          border-bottom: 0;
        }
        .matrix-table input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #4DE8E0;
          cursor: pointer;
        }
        .tool-table {
          min-width: 1120px;
        }
        .tool-table th:first-child,
        .tool-table td:first-child {
          min-width: 145px;
        }
        .yn-group {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        .yn-group .opt-label {
          min-width: 38px;
          flex: 0 0 auto;
        }
        .yn-group .opt-label span {
          text-align: center;
          padding: 6px;
          font-size: 13px;
        }
        .scale5-group {
          display: flex;
          gap: 5px;
          justify-content: center;
        }
        .scale5-group .opt-label {
          min-width: 28px;
          flex: 0 0 auto;
        }
        .scale5-group .opt-label span {
          text-align: center;
          padding: 6px 5px;
          font-size: 13px;
        }
        @media (max-width: 700px) {
          .survey-hero,
          .survey-section {
            padding: 22px 16px;
          }
          .matrix-table th:first-child,
          .matrix-table td:first-child {
            min-width: 310px;
          }
        }
      `}</style>

      <div className="survey-container">
        <div className="survey-card">
          {/* Top subtle cyan line */}
          <div className="h-1 bg-gradient-to-r from-[#4DE8E0] via-[#38BDF8] to-[#8B7CFF]" />

          {/* Hero Section */}
          <div className="survey-hero text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] via-[#38BDF8] to-[#8B7CFF] tracking-tight">
              NGO 24 DAYS – 24 TOOLS AI PROGRAMME
            </h1>
            <div className="text-[#38BDF8] text-base sm:text-lg font-semibold mt-2">
              Research &amp; Impact Assessment Questionnaire
            </div>
            <p className="max-w-3xl mx-auto mt-3 text-[#8891A8] text-sm sm:text-base leading-relaxed">
              Purpose: To study AI literacy, AI agency, workplace adoption, privacy awareness, responsible AI behaviour, inclusion and organisational readiness among NGO professionals.
            </p>
            <div className="mt-3">
              <span className="inline-block bg-[#4DE8E0]/10 border border-[#4DE8E0]/20 text-[#4DE8E0] px-4 py-1.5 rounded-full text-xs font-semibold">
                Estimated time: 20–25 minutes &nbsp;|&nbsp; Please answer based on your actual experience.
              </span>
            </div>

            <div className="max-w-xs mx-auto mt-6 text-left">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-[#F3F6FB]">
                  Date:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-[#1D2436] rounded-xl px-4 py-2.5 text-sm bg-[#090C14] text-[#F3F6FB] outline-none focus:border-[#4DE8E0] transition-all"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* SECTION A */}
            <div className="survey-section">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-1">
                C. RETROSPECTIVE CHANGE FROM BEFORE THE COURSE
              </h2>
              <p className="text-sm text-[#8891A8] mb-4">
                Compared with your ability before the programme: 1 Much worse · 2 Slightly worse · 3 Same · 4 Slightly better · 5 Much better
              </p>
              <MatrixQuestion
                id="C"
                rows={SECTION_C_ROWS}
                labels={["1 Much worse", "2 Slightly worse", "3 Same", "4 Slightly better", "5 Much better"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mt-8 mb-1">
                D. CURRENT AI LITERACY
              </h2>
              <p className="text-sm text-[#8891A8] mb-4">
                Rate: 1 Strongly disagree · 2 Disagree · 3 Neither · 4 Agree · 5 Strongly agree
              </p>
              <MatrixQuestion
                id="D"
                rows={SECTION_D_ROWS}
                labels={["1 Strongly disagree", "2 Disagree", "3 Neither", "4 Agree", "5 Strongly agree"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {/* SECTION E & F */}
            <div className="survey-section">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-1">
                E. AI SELF-EFFICACY &amp; AGENCY
              </h2>
              <p className="text-sm text-[#8891A8] mb-4">
                Rate 1–5: Strongly disagree → Strongly agree.
              </p>
              <MatrixQuestion
                id="E"
                rows={SECTION_E_ROWS}
                labels={["1 Strongly disagree", "2 Disagree", "3 Neither", "4 Agree", "5 Strongly agree"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mt-8 mb-4">
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
                  className="w-full border border-[#1D2436] rounded-xl p-3 min-h-[110px] text-sm bg-[#090C14] text-[#F3F6FB] outline-none focus:border-[#4DE8E0] transition-all"
                />
              </div>
            </div>

            {/* SECTION G & H */}
            <div className="survey-section">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
                G. PRIVACY &amp; DATA GOVERNANCE
              </h2>
              <MatrixQuestion
                id="G"
                rows={SECTION_G_ROWS}
                labels={["1", "2", "3", "4", "5"]}
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

              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mt-8 mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-1">
                I. OBJECTIVE AI LITERACY — MULTIPLE CHOICE
              </h2>
              <p className="text-sm text-[#8891A8] mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-1">
                J. ETHICS, HUMAN RIGHTS &amp; VULNERABILITY
              </h2>
              <p className="text-sm text-[#8891A8] mb-4">
                Rate 1–5: Strongly disagree → Strongly agree.
              </p>
              <MatrixQuestion
                id="J"
                rows={SECTION_J_ROWS}
                labels={["1", "2", "3", "4", "5"]}
                answers={answers}
                onSelect={handleRadioChange}
              />

              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mt-8 mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
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

              <p className="text-sm text-[#8891A8] mt-6 mb-3 font-semibold">
                Statement 1 2 3 4 5
              </p>
              <MatrixQuestion
                id="L"
                rows={SECTION_L_ROWS}
                labels={["1", "2", "3", "4", "5"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {/* SECTION M */}
            <div className="survey-section">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-1">
                N. TOOL-LEVEL ADOPTION
              </h2>
              <p className="text-sm text-[#8891A8] mb-4">
                For each tool, tick one box in each column. Use the final two columns to rate usefulness and confidence: 1 low → 5 high.
              </p>

              <div className="matrix-wrap">
                <table className="matrix-table tool-table">
                  <thead>
                    <tr>
                      <th>Tool</th>
                      <th>Used before?</th>
                      <th>Learned here?</th>
                      <th>Use independently?</th>
                      <th>Used at work?</th>
                      <th>Continue?</th>
                      <th>Useful 1–5</th>
                      <th>Conf. 1–5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOOLS_LIST.map((tool, i) => (
                      <tr key={tool}>
                        <td className="font-semibold text-white">{tool}</td>
                        {[0, 1, 2, 3, 4].map((j) => (
                          <td key={j}>
                            <div className="yn-group">
                              {["Y", "N"].map((v) => (
                                <label key={v} className="opt-label">
                                  <input
                                    type="radio"
                                    name={`N_${i}_${j}`}
                                    value={v}
                                    checked={answers[`N_${i}_${j}`] === v}
                                    onChange={() => handleToolChange(i, j, v)}
                                  />
                                  <span>{v}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        ))}
                        <td>
                          <div className="scale5-group">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <label key={v} className="opt-label">
                                <input
                                  type="radio"
                                  name={`N_${i}_5`}
                                  value={String(v)}
                                  checked={answers[`N_${i}_5`] === String(v)}
                                  onChange={() => handleToolChange(i, 5, String(v))}
                                />
                                <span>{v}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="scale5-group">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <label key={v} className="opt-label">
                                <input
                                  type="radio"
                                  name={`N_${i}_6`}
                                  value={String(v)}
                                  checked={answers[`N_${i}_6`] === String(v)}
                                  onChange={() => handleToolChange(i, 6, String(v))}
                                />
                                <span>{v}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION O */}
            <div className="survey-section">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
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
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-4">
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

            {/* SECTION R */}
            <div className="survey-section">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#38BDF8] mb-3">
                R. RESEARCH CONSENT
              </h2>
              <div className="bg-[#090C14] border border-[#1D2436] rounded-xl p-4 text-sm text-[#8891A8] mb-4">
                I understand that my responses may be analysed in aggregate for academic research concerning AI literacy, AI adoption, digital inclusion and responsible AI use in NGOs.
              </div>
              <RadioQuestion
                id="R1"
                title="I understand that my responses may be analysed in aggregate for academic research concerning AI literacy, AI adoption, digital inclusion and responsible AI use in NGOs."
                options={["I agree", "I do not agree"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
              <RadioQuestion
                id="R2"
                title="Optional follow-up interview:"
                options={["Yes", "No"]}
                answers={answers}
                onSelect={handleRadioChange}
              />
            </div>

            {errorMsg && (
              <div className="mx-6 my-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="p-8 text-center bg-[#0F1420]/80 border-t border-[#1D2436]">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#4DE8E0] via-[#38BDF8] to-[#8B7CFF] text-[#090C14] hover:shadow-[0_0_30px_rgba(77,232,224,0.5)] transform hover:scale-105 disabled:opacity-50 border-0 rounded-xl px-10 py-4 text-base font-extrabold cursor-pointer transition-all duration-300"
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

function MatrixQuestion({
  id,
  rows,
  labels,
  answers,
  onSelect,
}: {
  id: string;
  rows: string[];
  labels: string[];
  answers: Record<string, any>;
  onSelect: (id: string, val: string) => void;
}) {
  return (
    <div className="matrix-wrap mb-6">
      <table className="matrix-table">
        <thead>
          <tr>
            <th>Statement</th>
            {labels.map((lbl) => (
              <th key={lbl}>{lbl}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rowText, idx) => {
            const key = `${id}_${idx}`;
            const val = answers[key];
            return (
              <tr key={idx}>
                <td>{rowText}</td>
                {labels.map((lbl) => (
                  <td key={lbl}>
                    <input
                      type="radio"
                      name={key}
                      value={lbl}
                      checked={val === lbl}
                      onChange={() => onSelect(key, lbl)}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
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
        className="w-full border border-[#1D2436] rounded-xl p-3.5 min-h-[110px] text-sm bg-[#090C14] text-[#F3F6FB] outline-none focus:border-[#4DE8E0] transition-all"
      />
    </div>
  );
}
