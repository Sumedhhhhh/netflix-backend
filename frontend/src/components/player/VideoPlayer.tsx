import { useRef } from 'react';
import { useHlsPlayer, type HlsLevel } from '../../hooks/useHlsPlayer';
import { Spinner } from '../ui/Spinner';

interface VideoPlayerProps {
  src: string | null;
  startPosition?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onLevelsLoaded?: (levels: HlsLevel[]) => void;
  className?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onPlayerReady?: (ref: React.RefObject<HTMLVideoElement>) => void;
}

export function VideoPlayer({
  src,
  startPosition = 0,
  onTimeUpdate,
  onLevelsLoaded,
  className = '',
  videoRef: externalRef,
}: VideoPlayerProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef ?? internalRef;

  const { isReady, error } = useHlsPlayer({
    videoRef,
    src,
    startPosition,
    onTimeUpdate,
    onLevelsLoaded,
  });

  return (
    <div className={`relative bg-black ${className}`}>
      {/* Video element - never re-render during playback */}
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        style={{ display: 'block' }}
      />

      {/* Loading overlay */}
      {!isReady && !error && src && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Spinner size="xl" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-red-400 text-lg font-semibold mb-2">Playback Error</p>
            <p className="text-netflix-gray-light text-sm max-w-sm">{error}</p>
          </div>
        </div>
      )}

      {/* No source placeholder */}
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-netflix-gray-mid text-sm">No video source available</p>
        </div>
      )}
    </div>
  );
}
