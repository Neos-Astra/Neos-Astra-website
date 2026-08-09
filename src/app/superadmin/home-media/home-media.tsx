"use client";

import { useState, useEffect } from "react";
import { Trash2, ImageIcon, X, UploadCloud } from "lucide-react";
import AdminShell from "@/app/components/AdminShell";

interface HomeMedia {
  id: string;
  imageUrl: string;
  position: number;
}

export default function HomeMediaManagement() {
  const [mediaList, setMediaList] = useState<HomeMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [position, setPosition] = useState(0);

  const fetchMedia = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const res = await fetch("/api/home-media");
      const data = await res.json();
      if (Array.isArray(data)) setMediaList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(true);
  }, []);

  const handleOpenModal = () => {
    setFile(null);
    setPreview(null);
    setPosition(mediaList.length);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("position", position.toString());

    try {
      const res = await fetch("/api/home-media", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchMedia(false);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo? It will be removed from the home page.")) return;
    // Instant UI removal (0ms)
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/home-media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete photo");
        fetchMedia(false);
      }
    } catch (err) {
      console.error(err);
      fetchMedia(false);
    }
  };

  return (
    <AdminShell title="Home Photos">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#8891A8]">
          These photos appear in the hero carousel on your public home page.
        </p>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-semibold rounded-xl hover:bg-[#5FF0E8] transition-colors shrink-0"
        >
          <UploadCloud className="h-4 w-4" /> Upload Photo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#8891A8] text-sm">Loading photos...</div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-16 bg-[#0F1420] border border-[#1D2436] rounded-2xl">
          <ImageIcon className="h-10 w-10 text-[#8891A8] mx-auto mb-3 opacity-50" />
          <p className="text-[#F3F6FB] font-medium">No photos uploaded yet</p>
          <p className="text-xs text-[#8891A8] mt-1">Click "Upload Photo" to add your first hero image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList
            .sort((a, b) => a.position - b.position)
            .map((m) => (
              <div
                key={m.id}
                className="group relative rounded-2xl border border-[#1D2436] bg-[#0F1420] overflow-hidden hover:border-[#4DE8E066] transition-colors"
              >
                <div className="aspect-video relative">
                  <img src={m.imageUrl} alt="Home hero" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090C14ee] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#090C14]/80 backdrop-blur-sm text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8891A8]">Order: {m.position}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-[#1D2436] bg-[#0F1420] p-6 rounded-2xl shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#1D2436]">
              <h2 className="text-[#F3F6FB] font-bold text-lg">Upload Photo</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8891A8] hover:text-[#F3F6FB] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {preview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#1D2436]">
                  <img src={preview} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border-2 border-dashed border-[#1D2436] cursor-pointer hover:border-[#4DE8E066] transition-colors">
                  <UploadCloud className="h-6 w-6 text-[#8891A8]" />
                  <span className="text-xs text-[#8891A8]">Click to choose an image</span>
                  <input type="file" required accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              {preview && (
                <label className="block text-center text-xs text-[#4DE8E0] cursor-pointer">
                  Choose a different photo
                  <input type="file" required accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5">Display Order</label>
                <input
                  type="number"
                  required
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors"
                />
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
                  disabled={uploading || !file}
                  className="px-6 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-semibold rounded-xl hover:bg-[#5FF0E8] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}