"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Users, X, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import AdminShell from "@/app/components/AdminShell";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  domain: string | null;
  badge: string | null;
  bio: string;
  image: string | null;
  linkedin: string | null;
  twitter: string | null;
  email: string | null;
  order: number;
}

export default function TeamManagement() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    domain: "General",
    badge: "Innovator",
    bio: "",
    image: "",
    linkedin: "#",
    twitter: "#",
    email: "",
    order: 0,
  });

  const fetchMembers = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const res = await fetch("/api/team");
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(true);
  }, []);

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        domain: member.domain || "General",
        badge: member.badge || "Innovator",
        bio: member.bio,
        image: member.image || "",
        linkedin: member.linkedin || "#",
        twitter: member.twitter || "#",
        email: member.email || "",
        order: member.order || 0,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        role: "",
        domain: "General",
        badge: "Innovator",
        bio: "",
        image: "",
        linkedin: "#",
        twitter: "#",
        email: "",
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    try {
      if (editingMember) {
        await fetch(`/api/team/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      fetchMembers(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSuperAdmin) return;
    if (!confirm("Delete this team member? This cannot be undone.")) return;
    // Instant UI removal (0ms)
    setMembers((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete team member");
        fetchMembers(false);
      }
    } catch (err) {
      console.error(err);
      fetchMembers(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      (m.domain && m.domain.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminShell title="Team">
      {!isSuperAdmin && (
        <div className="mb-6 rounded-xl border border-[#8B7CFF33] bg-[#8B7CFF0d] px-4 py-3 text-xs text-[#8B7CFF]">
          You're viewing in read-only mode. Only Super Admins can add or remove team members.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8891A8]" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] placeholder:text-[#8891A8]/60 text-sm transition-colors"
          />
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-semibold rounded-xl hover:bg-[#5FF0E8] transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Member
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#8891A8] text-sm">Loading team...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-[#0F1420] border border-[#1D2436] rounded-2xl">
          <Users className="h-10 w-10 text-[#8891A8] mx-auto mb-3 opacity-50" />
          <p className="text-[#F3F6FB] font-medium">No team members yet</p>
          {isSuperAdmin && (
            <p className="text-xs text-[#8891A8] mt-1">Click "Add Member" to create the first profile.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5 flex flex-col hover:border-[#8B7CFF66] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-[#090C14] shrink-0 border border-[#1D2436]">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-base text-[#4DE8E0]">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#F3F6FB] truncate">{m.name}</h3>
                  <p className="text-xs text-[#8891A8] truncate">
                    {m.role} {m.domain && `· ${m.domain}`}
                  </p>
                </div>
              </div>
              {m.badge && (
                <span className="inline-block mb-3 w-fit px-2 py-0.5 bg-[#8B7CFF]/10 text-[#8B7CFF] text-[10px] font-medium rounded-full">
                  {m.badge}
                </span>
              )}
              <p className="text-xs text-[#8891A8] line-clamp-3 mb-4 flex-1 leading-relaxed">{m.bio}</p>
              {isSuperAdmin && (
                <div className="flex items-center gap-2 pt-3 border-t border-[#1D2436]">
                  <button
                    onClick={() => handleOpenModal(m)}
                    className="flex-1 py-2 border border-[#1D2436] text-[#F3F6FB] text-xs font-medium hover:bg-[#1D2436] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="py-2 px-3 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl border border-[#1D2436] bg-[#0F1420] p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#1D2436]">
              <h2 className="text-[#F3F6FB] font-bold text-lg">
                {editingMember ? "Edit Team Member" : "New Team Member"}
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
                <label className="block text-xs text-[#8891A8] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  placeholder="Enter name..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Role</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                    placeholder="e.g. Lead Instructor"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Domain</label>
                  <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                    placeholder="e.g. Robotics, AI"
                  />
                </div>
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
                  <label className="block text-xs text-[#8891A8] mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5">Bio</label>
                <textarea
                  required
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  placeholder="Short bio..."
                />
              </div>
              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5">Photo — choose from gallery / paste URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8891A8] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
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
                  <Save className="h-4 w-4" /> {editingMember ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}