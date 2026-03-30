import { useEffect, useRef, useCallback, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';

interface UseHlsPlayerOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string | null;
  startPosition?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (err: string) => void;
  onLevelsLoaded?: (levels: HlsLevel[]) => void;
}

export interface HlsLevel {
  height: number;
  bitrate: number;
  name: string;
}

interface UseHlsPlayerReturn {
  isReady: boolean;
  error: string | null;
  levels: HlsLevel[];
  currentLevel: number;
  setLevel: (level: number) => void;
  duration: number;
  currentTime: number;
}

export function useHlsPlayer({
  videoRef,
  src,
  startPosition = 0,
  onTimeUpdate,
  onError,
  onLevelsLoaded,
}: UseHlsPlayerOptions): UseHlsPlayerReturn {
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<HlsLevel[]>([]);
  const [currentLevel, setCurrentLevelState] = useState(-1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(startPosition);

  const { volume, muted, preferredLevel } = usePlayerStore();

  const setLevel = useCallback((level: number) => {
    setCurrentLevelState(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
    usePlayerStore.getState().setPreferredLevel(level);
  }, []);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    let destroyed = false;

    async function initHls() {
      const HlsModule = await import('hls.js');
      const Hls = HlsModule.default;

      if (destroyed) return;

      if (Hls.isSupported()) {
        const hls = new Hls({
          startPosition,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hlsRef.current = hls;

        hls.loadSource(src!);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          if (destroyed) return;

          const parsedLevels: HlsLevel[] = data.levels.map((l, idx) => ({
            height: l.height,
            bitrate: l.bitrate,
            name: l.height ? `${l.height}p` : `Level ${idx}`,
          }));

          setLevels(parsedLevels);
          onLevelsLoaded?.(parsedLevels);

          // Apply preferred quality level
          const savedLevel = usePlayerStore.getState().preferredLevel;
          if (savedLevel >= 0 && savedLevel < parsedLevels.length) {
            hls.currentLevel = savedLevel;
            setCurrentLevelState(savedLevel);
          } else {
            hls.currentLevel = -1; // Auto
            setCurrentLevelState(-1);
          }

          // Apply volume/mute
          video.volume = usePlayerStore.getState().volume;
          video.muted = usePlayerStore.getState().muted;

          video.play().catch(() => {
            // Autoplay blocked; user must click play
          });

          setIsReady(true);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          if (!destroyed) setCurrentLevelState(data.level);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (destroyed) return;
          if (data.fatal) {
            const msg = `HLS fatal error: ${data.type} - ${data.details}`;
            setError(msg);
            onError?.(msg);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        video.src = src!;
        video.addEventListener('loadedmetadata', () => {
          if (destroyed) return;
          video.currentTime = startPosition;
          video.volume = usePlayerStore.getState().volume;
          video.muted = usePlayerStore.getState().muted;
          video.play().catch(() => {});
          setIsReady(true);
        });
      } else {
        const msg = 'HLS is not supported in this browser';
        setError(msg);
        onError?.(msg);
      }
    }

    initHls();

    const handleTimeUpdate = () => {
      if (!videoRef.current) return;
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      onTimeUpdate?.(t);
    };

    const handleDurationChange = () => {
      if (!videoRef.current) return;
      setDuration(videoRef.current.duration || 0);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      destroyed = true;
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Sync volume/muted changes to video element
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = muted;
  }, [volume, muted, videoRef]);

  // Sync preferredLevel changes
  useEffect(() => {
    if (hlsRef.current && isReady) {
      hlsRef.current.currentLevel = preferredLevel;
      setCurrentLevelState(preferredLevel);
    }
  }, [preferredLevel, isReady]);

  return {
    isReady,
    error,
    levels,
    currentLevel,
    setLevel,
    duration,
    currentTime,
  };
}
