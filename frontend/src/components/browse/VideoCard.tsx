import { useState, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Play, Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { videoDetailQueryKey } from '../../hooks/useVideoDetail';
import { getVideo } from '../../api/videos';
import type { Video } from '../../api/types';
import type { ContinueWatchingItem } from '../../api/types';

interface VideoCardProps {
  video: Video;
  continueWatchingItem?: ContinueWatchingItem;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function VideoCard({ video, continueWatchingItem }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const progressPercent =
    continueWatchingItem && continueWatchingItem.duration_s
      ? Math.min(
          100,
          (continueWatchingItem.position_s / continueWatchingItem.duration_s) * 100
        )
      : null;

  const handleMouseEnter = useCallback(() => {
    // Prefetch video detail
    queryClient.prefetchQuery({
      queryKey: videoDetailQueryKey(video.id),
      queryFn: () => getVideo(video.id),
      staleTime: 5 * 60 * 1000,
    });

    hoverTimerRef.current = setTimeout(() => {
      setHovered(true);
    }, 400);
  }, [video.id, queryClient]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHovered(false);
  }, []);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: '/watch/$videoId',
      params: { videoId: String(video.id) },
      search: { resume: !!continueWatchingItem },
    });
  };

  const handleCardClick = () => {
    navigate({
      to: '/watch/$videoId',
      params: { videoId: String(video.id) },
      search: { resume: !!continueWatchingItem },
    });
  };

  return (
    <div
      className="flex-shrink-0 w-48 md:w-56 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base card */}
      <div
        className="cursor-pointer rounded overflow-hidden group"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`Play ${video.title}`}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-netflix-bg-elevated">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-netflix-bg-elevated to-netflix-gray-dark">
              <span className="text-netflix-gray-mid text-xs text-center px-2">
                {video.title}
              </span>
            </div>
          )}

          {/* Progress bar for continue-watching */}
          {progressPercent !== null && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-netflix-gray-dark/60">
              <div
                className="h-full bg-netflix-red transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Title below card */}
        <div className="mt-1 px-0.5">
          <p className="text-white text-xs font-medium truncate">{video.title}</p>
          {video.releaseYear && (
            <p className="text-netflix-gray-mid text-xs">{video.releaseYear}</p>
          )}
        </div>
      </div>

      {/* Hover expanded card - absolute positioned to avoid layout shift */}
      {hovered && (
        <div
          className="
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            z-30 w-72
            bg-netflix-bg-secondary rounded-md overflow-hidden
            shadow-2xl shadow-black/80
            animate-scaleIn
            pointer-events-auto
          "
          onMouseEnter={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            setHovered(true);
          }}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Expanded thumbnail */}
          <div className="relative aspect-video bg-netflix-bg-elevated">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-netflix-bg-elevated to-netflix-gray-dark">
                <span className="text-white text-sm font-medium text-center px-4">
                  {video.title}
                </span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg-secondary/80 to-transparent" />

            {/* Play button overlay */}
            <button
              onClick={handlePlay}
              className="
                absolute inset-0 flex items-center justify-center
                text-white opacity-0 hover:opacity-100
                transition-opacity duration-200
              "
              aria-label={`Play ${video.title}`}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play size={24} className="fill-white text-white ml-1" />
              </div>
            </button>
          </div>

          {/* Info section */}
          <div className="p-3">
            {/* Action buttons */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handlePlay}
                className="
                  flex items-center justify-center
                  w-9 h-9 rounded-full
                  bg-white text-black
                  hover:bg-netflix-gray-light
                  transition-colors duration-200
                "
                aria-label="Play"
              >
                <Play size={16} className="fill-black ml-0.5" />
              </button>
              <button
                onClick={handlePlay}
                className="
                  flex items-center justify-center
                  w-9 h-9 rounded-full
                  border-2 border-netflix-gray-mid
                  text-white hover:border-white
                  transition-colors duration-200
                "
                aria-label="More info"
              >
                <Info size={16} />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold text-sm mb-1 leading-tight">
              {video.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-netflix-gray-mid mb-2">
              {video.releaseYear && <span>{video.releaseYear}</span>}
              {video.durationSeconds && (
                <span>{formatDuration(video.durationSeconds)}</span>
              )}
            </div>

            {/* Description */}
            {video.description && (
              <p className="text-netflix-gray-light text-xs line-clamp-3 leading-relaxed">
                {video.description}
              </p>
            )}

            {/* Continue watching progress */}
            {progressPercent !== null && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-netflix-gray-mid mb-1">
                  <span>
                    {Math.floor((continueWatchingItem!.position_s / 60))}m watched
                  </span>
                </div>
                <div className="h-1 bg-netflix-gray-dark rounded-full">
                  <div
                    className="h-full bg-netflix-red rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
