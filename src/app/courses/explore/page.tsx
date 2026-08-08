import { Suspense } from "react";
import Explore from "../../components/courses/Explore";

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090C14] text-white p-8">Loading...</div>}>
      <Explore />
    </Suspense>
  );
}
