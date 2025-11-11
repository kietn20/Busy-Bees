"use client";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const RecentView = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevEnabled(emblaApi.canScrollPrev());
    setNextEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div
      className="relative mx-auto p-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="embla overflow-hidden select-none" ref={emblaRef}>
        <div className="embla__container flex">
          {[...Array(9)].map((_, i) => (
            <div className="embla__slide px-2" key={i}>
              <div className="relative rounded-lg border shadow-sm overflow-hidden w-full bg-white">
                <div className="relative h-40 overflow-hidden rounded-t-lg">
                  <Image
                    src="/beige.jpg"
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <a href="#" className="text-sm font-medium">
                    Note {i + 1}
                  </a>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev button (hidden at left edge) */}
      <button
        onClick={scrollPrev}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center transition-opacity ${
          prevEnabled && isHovered
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        ‹
      </button>

      {/* Next button (hidden at right edge) */}
      <button
        onClick={scrollNext}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center transition-opacity ${
          nextEnabled && isHovered
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        ›
      </button>
    </div>
  );
};

export default RecentView;
