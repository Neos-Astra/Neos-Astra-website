"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, BookOpen, X, Save, Clock, Tag } from "lucide-react";
import AdminShell from "@/app/components/AdminShell";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  track: string | null;
  price: string;
  admissionFee: string;
  kitPrice: string;
  duration: string;
  badge: string | null;
  image: string | null;
  isActive: boolean;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Robotics & AI",
    track: "Robotics",
    price: "₹3,100",
    admissionFee: "₹2,000",
    kitPrice: "₹1,100",
    duration: "4 Weeks",
    badge: "Popular",
    image: "",
  });

  const fetchCourses = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(true);
  }, []);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        track: course.track || "Robotics",
        price: course.price || "₹3,100",
        admissionFee: course.admissionFee || "₹2,000",
        kitPrice: course.kitPrice || "₹1,100",
        duration: course.duration,
        badge: course.badge || "Popular",
        image: course.image || "",
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        category: "Robotics & AI",
        track: "Robotics",
        price: "₹3,100",
        admissionFee: "₹2,000",
        kitPrice: "₹1,100",
        duration: "4 Weeks",
        badge: "Popular",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await fetch(`/api/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      fetchCourses(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    // Instant UI update (0ms)
    setCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete course");
        fetchCourses(false);
      }
    } catch (err) {
      console.error(err);
      fetchCourses(false);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      (c.track && c.track.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminShell title="Courses">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8891A8]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] placeholder:text-[#8891A8]/60 text-sm transition-colors"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-semibold rounded-xl hover:bg-[#5FF0E8] transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Course
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#8891A8] text-sm">Loading courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-[#0F1420] border border-[#1D2436] rounded-2xl">
          <BookOpen className="h-10 w-10 text-[#8891A8] mx-auto mb-3 opacity-50" />
          <p className="text-[#F3F6FB] font-medium">No courses yet</p>
          <p className="text-xs text-[#8891A8] mt-1">Click "Add Course" to create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-[#1D2436] bg-[#0F1420] overflow-hidden flex flex-col hover:border-[#4DE8E066] hover:-translate-y-1 transition-all duration-300"
            >
              {c.image ? (
                <img src={c.image} alt={c.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-[#1D2436] to-[#0F1420] flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-[#8891A8]" />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="px-2 py-0.5 bg-[#4DE8E0]/10 text-[#4DE8E0] text-[10px] font-medium rounded-full">
                    {c.category}
                  </span>
                  {c.track && (
                    <span className="px-2 py-0.5 bg-[#8B7CFF]/10 text-[#8B7CFF] text-[10px] font-medium rounded-full">
                      {c.track}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#F3F6FB] mb-1.5 truncate">{c.title}</h3>
                <p className="text-xs text-[#8891A8] line-clamp-2 mb-2 flex-1">{c.description}</p>
                <div className="text-[11px] text-[#8891A8] space-y-0.5 mb-3 bg-[#090C14] p-2 rounded-lg border border-[#1D2436]">
                  <div className="flex justify-between"><span>Admission:</span> <span className="text-[#F3F6FB]">{c.admissionFee || "₹2,000"}</span></div>
                  <div className="flex justify-between"><span>Kit Price:</span> <span className="text-[#F3F6FB]">{c.kitPrice || "₹1,100"}</span></div>
                  <div className="flex justify-between font-bold border-t border-[#1D2436] pt-1 mt-1 text-[#4DE8E0]"><span>Total:</span> <span>{c.price || "₹3,100"}</span></div>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8891A8] mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {c.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-[#1D2436]">
                  <button
                    onClick={() => handleOpenModal(c)}
                    className="flex-1 py-2 border border-[#1D2436] text-[#F3F6FB] text-xs font-medium hover:bg-[#1D2436] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="py-2 px-3 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl border border-[#1D2436] bg-[#0F1420] p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#1D2436]">
              <h2 className="text-[#F3F6FB] font-bold text-lg">
                {editingCourse ? "Edit Course" : "New Course"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8891A8] hover:text-[#F3F6FB] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  placeholder="e.g. Intro to Robotics"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  placeholder="What will students learn?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Track</label>
                  <input
                    type="text"
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                    placeholder="Robotics, AI..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Admission Fee</label>
                  <input
                    type="text"
                    value={formData.admissionFee}
                    onChange={(e) => setFormData({ ...formData, admissionFee: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                    placeholder="₹2,000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Kit Price</label>
                  <input
                    type="text"
                    value={formData.kitPrice}
                    onChange={(e) => setFormData({ ...formData, kitPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                    placeholder="₹1,100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Total Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                    placeholder="₹3,100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  placeholder="4 Weeks"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1D2436]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#1D2436] text-[#8891A8] text-sm rounded-xl hover:text-[#F3F6FB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-semibold rounded-xl hover:bg-[#5FF0E8] transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> {editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}