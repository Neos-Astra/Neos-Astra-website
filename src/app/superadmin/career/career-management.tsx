"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Briefcase, Sparkles, MapPin, Clock, DollarSign, ExternalLink, X, AlertTriangle } from "lucide-react";

type JobOpening = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string | null;
  salary: string | null;
  applyLink: string | null;
  isActive: boolean;
  createdAt: any;
};

export default function CareerManagementClient({ initialJobs }: { initialJobs: JobOpening[] }) {
  const [jobs, setJobs] = useState<JobOpening[]>(initialJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    title: "",
    department: "Engineering",
    location: "Remote / On-site",
    type: "Full-time",
    description: "",
    requirements: "",
    salary: "",
    applyLink: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      department: "Engineering",
      location: "Remote / On-site",
      type: "Full-time",
      description: "",
      requirements: "",
      salary: "",
      applyLink: "",
      isActive: true,
    });
    setEditingJob(null);
    setErrorMessage("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobOpening) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements || "",
      salary: job.salary || "",
      applyLink: job.applyLink || "",
      isActive: job.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (editingJob) {
        // PATCH
        const res = await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update job opening");
        }

        const updated = await res.json();
        setJobs(jobs.map((j) => (j.id === updated.id ? updated : j)));
      } else {
        // POST
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create job opening");
        }

        const created = await res.json();
        setJobs([created, ...jobs]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job: JobOpening) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !job.isActive }),
      });

      if (res.ok) {
        const updated = await res.json();
        setJobs(jobs.map((j) => (j.id === updated.id ? updated : j)));
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = jobs.filter((j) => j.isActive).length;
  const inactiveCount = jobs.length - activeCount;

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EC4899]/30 bg-[#EC4899]/10 text-[11px] font-mono font-bold text-[#EC4899]">
            <Sparkles className="h-3.5 w-3.5" /> SUPER ADMIN EXCLUSIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FB] mt-2">
            Job Openings Management
          </h1>
          <p className="text-sm text-[#8891A8] mt-1">
            Create, manage, and publish job openings on the public <code className="text-[#4DE8E0]">/career</code> route.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4DE8E0] px-5 py-3 text-sm font-bold text-[#090C14] transition-all hover:bg-[#38BDF8] hover:shadow-[0_0_20px_rgba(77,232,224,0.4)]"
        >
          <Plus className="h-4 w-4" /> Add New Job Opening
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5">
          <p className="text-xs text-[#8891A8]">Total Postings</p>
          <p className="text-2xl font-bold text-[#F3F6FB] mt-1">{jobs.length}</p>
        </div>
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5">
          <p className="text-xs text-[#8891A8]">Active & Published</p>
          <p className="text-2xl font-bold text-[#4ADE80] mt-1">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5">
          <p className="text-xs text-[#8891A8]">Hidden / Inactive</p>
          <p className="text-2xl font-bold text-[#F43F5E] mt-1">{inactiveCount}</p>
        </div>
      </div>

      {/* Job Openings Table / Cards */}
      {jobs.length > 0 ? (
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#8891A8]">
              <thead className="border-b border-[#1D2436] bg-[#151C2C] text-xs uppercase tracking-wider text-[#F3F6FB]">
                <tr>
                  <th className="px-6 py-4">Title & Dept</th>
                  <th className="px-6 py-4">Type & Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D2436]">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#151C2C]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#F3F6FB] text-base">{job.title}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 px-2 py-0.5 text-[10px] font-mono text-[#8B7CFF]">
                          {job.department}
                        </span>
                        {job.salary && (
                          <span className="text-xs text-[#4ADE80] flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> {job.salary}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-[#F3F6FB] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#4DE8E0]" /> {job.type}
                      </div>
                      <div className="text-xs text-[#8891A8] flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-[#8891A8]" /> {job.location}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                          job.isActive
                            ? "bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 hover:bg-[#4ADE80]/25"
                            : "bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30 hover:bg-[#F43F5E]/25"
                        }`}
                      >
                        {job.isActive ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(job)}
                          className="rounded-lg border border-[#1D2436] bg-[#090C14] p-2 text-[#4DE8E0] hover:border-[#4DE8E0] hover:bg-[#4DE8E0]/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(job.id)}
                          className="rounded-lg border border-[#1D2436] bg-[#090C14] p-2 text-[#F43F5E] hover:border-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-12 text-center text-[#8891A8]">
          <Briefcase className="mx-auto h-12 w-12 text-[#4DE8E0] mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-[#F3F6FB]">No Job Openings Created Yet</h3>
          <p className="text-xs mt-1">Click "Add New Job Opening" above to create your first listing.</p>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#1D2436] bg-[#0F1420] p-6 sm:p-8 text-[#F3F6FB] shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB]"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-[#F3F6FB] mb-6">
              {editingJob ? "Edit Job Opening" : "Create New Job Opening"}
            </h2>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI & Robotics Instructor"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering, Teaching, Operations"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, On-site, Hybrid"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                    Salary / Compensation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25k - ₹40k / mo"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed responsibilities and role summary..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] p-4 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                  Requirements & Qualifications
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 2+ years experience in ROS, Python, or Teaching STEM..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] p-4 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8891A8] mb-1">
                  Apply Link or Email (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://forms.gle/... or mailto:hr@neosastra.com"
                  value={formData.applyLink}
                  onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                  className="w-full rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-[#F3F6FB] focus:border-[#4DE8E0] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-[#1D2436] bg-[#090C14] text-[#4DE8E0]"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-[#F3F6FB]">
                  Publish immediately (Active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1D2436]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#1D2436] bg-[#090C14] px-5 py-2.5 text-xs font-semibold text-[#8891A8] hover:text-[#F3F6FB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#4DE8E0] px-6 py-2.5 text-xs font-bold text-[#090C14] hover:bg-[#38BDF8] disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingJob ? "Update Job Opening" : "Create Job Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 text-[#F3F6FB] shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-[#F3F6FB]">Delete Job Opening?</h3>
            </div>
            <p className="text-xs text-[#8891A8]">
              Are you sure you want to permanently delete this job opening? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-[#1D2436] bg-[#090C14] px-4 py-2 text-xs font-semibold text-[#8891A8]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loading}
                className="rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
