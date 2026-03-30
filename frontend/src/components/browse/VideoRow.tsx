import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoCard } from './VideoCard';
import { VideoRowSkeleton } from './VideoCardSkeleton';
import type { Video, ContinueWatchingItem } from '../../api/types';

interface VideoRowProps {
  title: string;
  videos: Video[];
  isLoading?: boolean;
  continueWatchingMap?: Map<number, ContinueWatchingItem>;
}

export function VideoRow({
  title,
  videos,
  isLoading = false,
  continueWatchingMap,
}: VideoRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
    setTimeout(updateScrollButtons, 400);
  }, [updateScrollButtons]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="px-4 md:px-12 mb-3">
          <div
            className="h-5 w-40 rounded"
            style={{
              background: 'linear-gradient(90deg, #181818 0%, #2f2f2f 50%, #181818 100%)',
              backgroundSize: '1000px 100%',
              animation: 'shimmer 2s infinite linear',
            }}
          />
        </div>
        <VideoRowSkeleton />
      </div>
    );
  }

  if (!videos.length) return null;

  return (
    <div className="mb-8 group/row">
      {/* Row title */}
      <h2 className="text-white font-semibold text-lg md:text-xl px-4 md:px-12 mb-3">
        {title}
      </h2>

      {/* Scroll container wrapper */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy('left')}
            className="
              absolute left-0 top-0 bottom-0 z-10
              w-12 md:w-16
              flex items-center justify-center
              bg-gradient-to-r from-black/60 to-transparent
              text-white opacity-0 group-hover/row:opacity-100
              transition-opacity duration-200
              hover:from-black/80
            "
            aria-label="Scroll left"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="
            flex gap-2 overflow-x-auto
            px-4 md:px-12
            scrollbar-hide
            scroll-smooth
          "
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={updateScrollButtons}
        >
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              continueWatchingItem={continueWatchingMap?.get(video.id)}
            />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy('right')}
            className="
              absolute right-0 top-0 bottom-0 z-10
              w-12 md:w-16
              flex items-center justify-center
              bg-gradient-to-l from-black/60 to-transparent
              text-white opacity-0 group-hover/row:opacity-100
              transition-opacity duration-200
              hover:from-black/80
            "
            aria-label="Scroll right"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    </div>
  );
}
