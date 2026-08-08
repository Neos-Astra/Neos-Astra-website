"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminsManagement() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as "ADMIN" | "SUPER_ADMIN",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreatePass, setShowCreatePass] = useState(false);

  // Change Password Modal State
  const [changePassTarget, setChangePassTarget] = useState<AdminRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/superadmin/admins");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdmins(data);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to create admin");
        setCreateLoading(false);
        return;
      }

      setSuccess(`✅ Admin "${createForm.name}" created successfully!`);
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", role: "ADMIN" });
      fetchAdmins();
    } catch {
      setError("An error occurred while creating admin");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePassTarget) return;

    setChangePassLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: changePassTarget.id,
          newPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to change password");
        setChangePassLoading(false);
        return;
      }

      setSuccess(`✅ Password updated for "${changePassTarget.name}"!`);
      setChangePassTarget(null);
      setNewPassword("");
    } catch {
      setError("Failed to update password");
    } finally {
      setChangePassLoading(false);
    }
  };

  const handleToggleActive = async (admin: AdminRecord) => {
    const nextState = !admin.isActive;
    // Optimistic update
    setAdmins((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, isActive: nextState } : a))
    );

    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admin.id, isActive: nextState }),
      });

      if (!res.ok) {
        fetchAdmins(); // Rollback on failure
      }
    } catch {
      fetchAdmins();
    }
  };

  const handleDeleteAdmin = async (admin: AdminRecord) => {
    if (
      !confirm(
        `Are you sure you want to delete admin account "${admin.name}" (${admin.email})?`
      )
    ) {
      return;
    }

    // Optimistic delete
    setAdmins((prev) => prev.filter((a) => a.id !== admin.id));

    try {
      const res = await fetch(`/api/superadmin/admins?id=${encodeURIComponent(admin.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admin.id, email: admin.email }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to delete admin");
        fetchAdmins();
        return;
      }

      setSuccess(`✅ Admin "${admin.name}" deleted successfully.`);
      fetchAdmins();
    } catch {
      alert("Failed to delete admin");
      fetchAdmins();
    }
  };

  const filtered = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090C14] text-[#F3F6FB] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-[#F43F5E]" />
              <h1 className="text-2xl font-bold text-[#F3F6FB]">
                Manage Admins
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#8891A8]">
              Create & manage staff admin accounts, assign roles, and update passwords.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdmins}
              className="flex items-center gap-2 rounded-lg border border-[#1D2436] bg-[#0F1420] px-4 py-2 text-sm text-[#8891A8] hover:border-[#4DE8E0] hover:text-[#4DE8E0] transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#F43F5E] to-[#8B7CFF] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#F43F5E]/20"
            >
              <UserPlus className="h-4 w-4" /> Add New Admin
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8891A8]" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0F1420] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#F43F5E] placeholder:text-[#8891A8]/60 text-sm transition-all"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D2436] border-t-[#F43F5E]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1D2436] bg-[#0F1420] py-20">
            <ShieldCheck className="h-12 w-12 text-[#8891A8] opacity-40 mb-4" />
            <p className="text-[#F3F6FB] font-semibold">No admin users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1D2436]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1D2436] bg-[#0F1420]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">
                    Admin User
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">
                    Account Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#8891A8]">
                    Last Login
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#8891A8]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-[#1D2436] bg-[#090C14] hover:bg-[#0F1420] transition-colors"
                  >
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F43F5E]/20 to-[#8B7CFF]/20 border border-[#F43F5E]/30 text-sm font-bold text-[#F43F5E]">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#F3F6FB]">
                            {admin.name}
                          </p>
                          <p className="text-xs text-[#8891A8] font-mono">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          admin.role === "SUPER_ADMIN"
                            ? "bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/30"
                            : "bg-[#4DE8E0]/15 text-[#4DE8E0] border-[#4DE8E0]/30"
                        }`}
                      >
                        {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Staff Admin"}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(admin)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                          admin.isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            admin.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                          }`}
                        />
                        {admin.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="px-5 py-4 text-xs text-[#8891A8]">
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleString("en-IN")
                        : "Never"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Change Password */}
                        <button
                          onClick={() => {
                            setError("");
                            setSuccess("");
                            setChangePassTarget(admin);
                            setNewPassword("");
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-[#1D2436] bg-[#0F1420] px-3 py-1.5 text-xs text-[#4DE8E0] hover:border-[#4DE8E0] hover:bg-[#4DE8E0]/10 transition-all"
                          title="Set New Password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Password
                        </button>

                        {/* Delete Admin */}
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#1D2436] bg-[#0F1420] px-3 py-1.5 text-xs text-red-400 hover:border-red-500 hover:bg-red-500/10 transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ADMIN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#F43F5E]" />
                <h2 className="font-bold text-[#F3F6FB]">Add New Admin User</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8891A8] hover:text-[#F3F6FB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-mono font-medium text-[#8891A8] uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-sm text-[#F3F6FB] outline-none focus:border-[#F43F5E]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-mono font-medium text-[#8891A8] uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@neosastra.com"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-sm text-[#F3F6FB] outline-none focus:border-[#F43F5E]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-mono font-medium text-[#8891A8] uppercase">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showCreatePass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Set password (min 6 chars)"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, password: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-2.5 pr-10 text-sm text-[#F3F6FB] outline-none focus:border-[#F43F5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A8] hover:text-[#F3F6FB]"
                  >
                    {showCreatePass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-mono font-medium text-[#8891A8] uppercase">
                  Assign Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      role: e.target.value as any,
                    }))
                  }
                  className="w-full rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-2.5 text-sm text-[#F3F6FB] outline-none focus:border-[#F43F5E]"
                >
                  <option value="ADMIN">Staff Admin (Course & Enrollment Access)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full System Access)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-[#1D2436] px-4 py-2 text-sm text-[#8891A8] hover:text-[#F3F6FB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-lg bg-[#F43F5E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#e11d48] disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Save Admin User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {changePassTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[#1D2436] bg-[#0F1420] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-[#1D2436] pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#4DE8E0]" />
                <h2 className="font-bold text-[#F3F6FB]">
                  Change Password for {changePassTarget.name}
                </h2>
              </div>
              <button
                onClick={() => setChangePassTarget(null)}
                className="text-[#8891A8] hover:text-[#F3F6FB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-xs text-[#8891A8]">
                Updating password for account:{" "}
                <span className="font-mono text-[#4DE8E0]">{changePassTarget.email}</span>
              </p>

              <div>
                <label className="mb-1 block text-xs font-mono font-medium text-[#8891A8] uppercase">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#1D2436] bg-[#090C14] px-4 py-2.5 pr-10 text-sm text-[#F3F6FB] outline-none focus:border-[#4DE8E0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A8] hover:text-[#F3F6FB]"
                  >
                    {showNewPass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setChangePassTarget(null)}
                  className="rounded-lg border border-[#1D2436] px-4 py-2 text-sm text-[#8891A8] hover:text-[#F3F6FB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePassLoading}
                  className="rounded-lg bg-[#4DE8E0] px-5 py-2 text-sm font-semibold text-[#090C14] hover:bg-[#3cd2ca] disabled:opacity-50"
                >
                  {changePassLoading ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
