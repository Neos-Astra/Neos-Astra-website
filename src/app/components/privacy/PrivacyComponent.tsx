// ---------------------------------------------
// Neos Astra — Privacy Policy Page
// Palette: Deep Navy + Cyan / Violet
// ---------------------------------------------

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "When you create an account, enroll in a course, or contact us, we collect information such as your name, email address, phone number, and any details you voluntarily provide through forms on our site. We also collect basic usage data — pages visited, time spent, and device/browser information — to improve our platform.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to provide and improve our courses, process enrollments, communicate updates about classes and events, respond to your inquiries, and personalize your learning experience. We do not sell your personal data to third parties.",
  },
  {
    title: "3. Cookies & Tracking",
    body: "Our website uses cookies to remember your preferences, keep you signed in, and understand how our site is used. You can disable cookies through your browser settings, though some features may not work as intended.",
  },
  {
    title: "4. Data Sharing",
    body: "We may share limited information with trusted service providers who help us operate our platform (such as hosting and payment processing), always under strict confidentiality agreements. We do not share your data with advertisers.",
  },
  {
    title: "5. Data Security",
    body: "We use industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "6. Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can also opt out of marketing communications while continuing to receive essential account-related updates.",
  },
  {
    title: "7. Children's Privacy",
    body: "Some of our programs are designed for younger students. Where a learner is a minor, we require parental or guardian consent before collecting any personal information.",
  },
  {
    title: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#090C14] px-6 py-20 text-[#F3F6FB] md:px-12 md:py-28">
      <div className="mx-auto max-w-3xl">
        <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-[#8B7CFF]">
          Legal
        </span>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-5 text-sm text-[#8891A8]">
          Last updated: August 2026
        </p>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#8891A8]">
          Neos Astra ("we", "our", "us") respects your privacy. This policy
          explains what information we collect, how we use it, and the
          choices you have.
        </p>

        <div className="mt-12 flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-[#1D2436] bg-[#0F1420] p-6 md:p-8"
            >
              <h2 className="mb-3 text-lg font-semibold text-[#F3F6FB]">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-[#8891A8]">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#8891A8]">
          Questions about this policy? Reach us at{" "}
          <a
            href="mailto:hello@neosastra.com"
            className="text-[#4DE8E0] hover:underline"
          >
            hello@neosastra.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
