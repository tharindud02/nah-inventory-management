"use client";

import { useState, useEffect } from "react";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VehicleImageGalleryProps {
  images: (string | { url?: string; src?: string })[];
  title?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop";

function toImageUrl(
  img: string | { url?: string; src?: string },
): string {
  if (typeof img === "string") return img;
  const u = img?.url ?? img?.src;
  return typeof u === "string" ? u : "";
}

function FullscreenGallery({
  images,
  initialIndex,
  isOpen,
  onClose,
  title,
}: {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen || !images.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
        <p className="text-sm text-white">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      <div className="flex h-full w-full items-center justify-center p-8">
        <img
          src={images[currentIndex] ?? ""}
          alt={`${title ?? "Vehicle"} ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex max-w-[90%] gap-2 overflow-x-auto -translate-x-1/2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition-all",
                i === currentIndex
                  ? "border-white"
                  : "border-white/30 hover:border-white/50",
              )}
            >
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VehicleImageGallery({
  images,
  title = "Vehicle",
  currentIndex = 0,
  onIndexChange,
  className,
}: VehicleImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const raw = images.map((img) => toImageUrl(img)).filter(Boolean);
  const displayImages = raw.length > 0 ? raw : [PLACEHOLDER_IMAGE];
  const index = Math.min(activeIndex, displayImages.length - 1);
  const currentImage = displayImages[index];

  const handleThumbClick = (i: number) => {
    setActiveIndex(i);
    onIndexChange?.(i);
  };

  const [fullscreenStartIndex, setFullscreenStartIndex] = useState(0);
  const openFullscreen = (startAt?: number) => {
    setFullscreenStartIndex(startAt ?? index);
    setIsFullscreenOpen(true);
  };
  const closeFullscreen = () => setIsFullscreenOpen(false);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
        <div
          role="button"
          tabIndex={0}
          onClick={() => openFullscreen()}
          onKeyDown={(e) => e.key === "Enter" && openFullscreen()}
          className="absolute inset-0 z-0 cursor-pointer"
          aria-label="View fullscreen"
        >
          <img
            src={currentImage}
            alt={title}
            className="h-full w-full object-cover transition-opacity group-hover:opacity-95 pointer-events-none"
          />
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1.5 text-sm text-white pointer-events-none">
          <Camera className="h-4 w-4" aria-hidden />
          {index + 1}/{displayImages.length} Photos
        </div>

        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const prev = index === 0 ? displayImages.length - 1 : index - 1;
                setActiveIndex(prev);
                onIndexChange?.(prev);
              }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const next = index === displayImages.length - 1 ? 0 : index + 1;
                setActiveIndex(next);
                onIndexChange?.(next);
              }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {displayImages.slice(0, 5).map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleThumbClick(i)}
            className={cn(
              "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
              index === i
                ? "border-blue-600 ring-2 ring-blue-200"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <img
              src={img}
              alt={`Thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
        {displayImages.length > 5 && (
          <button
            type="button"
            onClick={() => openFullscreen(5)}
            className={cn(
              "flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-100 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-200",
              index >= 5 && "border-blue-600 ring-2 ring-blue-200",
            )}
          >
            +{displayImages.length - 5} more
          </button>
        )}
      </div>

      <FullscreenGallery
        images={displayImages}
        initialIndex={fullscreenStartIndex}
        isOpen={isFullscreenOpen}
        onClose={closeFullscreen}
        title={title}
      />
    </div>
  );
}
