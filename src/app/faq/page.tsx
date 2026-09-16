import FaqComponent from "../components/faq/FaqComponent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Neos Astra - School of Innovation",
  description: "Everything you need to know about Neos Astra courses, lab sessions, hardware kits, and certifications.",
};

export default function FaqPage() {
  return <FaqComponent />;
}
