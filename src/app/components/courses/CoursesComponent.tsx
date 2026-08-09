"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Sparkles, ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  admissionFee?: string;
  kitPrice?: string;
  duration: string;
  badge: string | null;
  image: string | null;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#090C14] text-[#F3F6FB] px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4DE8E04d] bg-[#4DE8E00d] px-4 py-1.5 font-mono text-xs text-[#4DE8E0]">
            <Sparkles className="h-3.5 w-3.5" />
            FUTURE-READY CURRICULUM
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F3F6FB] mb-4">
            Explore Our <span className="bg-gradient-to-r from-[#4DE8E0] via-[#64B5F6] to-[#8B7CFF] bg-clip-text text-transparent">Courses</span>
          </h1>
          <p className="text-base sm:text-lg text-[#8891A8]">
            Master cutting-edge technologies in Robotics, AI, IoT, and Aerospace with hands-on projects.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-[#8891A8]">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-[#0F1420] rounded-3xl border border-[#1D2436]">
            <BookOpen className="h-14 w-14 text-[#4DE8E0] mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold text-[#F3F6FB] mb-2">No Courses Available Yet</h3>
            <p className="text-sm text-[#8891A8]">Check back soon or add courses from Superadmin Portal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#1D2436] bg-[#0F1420] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4DE8E066] hover:shadow-2xl hover:shadow-[#4DE8E01a]"
              >
                <div>
                  {course.image ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-6">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {course.badge && (
                        <span className="absolute top-3 left-3 rounded-full bg-[#090C14cc] backdrop-blur-md border border-[#8B7CFF66] px-3 py-1 font-mono text-[10px] text-[#8B7CFF]">
                          {course.badge}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-6 bg-[#1D2436] flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-[#4DE8E0] opacity-30" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-[#4DE8E01a] px-3 py-1 font-mono text-xs text-[#4DE8E0]">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#F3F6FB] mb-3 group-hover:text-[#4DE8E0] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#8891A8] line-clamp-3 mb-4">{course.description}</p>
                </div>

                <div>
                  <div className="rounded-xl border border-[#1D2436] bg-[#090C14] p-3 mb-4 text-xs text-[#8891A8] space-y-1">
                    <div className="flex justify-between"><span>Admission Fee:</span> <span className="text-[#F3F6FB] font-medium">{course.admissionFee || "₹2,000"}</span></div>
                    <div className="flex justify-between"><span>Kit Price:</span> <span className="text-[#F3F6FB] font-medium">{course.kitPrice || "₹1,100"}</span></div>
                    <div className="flex justify-between border-t border-[#1D2436] pt-1 mt-1 font-bold text-[#4DE8E0]"><span>Total:</span> <span>{course.price || "₹3,100"}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 mb-6 text-xs text-[#C7CCDA]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#4DE8E0]" /> {course.duration}
                    </span>
                  </div>

                  <a
                    href={`/courses/explore?course=${encodeURIComponent(course.title)}`}
                    className="w-full py-3 rounded-xl bg-[#1D2436] text-[#F3F6FB] font-semibold text-sm hover:bg-gradient-to-r hover:from-[#4DE8E0] hover:to-[#8B7CFF] hover:text-[#090C14] transition-all flex items-center justify-center gap-2"
                  >
                    Enroll Now <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
