import FaqAccordion, { FaqItem } from "./FaqAccordion";

const FAQS: FaqItem[] = [
  {
    q: "Who are these courses for?",
    a: "Neos Astra programs are built for students and early-career learners who want hands-on skills in AI and robotics — no prior coding or hardware experience required for our beginner tracks.",
  },
  {
    q: "Do I need my own hardware to join Robotics courses?",
    a: "No. All robotics kits, sensors, and lab equipment are provided during live sessions. You're welcome to bring your own components if you'd like extra practice at home.",
  },
  {
    q: "Are classes online, offline, or both?",
    a: "We run a hybrid model — most theory and project walkthroughs are online, while robotics builds and hackathons happen in-person at our lab.",
  },
  {
    q: "Will I get a certificate after completing a track?",
    a: "Yes. Every track ends with a capstone project, and successful completion earns you an industry-recognized certificate from Neos Astra.",
  },
  {
    q: "Can beginners join the Artificial Intelligence track?",
    a: "Absolutely. Our AI track starts from Python and math fundamentals before moving into machine learning and deep learning — it's designed to take true beginners to a working project.",
  },
  {
    q: "What if I miss a live session?",
    a: "All live sessions are recorded and added to your dashboard within 24 hours, so you can catch up anytime without losing progress.",
  },
];

export default function FaqComponent() {
  return (
    <main className="min-h-screen bg-[#090C14] px-6 py-20 text-[#F3F6FB] md:px-12 md:py-28">
      <div className="mx-auto max-w-3xl">
        <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-[#4DE8E0]">
          FAQ
        </span>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#8891A8]">
          Everything you need to know before joining a track. Can't find your
          answer here? Reach out on the Contact page.
        </p>

        <FaqAccordion items={FAQS} />
      </div>
    </main>
  );
}
