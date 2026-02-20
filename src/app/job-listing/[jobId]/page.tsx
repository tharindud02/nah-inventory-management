"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Car,
  MoreHorizontal,
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { ListingItem } from "@/types/listing";
import {
  normalizeListingItem,
  getListingId,
} from "@/lib/listing-utils";
import type { ListingDetail } from "@/types/listing";

interface ImageSliderProps {
  images: string[];
  title?: string;
  showFullscreen?: boolean;
  lazy?: boolean;
}

interface FullscreenImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

function FullscreenImageModal({
  images,
  currentIndex: initialIndex,
  isOpen,
  onClose,
  title,
}: FullscreenImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync with external index changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Early return after all hooks are called
  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black z-70 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
          <p className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      )}

      {/* Main image */}
      <div className="w-full h-full flex items-center justify-center p-8">
        <img
          src={images[currentIndex]}
          alt={`${title || "Image"} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[90%] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-white"
                  : "border-white/30 hover:border-white/50"
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageSlider({
  images,
  title,
  showFullscreen = true,
  lazy = true,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy || !containerRef.current) return;
    const el = containerRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsInView(true);
      },
      { rootMargin: "100px", threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lazy]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100">
        <Car className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openFullscreen = () => {
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-64 overflow-hidden bg-gray-100 group"
      >
        {isInView ? (
          <img
            src={images[currentIndex]}
            alt={title || "Listing"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain cursor-pointer transition-opacity duration-200"
            onClick={showFullscreen ? openFullscreen : undefined}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Car className="w-12 h-12 text-gray-300 animate-pulse" />
          </div>
        )}

        {/* Fallback for broken images */}
        <div className="absolute inset-0 items-center justify-center hidden bg-gray-100">
          <Car className="w-12 h-12 text-gray-400" />
        </div>

        {/* Fullscreen hint */}
        {showFullscreen && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-2 py-1 rounded text-xs pointer-events-none">
            Click to fullscreen
          </div>
        )}

        {/* Navigation buttons - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen modal */}
      {showFullscreen && (
        <FullscreenImageModal
          images={images}
          currentIndex={currentIndex}
          isOpen={isFullscreenOpen}
          onClose={closeFullscreen}
          title={title}
        />
      )}
    </>
  );
}

export default function JobListingPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Missing access token. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://i3hjth9ogf.execute-api.ap-south-1.amazonaws.com/listings/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch listings");
      }

      const raw = await response.json();
      const rawItems: ListingItem[] = Array.isArray(raw?.data?.items)
        ? raw.data.items
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw)
            ? raw
            : [];
      const normalized = rawItems.map((item) =>
        normalizeListingItem(item, getListingId(item)),
      );
      setListings(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (listing: ListingDetail) => {
    router.push(
      `/acquisition/vehicle/listing/${jobId}/${encodeURIComponent(listing.SK)}`,
    );
  };

  useEffect(() => {
    fetchListings();
  }, [jobId]);

  return (
    <ProtectedRoute>
      <Layout title={`Job Listings`} showSearch={false}>
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Acquisition Search", href: "/acquisition-search" },
              { label: "Job Listings", isCurrent: true },
            ]}
          />
        </div>

        <Card className="bg-white p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Listings
              </h2>
              <p className="text-sm text-gray-600">
                Scraped listings associated with this job : {jobId}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                Loading listings...
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-600">
                {error}
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Download className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Listings
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  No listings found for this job.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing, idx) => (
                  <Card
                    key={listing.SK || `listing-${idx}`}
                    className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 pt-0 pb-4"
                  >
                    {/* Listing Images */}
                    <ImageSlider
                      images={listing.images || []}
                      title={listing.title || "Listing"}
                    />

                    <CardContent className="px-4 py-0">
                      {/* Title and Menu */}
                      <div className="flex items-center justify-between mb-0">
                        <h3 className="text-lg font-bold truncate flex-1 pr-2">
                          {listing.title || "Untitled Listing"}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-8 shrink-0"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>

                      {/* SK and scraped_at */}
                      <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-2">
                        <span className="text-xs font-mono text-gray-700">
                          {listing.SK || ""}
                        </span>
                        <span className="text-sm font-semibold">
                          {listing.scraped_at
                            ? new Date(listing.scraped_at).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(listing)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

      </Layout>
    </ProtectedRoute>
  );
}
