// components/QuranReader.tsx
"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import "../../globals.css"

const TOTAL_PAGES = 604;

const SURAH_ARRAY = [
  { "number": 1, "name": "الفاتحة", "page": 1 },
  { "number": 2, "name": "البقرة", "page": 2 },
  { "number": 3, "name": "آل عمران", "page": 50 },
  { "number": 4, "name": "النساء", "page": 77 },
  { "number": 5, "name": "المائدة", "page": 106 },
  { "number": 6, "name": "الأنعام", "page": 128 },
  { "number": 7, "name": "الأعراف", "page": 151 },
  { "number": 8, "name": "الأنفال", "page": 177 },
  { "number": 9, "name": "التوبة", "page": 187 },
  { "number": 10, "name": "يونس", "page": 208 },
  { "number": 11, "name": "هود", "page": 221 },
  { "number": 12, "name": "يوسف", "page": 235 },
  { "number": 13, "name": "الرعد", "page": 249 },
  { "number": 14, "name": "ابراهيم", "page": 255 },
  { "number": 15, "name": "الحجر", "page": 262 },
  { "number": 16, "name": "النحل", "page": 267 },
  { "number": 17, "name": "الإسراء", "page": 282 },
  { "number": 18, "name": "الكهف", "page": 293 },
  { "number": 19, "name": "مريم", "page": 305 },
  { "number": 20, "name": "طه", "page": 312 },
  { "number": 21, "name": "الأنبياء", "page": 322 },
  { "number": 22, "name": "الحج", "page": 332 },
  { "number": 23, "name": "المؤمنون", "page": 342 },
  { "number": 24, "name": "النور", "page": 350 },
  { "number": 25, "name": "الفرقان", "page": 359 },
  { "number": 26, "name": "الشعراء", "page": 367 },
  { "number": 27, "name": "النمل", "page": 377 },
  { "number": 28, "name": "القصص", "page": 385 },
  { "number": 29, "name": "العنكبوت", "page": 396 },
  { "number": 30, "name": "الروم", "page": 404 },
  { "number": 31, "name": "لقمان", "page": 411 },
  { "number": 32, "name": "السجدة", "page": 415 },
  { "number": 33, "name": "الأحزاب", "page": 418 },
  { "number": 34, "name": "سبإ", "page": 428 },
  { "number": 35, "name": "فاطر", "page": 434 },
  { "number": 36, "name": "يس", "page": 440 },
  { "number": 37, "name": "الصافات", "page": 446 },
  { "number": 38, "name": "ص", "page": 453 },
  { "number": 39, "name": "الزمر", "page": 458 },
  { "number": 40, "name": "غافر", "page": 467 },
  { "number": 41, "name": "فصلت", "page": 477 },
  { "number": 42, "name": "الشورى", "page": 483 },
  { "number": 43, "name": "الزخرف", "page": 489 },
  { "number": 44, "name": "الدخان", "page": 496 },
  { "number": 45, "name": "الجاثية", "page": 499 },
  { "number": 46, "name": "الأحقاف", "page": 502 },
  { "number": 47, "name": "محمد", "page": 507 },
  { "number": 48, "name": "الفتح", "page": 511 },
  { "number": 49, "name": "الحجرات", "page": 515 },
  { "number": 50, "name": "ق", "page": 518 },
  { "number": 51, "name": "الذاريات", "page": 520 },
  { "number": 52, "name": "الطور", "page": 523 },
  { "number": 53, "name": "النجم", "page": 526 },
  { "number": 54, "name": "القمر", "page": 528 },
  { "number": 55, "name": "الرحمن", "page": 531 },
  { "number": 56, "name": "الواقعة", "page": 534 },
  { "number": 57, "name": "الحديد", "page": 537 },
  { "number": 58, "name": "المجادلة", "page": 542 },
  { "number": 59, "name": "الحشر", "page": 545 },
  { "number": 60, "name": "الممتحنة", "page": 549 },
  { "number": 61, "name": "الصف", "page": 551 },
  { "number": 62, "name": "الجمعة", "page": 553 },
  { "number": 63, "name": "المنافقون", "page": 554 },
  { "number": 64, "name": "التغابن", "page": 556 },
  { "number": 65, "name": "الطلاق", "page": 558 },
  { "number": 66, "name": "التحريم", "page": 560 },
  { "number": 67, "name": "الملك", "page": 562 },
  { "number": 68, "name": "القلم", "page": 564 },
  { "number": 69, "name": "الحاقة", "page": 566 },
  { "number": 70, "name": "المعارج", "page": 568 },
  { "number": 71, "name": "نوح", "page": 570 },
  { "number": 72, "name": "الجن", "page": 572 },
  { "number": 73, "name": "المزمل", "page": 574 },
  { "number": 74, "name": "المدثر", "page": 575 },
  { "number": 75, "name": "القيامة", "page": 577 },
  { "number": 76, "name": "الانسان", "page": 578 },
  { "number": 77, "name": "المرسلات", "page": 580 },
  { "number": 78, "name": "النبأ", "page": 582 },
  { "number": 79, "name": "النازعات", "page": 583 },
  { "number": 80, "name": "عبس", "page": 585 },
  { "number": 81, "name": "التكوير", "page": 586 },
  { "number": 82, "name": "الإنفطار", "page": 587 },
  { "number": 83, "name": "المطففين", "page": 587 },
  { "number": 84, "name": "الإنشقاق", "page": 589 },
  { "number": 85, "name": "البروج", "page": 590 },
  { "number": 86, "name": "الطارق", "page": 591 },
  { "number": 87, "name": "الأعلى", "page": 591 },
  { "number": 88, "name": "الغاشية", "page": 592 },
  { "number": 89, "name": "الفجر", "page": 593 },
  { "number": 90, "name": "البلد", "page": 594 },
  { "number": 91, "name": "الشمس", "page": 595 },
  { "number": 92, "name": "الليل", "page": 595 },
  { "number": 93, "name": "الضحى", "page": 596 },
  { "number": 94, "name": "الشرح", "page": 596 },
  { "number": 95, "name": "التين", "page": 597 },
  { "number": 96, "name": "العلق", "page": 597 },
  { "number": 97, "name": "القدر", "page": 598 },
  { "number": 98, "name": "البينة", "page": 598 },
  { "number": 99, "name": "الزلزلة", "page": 599 },
  { "number": 100, "name": "العاديات", "page": 599 },
  { "number": 101, "name": "القارعة", "page": 600 },
  { "number": 102, "name": "التكاثر", "page": 600 },
  { "number": 103, "name": "العصر", "page": 601 },
  { "number": 104, "name": "الهمزة", "page": 601 },
  { "number": 105, "name": "الفيل", "page": 601 },
  { "number": 106, "name": "قريش", "page": 602 },
  { "number": 107, "name": "الماعون", "page": 602 },
  { "number": 108, "name": "الكوثر", "page": 602 },
  { "number": 109, "name": "الكافرون", "page": 603 },
  { "number": 110, "name": "النصر", "page": 603 },
  { "number": 111, "name": "المسد", "page": 603 },
  { "number": 112, "name": "الإخلاص", "page": 604 },
  { "number": 113, "name": "الفلق", "page": 604 },
  { "number": 114, "name": "الناس", "page": 604 }
];

