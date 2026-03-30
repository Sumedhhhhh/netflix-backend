import { useNavigate } from '@tanstack/react-router';
import { Play, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Video } from '../../api/types';

interface HeroBannerProps {
  video: Video | null;
  isLoading?: boolean;
}

function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[56.25vw] max-h-[85vh] min-h-[400px] bg-netflix-bg-secondary animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-16 left-4 md:left-12 space-y-4">
        <div className="h-12 w-80 bg-netflix-bg-elevated rounded" />
        <div className="h-4 w-96 bg-netflix-bg-elevated rounded" />
        <div className="h-4 w-72 bg-netflix-bg-elevated rounded" />
        <div className="flex gap-3 mt-4">
          <div className="h-11 w-32 bg-netflix-bg-elevated rounded" />
          <div className="h-11 w-36 bg-netflix-bg-elevated rounded" />
        </div>
      </div>
    </div>
  );
}

export function HeroBanner({ video, isLoading = false }: HeroBannerProps) {
  const navigate = useNavigate();

  if (isLoading || !video) {
    return <HeroBannerSkeleton />;
  }

  const handlePlay = () => {
    navigate({
      to: '/watch/$videoId',
      params: { videoId: String(video.id) },
      search: { resume: false },
    });
  };

  const handleMoreInfo = () => {
    navigate({
      to: '/watch/$videoId',
      params: { videoId: String(video.id) },
      search: { resume: false },
    });
  };

  return (
    <div className="relative w-full h-[56.25vw] max-h-[85vh] min-h-[400px] overflow-hidden">
      {/* Background Image */}
      {video.thumbnailUrl ? (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-netflix-bg-elevated via-netflix-gray-dark to-black" />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-netflix-bg to-transparent" />

      {/* Content */}
      <div className="absolute bottom-[20%] left-4 md:left-12 max-w-2xl">
        {/* Title */}
        <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight drop-shadow-2xl">
          {video.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          {video.releaseYear && (
            <span className="text-green-400 font-semibold text-sm">
              {video.releaseYear}
            </span>
          )}
          {video.durationSeconds && (
            <span className="text-netflix-gray-light text-sm">
              {Math.floor(video.durationSeconds / 60)} min
            </span>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <p className="text-netflix-gray-light text-sm md:text-base leading-relaxed mb-6 line-clamp-3 drop-shadow">
            {video.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="white"
            size="lg"
            onClick={handlePlay}
            className="flex items-center gap-2 shadow-xl"
          >
            <Play size={20} className="fill-black" />
            Play
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleMoreInfo}
            className="flex items-center gap-2 bg-netflix-gray-mid/40 hover:bg-netflix-gray-mid/60 border-0 backdrop-blur-sm"
          >
            <Info size={20} />
            More Info
          </Button>
        </div>
      </div>
    </div>
  );
}
