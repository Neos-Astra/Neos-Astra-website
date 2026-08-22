"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Users, X, Save, Upload, Crop, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import AdminShell from "@/app/components/AdminShell";
import ImageCropperModal from "./ImageCropperModal";

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

  // Photo Cropper States
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropTargetImage, setCropTargetImage] = useState("");
  const [imageInputMode, setImageInputMode] = useState<"device" | "url">("device");

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

  const handleDeviceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCropTargetImage(dataUrl);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRecrop = () => {
    if (!formData.image) return;
    setCropTargetImage(formData.image);
    setIsCropperOpen(true);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setFormData((prev) => ({ ...prev, image: croppedDataUrl }));
  };

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
      setImageInputMode(member.image?.startsWith("http") ? "url" : "device");
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
      setImageInputMode("device");
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
            className="px-4 py-2.5 bg-[#4DE8E0] text-[#090C14] font-semibold text-sm rounded-xl hover:bg-[#5FF0E8] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Team Member
          </button>
        )}
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1D2436] border-t-[#4DE8E0]" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-12 text-center text-[#8891A8]">
          <Users className="mx-auto h-12 w-12 text-[#1D2436] mb-3" />
          <p className="text-sm font-medium text-[#F3F6FB]">No team members found</p>
          <p className="text-xs mt-1">Get started by adding your first team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5 flex flex-col justify-between hover:border-[#4DE8E033] transition-colors"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative">
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name}
                      className="h-12 w-12 rounded-xl object-cover shrink-0 border border-[#1D2436]"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-[#1D2436] flex items-center justify-center font-bold text-[#4DE8E0] text-sm shrink-0">
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

      {/* Team Member Edit / Add Modal */}
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

              {/* Photo Input with Device Selection + Cropping */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-[#8891A8] font-medium">
                    Photo (1:1 Square Card Ratio)
                  </label>
                  <div className="flex gap-1.5 bg-[#090C14] p-0.5 rounded-lg border border-[#1D2436]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("device")}
                      className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
                        imageInputMode === "device"
                          ? "bg-[#4DE8E0]/15 text-[#4DE8E0] font-semibold"
                          : "text-[#8891A8] hover:text-white"
                      }`}
                    >
                      Device File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
                        imageInputMode === "url"
                          ? "bg-[#4DE8E0]/15 text-[#4DE8E0] font-semibold"
                          : "text-[#8891A8] hover:text-white"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {formData.image ? (
                  <div className="flex items-center gap-3.5 p-3 bg-[#090C14] border border-[#1D2436] rounded-xl">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#4DE8E0]/40 bg-[#1D2436]">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#F3F6FB] flex items-center gap-1">
                        <span className="text-emerald-400">✓</span> Photo ready & framed
                      </p>
                      <p className="text-[10px] text-[#8891A8]">Exact 1:1 square card fit</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={handleRecrop}
                          className="flex items-center gap-1 text-xs font-medium text-[#4DE8E0] hover:underline"
                        >
                          <Crop className="h-3 w-3" /> Adjust Crop / Zoom
                        </button>
                        <label className="flex items-center gap-1 text-xs text-[#8891A8] hover:text-white cursor-pointer">
                          <RefreshCw className="h-3 w-3" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleDeviceFileSelect}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : imageInputMode === "device" ? (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1D2436] hover:border-[#4DE8E0] bg-[#090C14]/70 hover:bg-[#090C14] rounded-2xl cursor-pointer transition-all group">
                    <div className="h-11 w-11 rounded-2xl bg-[#4DE8E0]/10 flex items-center justify-center text-[#4DE8E0] group-hover:scale-110 transition-transform mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-[#F3F6FB]">
                      Select photo from device
                    </span>
                    <span className="text-[10px] text-[#8891A8] mt-0.5">
                      JPG, PNG, WebP · Auto-opens 1:1 square cropper
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDeviceFileSelect}
                    />
                  </label>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1 px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                        placeholder="https://..."
                      />
                      {formData.image && (
                        <button
                          type="button"
                          onClick={handleRecrop}
                          className="px-3 py-2.5 bg-[#1D2436] hover:bg-[#4DE8E0] hover:text-[#090C14] text-xs font-semibold rounded-xl text-[#F3F6FB] transition-colors flex items-center gap-1.5"
                        >
                          <Crop className="h-3.5 w-3.5" /> Crop
                        </button>
                      )}
                    </div>
                  </div>
                )}
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

      {/* 1:1 Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={cropTargetImage}
        onCropComplete={handleCropComplete}
        memberName={formData.name || "Member Preview"}
        memberRole={formData.role || "Role"}
        memberBadge={formData.badge || "Innovator"}
      />
    </AdminShell>
  );
}