"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Sparkles, Move } from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  memberName?: string;
  memberRole?: string;
  memberBadge?: string;
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  memberName = "Team Member",
  memberRole = "Role / Domain",
  memberBadge = "Innovator",
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset state whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setPreviewUrl("");
    }
  }, [isOpen, imageSrc]);

  // Generate real-time live preview
  const generatePreview = useCallback(() => {
    if (!imgRef.current) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 500; // high quality square output
    canvas.width = size;
    canvas.height = size;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const img = imgRef.current;
    const aspect = img.naturalWidth / img.naturalHeight;
    let baseWidth = size;
    let baseHeight = size;

    if (aspect > 1) {
      baseWidth = size * aspect;
    } else {
      baseHeight = size / aspect;
    }

    const drawWidth = baseWidth * zoom;
    const drawHeight = baseHeight * zoom;

    // Scale position offset proportionally
    const scaledX = position.x * (size / 280);
    const scaledY = position.y * (size / 280);

    ctx.drawImage(
      img,
      -drawWidth / 2 + scaledX,
      -drawHeight / 2 + scaledY,
      drawWidth,
      drawHeight
    );
    ctx.restore();

    try {
      setPreviewUrl(canvas.toDataURL("image/webp", 0.9));
    } catch {
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    }
  }, [zoom, rotation, position]);

  useEffect(() => {
    if (isOpen && imageSrc) {
      const timer = setTimeout(generatePreview, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, imageSrc, zoom, rotation, position, generatePreview]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = () => {
    if (!previewUrl) return;
    onCropComplete(previewUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-5 sm:p-6 shadow-2xl relative text-[#F3F6FB] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1D2436]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              ✂️ Crop & Frame Team Photo
            </h2>
            <p className="text-xs text-[#8891A8]">
              Drag to center face & adjust zoom for perfect 1:1 square card fit
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8891A8] hover:bg-[#1D2436] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Interactive Cropper Viewport */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-[#8891A8] mb-2 flex items-center gap-1">
              <Move className="h-3.5 w-3.5 text-[#4DE8E0]" />
              Click & drag inside box to reposition
            </div>

            {/* 1:1 Crop Viewport Box */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative h-[280px] w-[280px] sm:h-[300px] sm:w-[300px] overflow-hidden rounded-2xl border-2 border-[#4DE8E0] bg-[#090C14] cursor-grab active:cursor-grabbing shadow-[0_0_25px_rgba(77,232,224,0.15)] select-none"
            >
              {/* Corner Guides */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#4DE8E0] pointer-events-none z-10" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#4DE8E0] pointer-events-none z-10" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#4DE8E0] pointer-events-none z-10" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#4DE8E0] pointer-events-none z-10" />

              {/* Grid 3x3 rule of thirds */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-20">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Image Transform Layer */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop Target"
                  crossOrigin="anonymous"
                  onLoad={generatePreview}
                  className="max-w-none pointer-events-none select-none"
                  style={{
                    width: "300px",
                    height: "auto",
                    maxHeight: "none",
                  }}
                />
              </div>
            </div>

            {/* Controls Bar */}
            <div className="w-full max-w-[300px] mt-4 space-y-3">
              {/* Zoom slider */}
              <div className="flex items-center gap-3 bg-[#090C14] px-3 py-2 rounded-xl border border-[#1D2436]">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                  className="text-[#8891A8] hover:text-[#4DE8E0] transition-colors"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min="0.6"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-[#4DE8E0] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="text-[#8891A8] hover:text-[#4DE8E0] transition-colors"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono text-[#4DE8E0] w-10 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#1D2436] bg-[#090C14] text-xs font-medium text-[#F3F6FB] hover:border-[#4DE8E044] transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5 text-[#4DE8E0]" /> Rotate 90°
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="py-2 px-3 rounded-xl border border-[#1D2436] bg-[#090C14] text-xs font-medium text-[#8891A8] hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Card Appearance on Website */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[#1D2436] pt-4 md:pt-0 md:pl-6">
            <div className="text-xs font-semibold text-[#4DE8E0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Live Card Preview on Website
            </div>

            {/* Exact Website Team Card Replica */}
            <div className="w-[240px] sm:w-[260px] rounded-2xl border border-[#1D2436] bg-[#0F1420] p-4 shadow-xl shadow-black/50">
              {/* Cropped Image in Square Container */}
              <div className="relative mb-3 overflow-hidden rounded-xl aspect-square w-full bg-[#1D2436]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-bold text-2xl text-[#4DE8E0]">
                    {(memberName || "T").charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent opacity-80" />
                {memberBadge && (
                  <span className="absolute top-2 right-2 rounded-full bg-[#090C14]/80 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-mono font-semibold text-[#4DE8E0] border border-[#4DE8E033] max-w-[85%] truncate">
                    {memberBadge}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[#F3F6FB] truncate">
                {memberName || "Member Name"}
              </h4>
              <p className="text-xs text-[#8891A8] truncate mt-0.5">
                {memberRole || "Instructor / Engineer"}
              </p>
            </div>
            <p className="text-[11px] text-[#8891A8] mt-3 text-center">
              ✓ Perfectly formatted for high-DPI displays & fast loading
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-[#1D2436]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#1D2436] text-xs font-medium text-[#8891A8] hover:text-[#F3F6FB] hover:bg-[#1D2436] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-6 py-2.5 bg-[#4DE8E0] text-[#090C14] text-xs font-bold rounded-xl hover:bg-[#5FF0E8] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(77,232,224,0.3)] hover:scale-[1.02]"
          >
            <Check className="h-4 w-4" /> Apply & Use Photo
          </button>
        </div>
      </div>
    </div>
  );
}
