import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import type { HlsLevel } from '../../hooks/useHlsPlayer';
import { QualitySelector } from './QualitySelector';

interface PlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  currentTime: number;
  isReady: boolean;
  levels: HlsLevel[];
  currentLevel: number;
  onSetLevel: (level: number) => void;
  visible: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function PlayerControls({
  videoRef,
  duration,
  currentTime,
  isReady,
  levels,
  currentLevel,
  onSetLevel,
  visible,
  isFullscreen,
  onToggleFullscreen,
}: PlayerControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrubberValue, setScrubberValue] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const scrubberRef = useRef<HTMLInputElement>(null);

  const { volume, muted, setVolume, toggleMuted } = usePlayerStore();

  // Sync play state from video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef]);

  // Sync scrubber with current time (when not dragging)
  useEffect(() => {
    if (!isDragging && duration > 0) {
      setScrubberValue((currentTime / duration) * 100);
    }
  }, [currentTime, duration, isDragging]);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, [videoRef]);

  const handleScrubberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setScrubberValue(val);
      if (videoRef.current && duration > 0) {
        videoRef.current.currentTime = (val / 100) * duration;
      }
    },
    [videoRef, duration]
  );

  const handleSkip = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    },
    [videoRef, duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setVolume(val);
      if (videoRef.current) {
        videoRef.current.volume = val;
        if (val > 0 && muted) {
          toggleMuted();
        }
      }
    },
    [setVolume, videoRef, muted, toggleMuted]
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0
        bg-gradient-to-t from-black/90 via-black/50 to-transparent
        px-4 md:px-8 pb-4 pt-16
        transition-opacity duration-300
        ${visible || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* Progress / Scrubber */}
      <div className="relative mb-3 group/scrubber">
        {/* Track background */}
        <div className="relative h-1 group-hover/scrubber:h-1.5 transition-all duration-150 rounded-full bg-netflix-gray-dark/60 cursor-pointer">
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full bg-netflix-red rounded-full pointer-events-none"
            style={{ width: `${isDragging ? scrubberValue : progressPercent}%` }}
          />
        </div>

        {/* Invisible range input for interaction */}
        <input
          ref={scrubberRef}
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={isDragging ? scrubberValue : progressPercent}
          onChange={handleScrubberChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
          disabled={!isReady}
          aria-label="Video progress"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="text-white hover:text-netflix-gray-light transition-colors disabled:opacity-50 p-1"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={22} className="fill-white" /> : <Play size={22} className="fill-white ml-0.5" />}
          </button>

          {/* Skip back */}
          <button
            onClick={() => handleSkip(-10)}
            disabled={!isReady}
            className="text-white hover:text-netflix-gray-light transition-colors disabled:opacity-50 p-1"
            aria-label="Rewind 10 seconds"
          >
            <SkipBack size={20} />
          </button>

          {/* Skip forward */}
          <button
            onClick={() => handleSkip(10)}
            disabled={!isReady}
            className="text-white hover:text-netflix-gray-light transition-colors disabled:opacity-50 p-1"
            aria-label="Skip 10 seconds"
          >
            <SkipForward size={20} />
          </button>

          {/* Volume */}
          <div
            className="flex items-center gap-2 relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={toggleMuted}
              className="text-white hover:text-netflix-gray-light transition-colors p-1"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <VolumeX size={22} />
              ) : (
                <Volume2 size={22} />
              )}
            </button>

            {/* Volume slider */}
            <div
              className={`
                flex items-center overflow-hidden transition-all duration-200
                ${showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'}
              `}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-white cursor-pointer"
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Time display */}
          <span className="text-white text-sm font-medium tabular-nums">
            {formatTime(currentTime)}
            <span className="text-netflix-gray-mid mx-1">/</span>
            {formatTime(duration)}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Quality selector */}
          {levels.length > 0 && (
            <QualitySelector
              levels={levels}
              currentLevel={currentLevel}
              onSetLevel={onSetLevel}
            />
          )}

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="text-white hover:text-netflix-gray-light transition-colors p-1"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