interface SurahMap {
  [key: string]: {
    number: number;
    name: string;
    page: number;
  };
}

interface QuranReaderProps {
  locale: string;
  messages: { [key: string]: string };
}

const QuranReader = ({ locale, messages }: QuranReaderProps) => {
  const t = (key: string) => messages[key] || key;
  const bookRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
  const [clickedPage, setClickedPage] = useState<"left" | "right" | null>(null);
  const [preloadedPages, setPreloadedPages] = useState<number[]>([]);

  useEffect(() => {
    const savedZoomLevel = localStorage.getItem('zoomLevel');
    if (savedZoomLevel) {
      setZoomLevel(parseFloat(savedZoomLevel));
    }
    
   
  }, []);

  const surahMap: SurahMap = useMemo(() => (
    SURAH_ARRAY.reduce((acc, surah) => {
      acc[surah.number.toString()] = surah;
      return acc;
    }, {} as SurahMap)
  ), []);

  useEffect(() => {
    localStorage.setItem('zoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  

  useEffect(() => {
    const pagesToPreload = [];
    pagesToPreload.push(currentPage);
    pagesToPreload.push(currentPage - 1);
    
    if (currentPage < TOTAL_PAGES - 1) {
      pagesToPreload.push(currentPage + 1);
      pagesToPreload.push(currentPage + 2);
    }
    
    if (currentPage > 3) {
      pagesToPreload.push(currentPage - 2);
      pagesToPreload.push(currentPage - 3);
    }
    
    const validPages = pagesToPreload.filter(page => page >= 1 && page <= TOTAL_PAGES);
    setPreloadedPages(validPages);
    
    if (typeof window !== 'undefined') {
      validPages.forEach(page => {
        const imgElement = new window.Image();
        imgElement.src = `https://cdn.qurango.net/Sura2/files/mobile/${page}.jpg`;
      });
    }
  }, [currentPage]);

  // Fixed: Corrected page navigation logic
  const handleNextPage = (clickedSide: "left" | "right" = "right") => {
    if (isAnimating || flipDirection) return;
    if (currentPage < TOTAL_PAGES) {
      setIsAnimating(true);
      setFlipDirection("next");
      setClickedPage(clickedSide);
      
      setTimeout(() => {
        setCurrentPage(prev => Math.min(prev + 2, TOTAL_PAGES));
        setTimeout(() => {
          setFlipDirection(null);
          setClickedPage(null);
          setIsAnimating(false);
        }, 50);
      }, 400);
    }
  };

  const handlePrevPage = (clickedSide: "left" | "right" = "left") => {
    if (isAnimating || flipDirection) return;
    if (currentPage > 2) {
      setIsAnimating(true);
      setFlipDirection("prev");
      setClickedPage(clickedSide);
      
      setTimeout(() => {
        setCurrentPage(prev => Math.max(prev - 2, 2));
        setTimeout(() => {
          setFlipDirection(null);
          setClickedPage(null);
          setIsAnimating(false);
        }, 50);
      }, 400);
    }
  };

  // Fixed: Corrected click handlers for pages
  const handlePageClick = (side: "left" | "right") => {
    if (dragStart) return; // Ignore clicks during drag
    
    if (side === "left") {
      // If we're on the first page, clicking left should do nothing
      if (currentPage > 2) {
        handlePrevPage("left");
      }
    } else if (side === "right") {
      // If we're on the last page, clicking right should do nothing
      if (currentPage < TOTAL_PAGES) {
        handleNextPage("right");
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, direction: "next" | "prev") => {
    if (isAnimating || flipDirection) return;
    setDragStart(e.clientX);
    setDragCurrent(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;
    setDragCurrent(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent, direction: "next" | "prev") => {
    if (dragStart === null || dragCurrent === null) return;
    
    const dragDistance = dragCurrent - dragStart;
    const threshold = 50;
    
    if (Math.abs(dragDistance) > threshold) {
      if ((direction === "next" && dragDistance < 0) || 
          (direction === "prev" && dragDistance > 0)) {
        if (direction === "next") {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    }
    
    setDragStart(null);
    setDragCurrent(null);
  };

  const leftPage = currentPage - 1;
  const rightPage = currentPage;

  const nextLeftPage = currentPage + 1;
  const nextRightPage = currentPage + 2;
  const prevLeftPage = currentPage - 3;
  const prevRightPage = currentPage - 2;

  const getPageStyle = (direction: "next" | "prev") => {
    if (dragStart === null || dragCurrent === null) return {};
    
    const dragDistance = dragCurrent - dragStart;
    const maxRotation = 45;
    const bookWidth = bookRef.current?.clientWidth || 800;
    
    let rotation = 0;
    
    if (direction === "next" && dragDistance < 0) {
      rotation = Math.max(-maxRotation, dragDistance / (bookWidth / 2) * maxRotation);
    } else if (direction === "prev" && dragDistance > 0) {
      rotation = Math.min(maxRotation, dragDistance / (bookWidth / 2) * maxRotation);
    }
    
    return {
      transform: direction === "next" 
        ? `rotateY(${rotation}deg)` 
        : `rotateY(${-rotation}deg)`
    };
  };

  return (
    <div className='min-h-screen py-6  bg-gray-100'>
      <div className="flex flex-col items-center">
        
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))} className="px-3 py-1 bg-emerald-600 text-white rounded">+</button>
          <button onClick={() => setZoomLevel(1)} className="px-3 py-1 bg-gray-300 rounded">{Math.round(zoomLevel * 100)}%</button>
          <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="px-3 py-1 bg-emerald-600 text-white rounded">-</button>
        </div>

        <div className="fliping-book" style={{ transform: `scale(${zoomLevel})` }}>
          <div className="book" ref={bookRef}>
            <div className="book-spine"></div>
            <div className="pages">
              <div className="spread">
                <div style={{ display: 'none' }}>
                  {preloadedPages.map(page => (
                    <img 
                      key={`preload-${page}`}
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${page}.jpg`}
                      alt="Preloaded page"
                    />
                  ))}
                </div>
                
                {/* Left Page */}
                {leftPage >= 1 && (
                  <div 
                    className={classNames("page left", {
                      "flipped": flipDirection === "next" && clickedPage === "left"
                    })}
                    style={dragStart !== null ? getPageStyle("prev") : {}}
                    onMouseDown={(e) => handleMouseDown(e, "prev")}
                    onMouseMove={handleMouseMove}
                    onMouseUp={(e) => handleMouseUp(e, "prev")}
                    onMouseLeave={(e) => dragStart !== null && handleMouseUp(e, "prev")}
                    // Fixed: Changed to handlePageClick
                    onClick={() => handlePageClick("left")}
                  >
                    <Image
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${leftPage}.jpg`}
                      alt={`الصفحة ${leftPage}`}
                      width={400}
                      height={600}
                      quality={90}
                      className="w-full h-full object-cover"
                      priority={true}
                      unoptimized
                    />
                  </div>
                )}

                {/* Right Page */}
                {rightPage <= TOTAL_PAGES && (
                  <div 
                    className={classNames("page right", {
                      "flipped": flipDirection === "prev" && clickedPage === "right"
                    })}
                    style={dragStart !== null ? getPageStyle("next") : {}}
                    onMouseDown={(e) => handleMouseDown(e, "next")}
                    onMouseMove={handleMouseMove}
                    onMouseUp={(e) => handleMouseUp(e, "next")}
                    onMouseLeave={(e) => dragStart !== null && handleMouseUp(e, "next")}
                    onClick={() => handlePageClick("right")}
                  >
                    <Image
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${rightPage}.jpg`}
                      alt={`الصفحة ${rightPage}`}
                      width={400}
                      height={600}
                      quality={90}
                      className="w-full h-full object-cover"
                      priority={true}
                      unoptimized
                    />
                  </div>
                )}

                   {/* Previous pages */}
                   {flipDirection === "prev" && prevLeftPage >= 1 && (
                  <div className="hidden-prev-page" style={{ display: 'none' }}>
                    <Image
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${prevLeftPage}.jpg`}
                      alt={`الصفحة ${prevLeftPage}`}
                      width={400}
                      height={600}
                      quality={90}
                      priority={true}
                      unoptimized
                    />
                  </div>
                )}
                {flipDirection === "prev" && prevRightPage >= 1 && (
                  <div className="hidden-prev-page" style={{ display: 'none' }}>
                    <Image
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${prevRightPage}.jpg`}
                      alt={`الصفحة ${prevRightPage}`}
                      width={400}
                      height={600}
                      quality={90}
                      priority={true}
                      unoptimized
                    />
                  </div>
                )}
                
                {/* Next pages */}
                {flipDirection === "next" && nextRightPage <= TOTAL_PAGES && (
                  <div className="hidden-next-page" style={{ display: 'none' }}>
                    <Image
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${nextRightPage}.jpg`}
                      alt={`الصفحة ${nextRightPage}`}
                      width={400}
                      height={600}
                      quality={90}
                      priority={true}
                      unoptimized
                    />
                  </div>
                )}
                {flipDirection === "next" && nextLeftPage <= TOTAL_PAGES && (
                  <div className="hidden-next-page" style={{ display: 'none' }}>
                    <Image
                      src={`https://cdn.qurango.net/Sura2/files/mobile/${nextLeftPage}.jpg`}
                      alt={`الصفحة ${nextLeftPage}`}
                      width={400}
                      height={600}
                      quality={90}
                      priority={true}
                      unoptimized
                    />
                  </div>
                )}
                
             
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <button 
            onClick={() => handlePrevPage("left")} 
            disabled={currentPage <= 2 || isAnimating}
            className={`px-4 py-2 rounded ${currentPage <= 2 || isAnimating ? 'bg-gray-300' : 'bg-emerald-600 text-white'}`}
          >
            {t("previous") || "السابق"}
          </button>
          
          <button 
            onClick={() => handleNextPage("right")} 
            disabled={currentPage >= TOTAL_PAGES || isAnimating}
            className={`px-4 py-2 rounded ${currentPage >= TOTAL_PAGES || isAnimating ? 'bg-gray-300' : 'bg-emerald-600 text-white'}`}
          >
            {t("next") || "التالي"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuranReader;