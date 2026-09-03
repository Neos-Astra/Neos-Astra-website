"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, X, Crop, Move } from "lucide-react";

interface AspectRatioOption {
  label: string;
  value: number | null; // width / height, or null for free
  desc: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: "3:4 (Website Card)", value: 3 / 4, desc: "Recent Highlights (Recommended)" },
  { label: "16:9 (Hero Banner)", value: 16 / 9, desc: "Widescreen Hero Banner" },
  { label: "4:3 (Standard)", value: 4 / 3, desc: "Standard Photo" },
  { label: "1:1 (Square)", value: 1, desc: "Square" },
  { label: "Original / Free", value: null, desc: "Keep Natural Ratio" },
];

interface HeroImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => void;
  onCancel: () => void;
  title?: string;
  cardTitle?: string;
  defaultAspectRatio?: number | null;
}

export default function HeroImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  title = "Crop Photo for Neos Astra",
  cardTitle = "Highlight Moment",
  defaultAspectRatio = 3 / 4,
}: HeroImageCropperProps) {
  const [selectedRatio, setSelectedRatio] = useState<number | null>(defaultAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load natural image dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = imageSrc;
    imgRef.current = img;
  }, [imageSrc]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
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

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Compute crop box display dimensions in the UI
  const getCropBoxDimensions = () => {
    const maxBoxWidth = 320;
    const maxBoxHeight = 420;

    if (!selectedRatio) {
      if (imageSize.width && imageSize.height) {
        const natRatio = imageSize.width / imageSize.height;
        if (natRatio > 1) {
          return { width: maxBoxWidth, height: maxBoxWidth / natRatio };
        } else {
          return { width: maxBoxHeight * natRatio, height: maxBoxHeight };
        }
      }
      return { width: 280, height: 373 }; // 3:4 default
    }

    if (selectedRatio >= 1) {
      const width = maxBoxWidth;
      const height = width / selectedRatio;
      return { width, height };
    } else {
      const height = maxBoxHeight;
      const width = height * selectedRatio;
      return { width, height };
    }
  };

  const cropBox = getCropBoxDimensions();

  // Natural image aspect ratio
  const imgRatio = imageSize.width && imageSize.height ? imageSize.width / imageSize.height : 1;
  const boxAspect = cropBox.width / (cropBox.height || 1);

  // Compute proportional base display size in UI box (covering the crop box without stretching)
  let uiBaseW = cropBox.width;
  let uiBaseH = cropBox.height;
  if (imgRatio > boxAspect) {
    uiBaseH = cropBox.height;
    uiBaseW = cropBox.height * imgRatio;
  } else {
    uiBaseW = cropBox.width;
    uiBaseH = cropBox.width / (imgRatio || 1);
  }

  // Generate cropped image on offscreen canvas
  const handleCropAndApply = useCallback(async () => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const targetWidth = selectedRatio ? (selectedRatio < 1 ? 1200 : 1920) : Math.min(img.naturalWidth, 1920);
    const targetHeight = selectedRatio
      ? Math.round(targetWidth / selectedRatio)
      : Math.round(targetWidth / (imgRatio || 1));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill dark background
    ctx.fillStyle = "#090C14";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Save context state for rotation & pan
    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Canvas scaling to match exact proportional geometry
    const canvasAspect = targetWidth / (targetHeight || 1);
    let canvasBaseW = targetWidth;
    let canvasBaseH = targetHeight;

    if (imgRatio > canvasAspect) {
      canvasBaseH = targetHeight;
      canvasBaseW = targetHeight * imgRatio;
    } else {
      canvasBaseW = targetWidth;
      canvasBaseH = targetWidth / (imgRatio || 1);
    }

    const drawWidth = canvasBaseW * zoom;
    const drawHeight = canvasBaseH * zoom;

    const scaleFactor = targetWidth / cropBox.width;
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const panX = (isRotated90or270 ? pan.y : pan.x) * scaleFactor;
    const panY = (isRotated90or270 ? -pan.x : pan.y) * scaleFactor;

    ctx.drawImage(
      img,
      -drawWidth / 2 + panX,
      -drawHeight / 2 + panY,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // Export as WebP
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL("image/webp", 0.92);
          onCropComplete(blob, dataUrl);
        }
      },
      "image/webp",
      0.92
    );
  }, [selectedRatio, imgRatio, zoom, rotation, pan, cropBox, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#1D2436] bg-[#0F1420] p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1D2436] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DE8E0]/10 border border-[#4DE8E0]/30 text-[#4DE8E0]">
              <Crop className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F3F6FB]">{title}</h2>
              <p className="text-xs text-[#8891A8]">
                Crop & position your image without distortion
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8891A8] hover:bg-[#1D2436] hover:text-[#F3F6FB] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="py-3 shrink-0">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8891A8] mb-1.5">
            Aspect Ratio Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((item, idx) => {
              const isSelected = selectedRatio === item.value;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedRatio(item.value);
                    handleReset();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#4DE8E0] text-[#090C14] border-[#4DE8E0] shadow-md shadow-[#4DE8E033]"
                      : "bg-[#090C14] text-[#8891A8] border-[#1D2436] hover:text-[#F3F6FB] hover:border-[#4DE8E066]"
                  }`}
                >
                  {item.label}
                  {item.value === 3 / 4 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#090C14]/20 font-mono">
                      Card (3:4)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Crop Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-y-auto py-2">
          
          {/* Cropper Canvas Viewport */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center bg-[#090C14] border border-[#1D2436] rounded-xl p-4 relative select-none overflow-hidden min-h-[380px]">
            
            {/* Instruction Tip */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-[#0F1420]/90 px-2.5 py-1 text-[11px] text-[#8891A8] border border-[#1D2436] backdrop-blur-sm pointer-events-none">
              <Move className="h-3 w-3 text-[#4DE8E0]" /> Drag to reposition image
            </div>

            {/* Crop Boundary Box */}
            <div
              ref={containerRef}
              style={{
                width: `${cropBox.width}px`,
                height: `${cropBox.height}px`,
              }}
              className="relative overflow-hidden rounded-xl border-2 border-[#4DE8E0] shadow-[0_0_25px_rgba(77,232,224,0.25)] cursor-grab active:cursor-grabbing shrink-0"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image with transforms - 100% distortion free */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
              >
                <img
                  src={imageSrc}
                  alt="Crop Target"
                  className="max-w-none max-h-none pointer-events-none select-none"
                  style={{
                    width: `${uiBaseW * zoom}px`,
                    height: `${uiBaseH * zoom}px`,
                    minWidth: `${uiBaseW * zoom}px`,
                    minHeight: `${uiBaseH * zoom}px`,
                    maxWidth: "none",
                    maxHeight: "none",
                    objectFit: "fill",
                  }}
                  draggable={false}
                />
              </div>

              {/* Rule of Thirds Grid Overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-[#4DE8E0]/40">
                <div className="border-r border-b border-[#4DE8E0]/30" />
                <div className="border-r border-b border-[#4DE8E0]/30" />
                <div className="border-b border-[#4DE8E0]/30" />
                <div className="border-r border-b border-[#4DE8E0]/30" />
                <div className="border-r border-b border-[#4DE8E0]/30" />
                <div className="border-b border-[#4DE8E0]/30" />
                <div className="border-r border-b border-[#4DE8E0]/30" />
                <div className="border-r border-b border-[#4DE8E0]/30" />
                <div />
              </div>
            </div>

            {/* Viewport Dimensions badge */}
            <div className="mt-3 text-[11px] font-mono text-[#8891A8]">
              Format: {selectedRatio === 3 / 4 ? "3:4 Portrait Card (1200 × 1600)" : selectedRatio === 16 / 9 ? "16:9 Hero Banner (1920 × 1080)" : selectedRatio ? `${selectedRatio.toFixed(2)}:1` : "Original Ratio"}
            </div>
          </div>

          {/* Right Panel: Controls & Card Preview */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Interactive Control Sliders & Buttons */}
            <div className="rounded-xl border border-[#1D2436] bg-[#090C14] p-4 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4DE8E0]">
                Adjust & Frame
              </span>

              {/* Zoom Control */}
              <div>
                <div className="flex justify-between items-center text-xs text-[#8891A8] mb-1.5">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="h-3.5 w-3.5" /> Zoom
                  </span>
                  <span className="font-mono text-[#F3F6FB]">{zoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
                    className="p-1 rounded-lg bg-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#4DE8E0] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.5, +(z + 0.1).toFixed(1)))}
                    className="p-1 rounded-lg bg-[#1D2436] text-[#8891A8] hover:text-[#F3F6FB]"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Rotate & Reset */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1D2436]">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#151C2C] border border-[#1D2436] text-xs font-semibold text-[#F3F6FB] hover:border-[#4DE8E0] transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5 text-[#4DE8E0]" /> Rotate 90°
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#151C2C] border border-[#1D2436] text-xs font-semibold text-[#8891A8] hover:text-[#F3F6FB] transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Center / Reset
                </button>
              </div>
            </div>

            {/* Live Website Preview Simulation */}
            <div className="rounded-xl border border-[#1D2436] bg-[#090C14] p-4 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8891A8]">
                  Website Card Preview:
                </span>
                <span className="text-[10px] text-[#4DE8E0] font-mono">Live</span>
              </div>

              {/* Mini Card simulating Neos Astra Recent Highlights card */}
              <div className="relative w-36 aspect-[3/4] rounded-xl overflow-hidden border border-[#4DE8E044] shadow-lg">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `translate(${pan.x * 0.4}px, ${pan.y * 0.4}px) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="max-w-none max-h-none"
                    style={{
                      width: `${uiBaseW * 0.4 * zoom}px`,
                      height: `${uiBaseH * 0.4 * zoom}px`,
                      minWidth: `${uiBaseW * 0.4 * zoom}px`,
                      minHeight: `${uiBaseH * 0.4 * zoom}px`,
                      objectFit: "fill",
                    }}
                    draggable={false}
                  />
                </div>
                {/* Gradient & title overlay matching Home.tsx */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090C14ee] via-[#090C1440] to-transparent pointer-events-none" />
                <div className="absolute bottom-0 p-2 pointer-events-none">
                  <p className="text-[10px] font-semibold text-[#F3F6FB] leading-tight line-clamp-2">
                    {cardTitle || "Highlight Moment"}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-[#8891A8] mt-2 text-center">
                Matches the 3:4 portrait cards on your homepage.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1D2436] shrink-0 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#1D2436] text-sm text-[#8891A8] hover:text-[#F3F6FB] hover:border-[#F3F6FB44] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropAndApply}
            className="px-6 py-2.5 rounded-xl bg-[#4DE8E0] text-[#090C14] text-sm font-bold hover:bg-[#5FF0E8] transition-all flex items-center gap-2 shadow-lg shadow-[#4DE8E033]"
          >
            <Check className="h-4 w-4" /> Apply Crop & Continue
          </button>
        </div>

      </div>
    </div>
  );
}

