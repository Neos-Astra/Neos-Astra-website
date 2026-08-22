"use client";

import { useState, useEffect } from "react";
import { Trash2, ImageIcon, X, UploadCloud, Crop, CheckCircle, AlertCircle, Eye, Tag } from "lucide-react";
import AdminShell from "@/app/components/AdminShell";
import HeroImageCropper from "@/app/components/HeroImageCropper";

interface HomeMedia {
  id: string;
  imageUrl: string;
  title?: string;
  position: number;
}

export default function HomeMediaManagement() {
  const [mediaList, setMediaList] = useState<HomeMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(0);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; title?: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchMedia = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const res = await fetch("/api/home-media");
      const data = await res.json();
      if (Array.isArray(data)) setMediaList(data);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(true);
  }, []);

  const handleOpenModal = () => {
    setRawImageSrc(null);
    setCroppedBlob(null);
    setPreview(null);
    setTitle("");
    setIsCropping(false);
    setPosition(mediaList.length);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(f);
  };

  const handleCropComplete = (blob: Blob, dataUrl: string) => {
    setCroppedBlob(blob);
    setPreview(dataUrl);
    setIsCropping(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!croppedBlob && !preview) {
      showToast("Please choose and crop an image first.", "error");
      return;
    }

    setUploading(true);
    try {
      let res: Response;

      // Prefer posting FormData with cropped blob, fallback to JSON
      if (croppedBlob) {
        const formData = new FormData();
        const file = new File([croppedBlob], `highlight-${Date.now()}.webp`, { type: "image/webp" });
        formData.append("file", file);
        formData.append("title", title.trim());
        formData.append("position", position.toString());

        res = await fetch("/api/home-media", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/home-media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: preview,
            title: title.trim(),
            position,
          }),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        setRawImageSrc(null);
        setCroppedBlob(null);
        setPreview(null);
        setTitle("");
        showToast("Photo successfully uploaded!");
        fetchMedia(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || `Upload failed (Status ${res.status})`;
        showToast(errMsg, "error");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast(err?.message || "Upload failed. Please check network connection.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo? It will be removed from the home page.")) return;
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/home-media/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Photo deleted.");
      } else {
        showToast("Failed to delete photo", "error");
        fetchMedia(false);
      }
    } catch (err) {
      console.error(err);
      fetchMedia(false);
      showToast("Failed to delete photo", "error");
    }
  };

  return (
    <AdminShell title="Home Photos">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm transition-all animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#090C14] border-[#4DE8E0] text-[#4DE8E0]"
              : "bg-[#090C14] border-red-500 text-red-400"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#8891A8]">
            Manage recent highlights and hero background photos displayed on your homepage.
          </p>
          <p className="text-xs text-[#4DE8E0] mt-1 font-mono">
            ✦ Distortion-free 3:4 portrait crop with custom title / captions
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-semibold rounded-xl hover:bg-[#5FF0E8] transition-all shrink-0 shadow-lg shadow-[#4DE8E026]"
        >
          <UploadCloud className="h-4 w-4" /> Upload Photo
        </button>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#8891A8] text-sm">Loading photos...</div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-16 bg-[#0F1420] border border-[#1D2436] rounded-2xl">
          <ImageIcon className="h-10 w-10 text-[#8891A8] mx-auto mb-3 opacity-50" />
          <p className="text-[#F3F6FB] font-medium">No photos uploaded yet</p>
          <p className="text-xs text-[#8891A8] mt-1">Click "Upload Photo" to add your first photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList
            .sort((a, b) => a.position - b.position)
            .map((m) => (
              <div
                key={m.id}
                className="group relative rounded-2xl border border-[#1D2436] bg-[#0F1420] overflow-hidden hover:border-[#4DE8E066] transition-all flex flex-col"
              >
                {/* 3:4 Card Preview Aspect Ratio */}
                <div className="aspect-[3/4] relative overflow-hidden bg-[#090C14]">
                  <img
                    src={m.imageUrl}
                    alt={m.title || "Home media"}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle gradient with caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090C14ee] via-[#090C1433] to-transparent" />
                  
                  <div className="absolute bottom-0 inset-x-0 p-3 pointer-events-none">
                    <p className="text-xs font-semibold text-[#F3F6FB] leading-tight line-clamp-2 drop-shadow">
                      {m.title || "Untitled Moment"}
                    </p>
                  </div>

                  {/* Action overlay buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setViewingImage({ url: m.imageUrl, title: m.title })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#090C14]/80 backdrop-blur-sm text-[#4DE8E0] hover:bg-[#4DE8E0]/20 transition-all"
                      title="View Full Image"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#090C14]/80 backdrop-blur-sm text-red-400 hover:bg-red-500/20 transition-all"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="px-3 py-2 flex items-center justify-between border-t border-[#1D2436]/60 bg-[#0F1420]">
                  <span className="text-[10px] font-mono text-[#8891A8]">Order #{m.position}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4DE8E0]/10 text-[#4DE8E0] font-mono">
                    3:4 Card
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-[#1D2436] bg-[#0F1420] p-6 rounded-2xl shadow-2xl relative">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-[#1D2436]">
              <div>
                <h2 className="text-[#F3F6FB] font-bold text-lg">Upload Photo</h2>
                <p className="text-xs text-[#8891A8]">Crop and set caption for website highlight</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8891A8] hover:text-[#F3F6FB] transition-colors p-1 rounded-lg hover:bg-[#1D2436]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {preview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-44 aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#4DE8E0] shadow-lg shadow-[#4DE8E026]">
                    <img src={preview} alt="Cropped Preview" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090C14ee] via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                      <p className="text-[11px] font-semibold text-[#F3F6FB] leading-tight line-clamp-1">
                        {title || "Highlight Moment"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rawImageSrc && (
                      <button
                        type="button"
                        onClick={() => setIsCropping(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2C] border border-[#4DE8E066] text-xs font-semibold text-[#4DE8E0] hover:bg-[#4DE8E01a] transition-colors"
                      >
                        <Crop className="h-3.5 w-3.5" /> Re-Crop / Adjust Frame
                      </button>
                    )}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151C2C] border border-[#1D2436] text-xs font-semibold text-[#8891A8] hover:text-[#F3F6FB] hover:border-[#F3F6FB44] cursor-pointer transition-colors">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 aspect-[4/3] rounded-xl border-2 border-dashed border-[#1D2436] cursor-pointer hover:border-[#4DE8E066] hover:bg-[#4DE8E008] transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4DE8E0]/10 text-[#4DE8E0] mb-1">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-[#F3F6FB]">Click to choose an image</span>
                  <span className="text-xs text-[#8891A8]">PNG, JPG, WEBP • Crop tool will open automatically</span>
                  <input type="file" required accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              {/* Title / Caption Field */}
              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[#4DE8E0]" /> Photo Title / Caption
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Robotics Car Demonstration"
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors placeholder:text-[#8891A8]/50"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8891A8] mb-1.5 font-mono uppercase tracking-wider">
                  Display Order
                </label>
                <input
                  type="number"
                  required
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#090C14] border border-[#1D2436] text-[#F3F6FB] focus:outline-none focus:border-[#4DE8E0] text-sm rounded-xl transition-colors font-mono"
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
                  disabled={uploading || (!croppedBlob && !preview)}
                  className="px-6 py-2.5 bg-[#4DE8E0] text-[#090C14] text-sm font-semibold rounded-xl hover:bg-[#5FF0E8] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4DE8E033]"
                >
                  <UploadCloud className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {isCropping && rawImageSrc && (
        <HeroImageCropper
          imageSrc={rawImageSrc}
          title="Crop Photo for Highlights / Hero"
          cardTitle={title || "Highlight Moment"}
          defaultAspectRatio={3 / 4}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropping(false);
            if (!preview) {
              setRawImageSrc(null);
            }
          }}
        />
      )}

      {/* Full Image Preview Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#1D2436] shadow-2xl bg-[#090C14] flex flex-col items-center">
            <img src={viewingImage.url} alt={viewingImage.title || "Full view"} className="max-h-[75vh] w-auto object-contain" />
            {viewingImage.title && (
              <div className="p-3 w-full text-center bg-[#0F1420] border-t border-[#1D2436] text-sm font-medium text-[#F3F6FB]">
                {viewingImage.title}
              </div>
            )}
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-[#090C14]/80 text-[#F3F6FB] hover:bg-[#090C14] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}