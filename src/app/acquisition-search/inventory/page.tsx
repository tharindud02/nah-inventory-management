"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Search,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { bookmarkListing } from "@/lib/api/listings";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  dealershipId: string;
  jobId: string;
  productId: string;
  url: string;
  vin: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  price: number | null;
  currency: string;
  sellerType: string;
  location: string;
  images: string[];
  description: string | null;
  listedAt: string;
  lastSeenAt: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  bookmarked?: boolean;
}

interface ListingsResponse {
  data: {
    items: InventoryItem[];
    nextCursor?: string;
  };
}

// Lazy loaded image component with Intersection Observer
function LazyImage({
  src,
  alt,
  className,
  onClick,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  onError?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn("relative w-full h-full", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Car className="w-8 h-8 text-gray-300 animate-pulse" />
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            onClick && "cursor-pointer"
          )}
          onLoad={() => setIsLoaded(true)}
          onClick={onClick}
          onError={(e) => {
            setIsLoaded(true);
            onError?.();
          }}
        />
      )}
    </div>
  );
}

// Image Slider with lazy loading
interface ImageSliderProps {
  images: string[];
  title?: string;
}

function ImageSlider({ images, title }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-100">
        <Car className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  return (
    <>
      <div className="relative w-full h-48 overflow-hidden bg-gray-100 group">
        <LazyImage
          src={images[currentIndex]}
          alt={title || "Listing"}
          className="w-full h-full"
          onClick={() => setIsFullscreenOpen(true)}
        />

        {/* Fullscreen hint */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-2 py-1 rounded text-xs pointer-events-none">
          Click to fullscreen
        </div>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
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

      {/* Fullscreen Modal */}
      {isFullscreenOpen && (
        <FullscreenImageModal
          images={images}
          currentIndex={currentIndex}
          onClose={() => setIsFullscreenOpen(false)}
          title={title}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSelect={setCurrentIndex}
        />
      )}
    </>
  );
}

// Fullscreen Image Modal with lazy loading
interface FullscreenImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  title?: string;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

function FullscreenImageModal({
  images,
  currentIndex,
  onClose,
  title,
  onPrevious,
  onNext,
  onSelect,
}: FullscreenImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrevious, onNext]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
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
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onNext}
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

      {/* Main image with lazy loading */}
      <div className="w-full h-full flex items-center justify-center p-8">
        <LazyImage
          src={images[currentIndex]}
          alt={`${title || "Image"} ${currentIndex + 1}`}
          className="max-w-full max-h-full"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[90%] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-white"
                  : "border-white/30 hover:border-white/50"
              }`}
            >
              <LazyImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-16 h-16"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const [listings, setListings] = useState<InventoryItem[]>([]);
  const [filteredListings, setFilteredListings] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [makeFilter, setMakeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<string>("none");

  const fetchListings = async (cursor?: string, signal?: AbortSignal) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("Missing access token. Please log in again.");
      return;
    }

    if (cursor) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setListings([]);
    }
    setError(null);

    try {
      const url = cursor
        ? `/api/listings/all?cursor=${encodeURIComponent(cursor)}`
        : "/api/listings/all";

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      });

      if (signal?.aborted) return;

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(err?.error ?? "Failed to fetch listings");
      }

      const raw: ListingsResponse = await response.json();
      if (signal?.aborted) return;

      const items = raw?.data?.items || [];
      const newCursor = raw?.data?.nextCursor || null;

      const initialBookmarked = new Set<string>();
      for (const item of items) {
        if (item.id && item.bookmarked) {
          initialBookmarked.add(item.id);
        }
      }

      if (cursor) {
        setListings((prev) => [...prev, ...items]);
      } else {
        setListings(items);
      }
      setNextCursor(newCursor);
      setBookmarkedIds((prev) => new Set([...prev, ...initialBookmarked]));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...listings];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.vin?.toLowerCase().includes(query) ||
          item.make?.toLowerCase().includes(query) ||
          item.model?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query)
      );
    }

    // Make filter
    if (makeFilter !== "all") {
      result = result.filter((item) => item.make === makeFilter);
    }

    // Year filter
    if (yearFilter !== "all") {
      result = result.filter((item) => item.year === parseInt(yearFilter));
    }

    // Price sorting
    if (priceSort === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (priceSort === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (priceSort === "year-desc") {
      result.sort((a, b) => b.year - a.year);
    } else if (priceSort === "year-asc") {
      result.sort((a, b) => a.year - b.year);
    }

    setFilteredListings(result);
  }, [listings, searchQuery, makeFilter, yearFilter, priceSort]);

  useEffect(() => {
    const controller = new AbortController();
    fetchListings(undefined, controller.signal);
    return () => controller.abort();
  }, []);

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      fetchListings(nextCursor);
    }
  };

  const handleBookmark = async (item: InventoryItem) => {
    if (!item.id) {
      toast.error("Cannot bookmark: item has no identifier.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Please sign in to save favorites.");
      return;
    }

    setBookmarkingId(item.id);
    const wasBookmarked = bookmarkedIds.has(item.id);

    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(item.id);
      else next.add(item.id);
      return next;
    });

    try {
      await bookmarkListing(item.id, accessToken);
      toast.success(wasBookmarked ? "Removed from favorites" : "Saved to favorites");
    } catch (err) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(item.id);
        else next.delete(item.id);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Failed to save favorite");
    } finally {
      setBookmarkingId(null);
    }
  };

  // Get unique makes and years for filters
  const uniqueMakes = Array.from(new Set(listings.map((item) => item.make).filter(Boolean))).sort();
  const uniqueYears = Array.from(new Set(listings.map((item) => item.year).filter(Boolean))).sort((a, b) => b - a);

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null || price === undefined) return "Price N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-US").format(mileage);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderSelect = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: Array<{ value: string; label: string }>,
  ) => (
    <div className="relative flex-1">
      <span className="absolute left-3 top-2 text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-10 rounded-xl border border-slate-200 bg-white px-3 pt-3 pb-1 text-sm font-medium text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none",
          !value && "text-slate-400",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout title="All Inventory Listings" showSearch={false}>
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Acquisition Search", href: "/acquisition-search" },
              { label: "All Inventory", isCurrent: true },
            ]}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/acquisition-search")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search Management
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="bg-white p-6 mb-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  All Inventory Listings
                </h2>
                <p className="text-sm text-gray-600">
                  Browse all available inventory items from various sources
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredListings.length} of {listings.length} items
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by title, VIN, make, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Make Filter */}
              {renderSelect(
                "Make",
                makeFilter,
                setMakeFilter,
                [
                  { value: "all", label: "All Makes" },
                  ...uniqueMakes.map((make) => ({ value: make, label: make })),
                ],
              )}

              {/* Year Filter */}
              {renderSelect(
                "Year",
                yearFilter,
                setYearFilter,
                [
                  { value: "all", label: "All Years" },
                  ...uniqueYears.map((year) => ({ value: year.toString(), label: year.toString() })),
                ],
              )}

              {/* Sort */}
              {renderSelect(
                "Sort By",
                priceSort,
                setPriceSort,
                [
                  { value: "none", label: "Default Order" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "year-desc", label: "Year: Newest First" },
                  { value: "year-asc", label: "Year: Oldest First" },
                ],
              )}
            </div>

            {/* Clear Filters */}
            {(searchQuery || makeFilter !== "all" || yearFilter !== "all" || priceSort !== "none") && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setMakeFilter("all");
                    setYearFilter("all");
                    setPriceSort("none");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Listings Grid */}
        <Card className="bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-600">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchListings()}
              >
                Retry
              </Button>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Listings Found
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {listings.length === 0
                  ? "No inventory items available at the moment."
                  : "No listings match your current filters. Try adjusting your search criteria."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map((item) => {
                  const isBookmarked = item.id ? bookmarkedIds.has(item.id) : false;
                  const isBookmarking = item.id === bookmarkingId;

                  return (
                    <Card
                      key={item.id}
                      className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 pt-0 pb-4"
                    >
                      {/* Image with Favorite */}
                      <div className="relative">
                        <ImageSlider
                          images={item.images || []}
                          title={item.title}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(item);
                          }}
                          disabled={!item.id || isBookmarking}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white shadow-md transition-colors disabled:opacity-50 disabled:pointer-events-none"
                          aria-label={isBookmarked ? "Remove from favorites" : "Save to favorites"}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              isBookmarked
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>

                      <CardContent className="px-4 py-0">
                        {/* Title */}
                        <h3 className="text-lg font-bold truncate mt-3 mb-1">
                          {item.title || "Untitled"}
                        </h3>

                        {/* Price */}
                        <p className="text-xl font-bold text-blue-600 mb-2">
                          {formatPrice(item.price, item.currency)}
                        </p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="text-gray-400">Year:</span>{" "}
                            <span className="font-medium">{item.year}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Mileage:</span>{" "}
                            <span className="font-medium">
                              {formatMileage(item.mileage)} mi
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Make:</span>{" "}
                            <span className="font-medium">{item.make}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Model:</span>{" "}
                            <span className="font-medium">{item.model}</span>
                          </div>
                        </div>

                        {/* VIN */}
                        <p className="text-xs font-mono text-gray-500 mb-2 truncate">
                          VIN: {item.vin}
                        </p>

                        {/* Location & Source */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{item.location}</span>
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                            {item.source}
                          </span>
                        </div>

                        {/* Listed Date */}
                        <p className="text-xs text-gray-400 mb-3">
                          Listed: {formatDate(item.listedAt)}
                        </p>

                        {/* View Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(item.url, "_blank")}
                        >
                          View on {item.source}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More */}
              {nextCursor && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </Layout>
    </ProtectedRoute>
  );
}
