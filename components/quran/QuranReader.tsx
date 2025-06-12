"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  SurahMap,
  SURAH_ARRAY,
  QuranReaderProps,
} from "@/components/quran/types";
import Image from "next/image";
import classNames from "classnames";
import "@/app/globals.css";

const QURAN_PAGES = 604;

const QuranReader = ({ locale, messages, onPageChange }: QuranReaderProps) => {
  const t = (key: string) => messages[key] || key;
  const bookRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [currentPage, setCurrentPage] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(
    null,
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
  const [preloadedPages, setPreloadedPages] = useState<number[]>([]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1024); // Tablet and mobile
    };

    if (isMobile) {
      setZoomLevel(1.1);
      setCurrentPage(2);
    }

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [isMobile]);

  useEffect(() => {
    const savedZoomLevel = localStorage.getItem("zoomLevel");
    if (savedZoomLevel) {
      setZoomLevel(parseFloat(savedZoomLevel));
    }
  }, []);

  const surahMap: SurahMap = useMemo(
    () =>
      SURAH_ARRAY.reduce((acc, surah) => {
        acc[surah.number.toString()] = surah;
        return acc;
      }, {} as SurahMap),
    [],
  );

  useEffect(() => {
    localStorage.setItem("zoomLevel", zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    const pagesToPreload = [currentPage];

    if (currentPage < QURAN_PAGES) {
      pagesToPreload.push(currentPage + 1);
    }

    if (currentPage > 1) {
      pagesToPreload.push(currentPage - 1);
    }

    const validPages = pagesToPreload.filter(
      (page) => page >= 1 && page <= QURAN_PAGES,
    );
    setPreloadedPages(validPages);

    if (typeof window !== "undefined") {
      validPages.forEach((page) => {
        const imgElement = new window.Image();
        imgElement.src = `https://cdn.qurango.net/Sura2/files/mobile/${page}.jpg`;
      });
    }
  }, [currentPage]);

  // Notify parent component when page changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = () => {
    if (isAnimating || flipDirection) return;
    if (currentPage < QURAN_PAGES) {
      setIsAnimating(true);
      setFlipDirection("next");

      setTimeout(() => {
        setCurrentPage((prev) => Math.min(prev + 1, QURAN_PAGES));
        setTimeout(() => {
          setFlipDirection(null);
          setIsAnimating(false);
        }, 50);
      }, 400);
    }
  };

  const handlePrevPage = () => {
    if (isAnimating || flipDirection) return;
    if (currentPage > 1) {
      setIsAnimating(true);
      setFlipDirection("prev");

      setTimeout(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
        setTimeout(() => {
          setFlipDirection(null);
          setIsAnimating(false);
        }, 50);
      }, 400);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || flipDirection) return;
    setDragStart(e.clientX);
    setDragCurrent(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;
    setDragCurrent(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStart === null || dragCurrent === null) return;

    const dragDistance = dragCurrent - dragStart;
    const threshold = 50;

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }

    setDragStart(null);
    setDragCurrent(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating || flipDirection) return;
    setDragStart(e.touches[0].clientX);
    setDragCurrent(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    setDragCurrent(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStart === null || dragCurrent === null) return;

    const dragDistance = dragCurrent - dragStart;
    const threshold = 30;

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }

    setDragStart(null);
    setDragCurrent(null);
  };

  const getPageStyle = () => {
    if (dragStart === null || dragCurrent === null) return {};

    const dragDistance = dragCurrent - dragStart;
    const maxRotation = 30;
    const bookWidth = bookRef.current?.clientWidth || 800;

    let rotation = (dragDistance / (bookWidth / 2)) * maxRotation;

    return {
      transform: `translateX(${dragDistance / 5}px)`,
    };
  };

  // Navigate to specific surah
  const handleSurahSelect = (surahNumber: number) => {
    const surah = SURAH_ARRAY.find(s => s.number === surahNumber);
    if (surah) {
      setCurrentPage(surah.page);
    }
  };

  // Navigate to specific page
  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= QURAN_PAGES) {
      setCurrentPage(page);
    }
  };

  // Get current surah info based on current page
  const getCurrentSurah = () => {
    const surahs = [...SURAH_ARRAY].reverse();
    return surahs.find(surah => currentPage >= surah.page) || SURAH_ARRAY[0];
  };

  const currentSurah = getCurrentSurah();

  return (    <div
      className="min-h-screen py-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="flex flex-col items-center">
        {/* Navigation Controls */}
        <div className="flex flex-col gap-4 mb-6 w-full max-w-4xl px-4">          {/* Current Surah Info */}
          <div className="text-center" dir="rtl">
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              سورة {currentSurah.name} - الصفحة {currentPage}
            </h2>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center">            {/* Surah Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                اختر السورة
              </label>
              <select
                value={currentSurah.number}
                onChange={(e) => handleSurahSelect(Number(e.target.value))}
                className="px-3 py-2 rounded border text-center min-w-[200px]"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                }}
                dir="rtl"
              >
                {SURAH_ARRAY.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                اختر الصفحة
              </label>
              <select
                value={currentPage}
                onChange={(e) => handlePageSelect(Number(e.target.value))}
                className="px-3 py-2 rounded border text-center min-w-[120px]"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                }}
                dir="rtl"
              >
                {Array.from({ length: QURAN_PAGES }, (_, i) => i + 1).map((page) => (
                  <option key={page} value={page}>
                    صفحة {page}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Page Input */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                اذهب إلى صفحة
              </label>
              <input
                type="number"
                min="1"
                max={QURAN_PAGES}
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= QURAN_PAGES) {
                    handlePageSelect(page);
                  }
                }}
                className="px-3 py-2 rounded border text-center w-20"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                }}
                dir="rtl"
              />
            </div>
          </div>
        </div>        {/* Zoom Controls */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2, z + 0.1))}
            className="px-3 py-1 rounded transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "var(--color-button)",
              color: "var(--color-background)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="px-3 py-1 rounded transition-colors duration-200"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: `1px solid var(--color-border)`,
            }}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
            className="px-3 py-1 rounded transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "var(--color-button)",
              color: "var(--color-background)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            -
          </button>
        </div>

        <div
          className="fliping-book"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="book" ref={bookRef}>
            <div className="pages">
              <div className="spread">
                <div style={{ display: "none" }}>
                  {preloadedPages.map((page) => (
                    <img
                      key={`preload-${page}`}
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${page}.jpg`}
                      alt="Preloaded page"
                    />
                  ))}
                </div>

                {/* Single Page View for Mobile */}
                {isMobile ? (
                  <div
                    className={classNames("page single", {
                      flipped: flipDirection !== null,
                    })}
                    style={dragStart !== null ? getPageStyle() : {}}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={(e) => dragStart !== null && handleMouseUp(e)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <Image
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${currentPage + 1}.jpg`}
                      alt={`الصفحة ${currentPage}`}
                      width={400}
                      height={600}
                      quality={90}
                      className="w-full h-full object-cover"
                      priority={true}
                      unoptimized
                    />
                    <div className="page-number">{currentPage}</div>
                  </div>
                ) : (
                  /* Dual Page View for Desktop */
                  <>
                    {/* Left Page */}
                    {currentPage > 1 && (
                      <div
                        className={classNames("page left", {
                          flipped: flipDirection === "prev",
                        })}
                        style={dragStart !== null ? getPageStyle() : {}}
                        onMouseDown={(e) => handleMouseDown(e)}
                        onMouseMove={handleMouseMove}
                        onMouseUp={(e) => handleMouseUp(e)}
                        onMouseLeave={(e) =>
                          dragStart !== null && handleMouseUp(e)
                        }
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => handlePrevPage()}
                      >
                        <Image
                          src={`https://cdn.qurango.net/Sura2/files/mobile/${currentPage}.jpg`}
                          alt={`الصفحة ${currentPage}`}
                          width={400}
                          height={600}
                          quality={90}
                          className="w-full h-full object-cover"
                          priority={true}
                          unoptimized
                        />
                        <div className="page-number">{currentPage}</div>
                      </div>
                    )}

                    {/* Right Page */}
                    <div
                      className={classNames("page right", {
                        flipped: flipDirection === "next",
                      })}
                      style={dragStart !== null ? getPageStyle() : {}}
                      onMouseDown={(e) => handleMouseDown(e)}
                      onMouseMove={handleMouseMove}
                      onMouseUp={(e) => handleMouseUp(e)}
                      onMouseLeave={(e) =>
                        dragStart !== null && handleMouseUp(e)
                      }
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => handleNextPage()}
                    >
                      <Image
                        src={`https://cdn.qurango.net/Sura2/files/mobile/${currentPage + 1}.jpg`}
                        alt={`الصفحة ${currentPage + 1}`}
                        width={400}
                        height={600}
                        quality={90}
                        className="w-full h-full object-cover"
                        priority={true}
                        unoptimized
                      />
                      <div className="page-number">{currentPage + 1}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>        <div className="flex gap-4 mt-6 justify-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isAnimating}
            className="px-4 py-2 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor:
                currentPage <= 1 || isAnimating
                  ? "var(--color-disabled-button)"
                  : "var(--color-button)",
              color:
                currentPage <= 1 || isAnimating
                  ? "var(--color-muted)"
                  : "var(--color-background)",
              boxShadow:
                currentPage <= 1 || isAnimating ? "none" : "var(--shadow-sm)",
            }}
          >
            السابق
          </button>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= QURAN_PAGES || isAnimating}
            className="px-4 py-2 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor:
                currentPage >= QURAN_PAGES || isAnimating
                  ? "var(--color-disabled-button)"
                  : "var(--color-button)",
              color:
                currentPage >= QURAN_PAGES || isAnimating
                  ? "var(--color-muted)"
                  : "var(--color-background)",
              boxShadow:
                currentPage >= QURAN_PAGES || isAnimating
                  ? "none"
                  : "var(--shadow-sm)",
            }}
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuranReader;
