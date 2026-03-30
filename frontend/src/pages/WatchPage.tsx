import { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useVideoDetail } from '../hooks/useVideoDetail';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { useProgressReporter } from '../hooks/useProgressReporter';
import { PlayerControls } from '../components/player/PlayerControls';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import type { HlsLevel } from '../hooks/useHlsPlayer';

const MINIO_URL = import.meta.env.VITE_MINIO_URL as string;
const MINIO_BUCKET = import.meta.env.VITE_MINIO_BUCKET as string;

function buildHlsUrl(storagePrefix: string): string {
  return `${MINIO_URL}/${MINIO_BUCKET}/${storagePrefix}/master.m3u8`;
}

export function WatchPage() {
  const { videoId } = useParams({ from: '/watch/$videoId' });
  const search = useSearch({ from: '/watch/$videoId' });
  const navigate = useNavigate();

  const videoIdNum = parseInt(videoId, 10);
  const shouldResume = (search as { resume?: boolean }).resume === true;

  const { data: video, isLoading: videoLoading } = useVideoDetail(videoIdNum);
  const { data: continueWatchingList = [] } = useContinueWatching();

  const continueWatchingItem = continueWatchingList.find(
    (item) => item.video_id === videoIdNum
  );

  const savedPosition = continueWatchingItem?.position_s ?? 0;
  const hasSavedProgress = savedPosition > 30;

  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [startPosition, setStartPosition] = useState<number>(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [levels, setLevels] = useState<HlsLevel[]>([]);
  const currentTimeRef = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show resume dialog if there's saved progress and resume param is true
  useEffect(() => {
    if (hasSavedProgress && shouldResume && !showResumeDialog) {
      setShowResumeDialog(true);
    } else if (!shouldResume) {
      setStartPosition(0);
    }
  }, [hasSavedProgress, shouldResume]); // eslint-disable-line react-hooks/exhaustive-deps

  const hlsUrl = video?.storagePrefix ? buildHlsUrl(video.storagePrefix) : null;

  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time;
  }, []);

  const handleLevelsLoaded = useCallback((loadedLevels: HlsLevel[]) => {
    setLevels(loadedLevels);
  }, []);

  const { isReady, error, currentLevel, setLevel, duration, currentTime } = useHlsPlayer({
    videoRef,
    src: hlsUrl,
    startPosition,
    onTimeUpdate: handleTimeUpdate,
    onLevelsLoaded: handleLevelsLoaded,
  });

  useProgressReporter({
    videoId: videoIdNum,
    getCurrentTime: () => currentTimeRef.current,
    enabled: isReady,
  });

  // Controls auto-hide
  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [resetControlsTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video || !isReady) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (video.paused) video.play();
          else video.pause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 10);
          break;
        case 'f':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          video.muted = !video.muted;
          break;
        default:
          break;
      }
      resetControlsTimer();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isReady, duration, handleToggleFullscreen, resetControlsTimer]);

  const handleResumeFromSaved = () => {
    setStartPosition(savedPosition);
    setShowResumeDialog(false);
  };

  const handleStartFromBeginning = () => {
    setStartPosition(0);
    setShowResumeDialog(false);
  };

  const handleBack = () => {
    navigate({ to: '/browse' });
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white text-xl">Video not found</p>
        <Button onClick={handleBack} variant="secondary">
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        style={{ display: 'block' }}
      />

      {/* Loading overlay */}
      {!isReady && !error && hlsUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Spinner size="xl" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4">
          <p className="text-red-400 text-xl font-semibold">Playback Error</p>
          <p className="text-netflix-gray-light text-sm max-w-md text-center">{error}</p>
          <Button onClick={handleBack} variant="secondary">
            Back to Browse
          </Button>
        </div>
      )}

      {/* No HLS source */}
      {!hlsUrl && !videoLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4">
          <p className="text-white text-xl">No video stream available</p>
          <p className="text-netflix-gray-mid text-sm">
            This video doesn&apos;t have a streaming source configured.
          </p>
          <Button onClick={handleBack} variant="secondary">
            Back to Browse
          </Button>
        </div>
      )}

      {/* Top overlay: Back button + Title */}
      <div
        className={`
          absolute top-0 left-0 right-0 z-20
          bg-gradient-to-b from-black/80 to-transparent
          px-4 md:px-8 py-4
          transition-opacity duration-300
          ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="
              text-white hover:text-netflix-gray-light
              transition-colors p-2 rounded-full
              bg-black/30 hover:bg-black/50
            "
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">
              {video.title}
            </h1>
            {video.releaseYear && (
              <p className="text-netflix-gray-mid text-sm">{video.releaseYear}</p>
            )}
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <PlayerControls
        videoRef={videoRef}
        duration={duration}
        currentTime={currentTime}
        isReady={isReady}
        levels={levels}
        currentLevel={currentLevel}
        onSetLevel={setLevel}
        visible={controlsVisible}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Resume Dialog */}
      <Modal
        isOpen={showResumeDialog}
        onClose={handleStartFromBeginning}
        title="Resume Watching"
      >
        <div className="space-y-4">
          <p className="text-netflix-gray-light">
            You were watching <strong className="text-white">{video.title}</strong>.
            Would you like to continue from where you left off?
          </p>
          {continueWatchingItem && (
            <p className="text-netflix-gray-mid text-sm">
              Last watched at{' '}
              {Math.floor(continueWatchingItem.position_s / 60)}m{' '}
              {Math.floor(continueWatchingItem.position_s % 60)}s
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleResumeFromSaved}
              variant="primary"
              size="md"
              className="flex-1"
            >
              Resume
            </Button>
            <Button
              onClick={handleStartFromBeginning}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              Start Over
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
