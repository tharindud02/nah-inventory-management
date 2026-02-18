"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Car,
  MoreHorizontal,
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  DollarSign,
  Calendar,
  Info,
} from "lucide-react";

interface Listing {
  SK: string;
  title?: string;
  images?: string[];
  scraped_at?: string;
  job_id?: string;
  PK?: string;
  [key: string]: any;
}

interface ImageSliderProps {
  images: string[];
  title?: string;
  showFullscreen?: boolean;
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
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<{
    [key: number]: boolean;
  }>({});

  // Preload images for faster navigation
  useEffect(() => {
    if (!images || images.length === 0) return;

    images.forEach((src, index) => {
      if (!preloadedImages[index]) {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages((prev) => ({ ...prev, [index]: true }));
        };
        img.src = src;
      }
    });
  }, [images, preloadedImages]);

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
      <div className="relative w-full h-64 overflow-hidden bg-gray-100 group">
        <img
          src={images[currentIndex]}
          alt={title || "Listing"}
          className="w-full h-full object-contain cursor-pointer transition-opacity duration-200"
          onClick={showFullscreen ? openFullscreen : undefined}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />

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

interface ListingDetail {
  SK: string;
  title?: string;
  images?: string[];
  scraped_at?: string;
  job_id?: string;
  PK?: string;
  model?: string;
  videos?: any;
  currency?: string;
  location?: string;
  initial_price?: number;
  condition?: string;
  brand?: any;
  root_category?: any;
  product_id?: string;
  make?: string;
  final_price?: number;
  profile_id?: string;
  description?: string;
  country_code?: string;
  color?: string;
  [key: string]: any;
}

interface ImageSliderProps {
  images: string[];
  title?: string;
}

function ListingDetailModal({
  listing,
  isOpen,
  onClose,
}: {
  listing: ListingDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {listing.title || "Untitled Listing"}
          </h2>
          <div className="flex items-center gap-2">
            {listing.product_id && (
              <a
                href={`https://www.facebook.com/marketplace/item/${listing.product_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                <ExternalLink className="w-4 h-4" />
                View on Marketplace
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <div className="mb-6">
              <ImageSlider
                images={listing.images}
                title={listing.title || "Listing"}
              />
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Make</p>
                  <p className="font-semibold capitalize">
                    {listing.make || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-semibold">{listing.model || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{listing.location || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Color</p>
                  <p className="font-semibold capitalize">
                    {listing.color || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold text-xl">
                    {listing.currency || "USD"} $
                    {listing.final_price?.toLocaleString() || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-semibold capitalize">
                    {listing.condition || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Scraped Date</p>
                  <p className="font-semibold">
                    {listing.scraped_at
                      ? new Date(listing.scraped_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-semibold text-sm font-mono">
                    {listing.product_id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Profile ID</p>
              <p className="font-mono font-semibold">{listing.profile_id}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Country</p>
              <p className="font-semibold">{listing.country_code || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobListingPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingDetail | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [detailError, setDetailError] = useState<string | null>(null);

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
      const items = Array.isArray(raw?.data?.items)
        ? raw.data.items
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw)
            ? raw
            : [];
      setListings(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchListingDetail = async (sk: string) => {
    setLoadingStates((prev) => ({ ...prev, [sk]: true }));
    setDetailError(null);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setDetailError("Missing access token. Please log in again.");
      setLoadingStates((prev) => ({ ...prev, [sk]: false }));
      return;
    }

    try {
      const response = await fetch(
        `https://i3hjth9ogf.execute-api.ap-south-1.amazonaws.com/listings/${sk}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch listing details");
      }

      const raw = await response.json();
      const detail = raw?.data || raw;
      setSelectedListing(detail);
      setIsModalOpen(true);
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Failed to load listing details",
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [sk]: false }));
    }
  };

  const handleViewDetails = (listing: Listing) => {
    fetchListingDetail(listing.SK);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
    setDetailError(null);
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
                {listings.map((listing) => (
                  <Card
                    key={listing.SK || listing.id || Math.random().toString(36)}
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
                          disabled={loadingStates[listing.SK]}
                          className="flex items-center gap-2"
                        >
                          {loadingStates[listing.SK] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              View Details
                            </>
                          )}
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

        {/* Detail Modal */}
        <ListingDetailModal
          listing={selectedListing}
          isOpen={isModalOpen}
          onClose={closeModal}
        />

        {/* Detail Error Modal */}
        {detailError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-3">Error</h3>
              <p className="text-gray-600 mb-4">{detailError}</p>
              <button
                onClick={closeModal}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
