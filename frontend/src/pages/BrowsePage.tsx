import { useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroBanner } from '../components/browse/HeroBanner';
import { VideoRow } from '../components/browse/VideoRow';
import { useVideoList } from '../hooks/useVideoList';
import { useContinueWatching } from '../hooks/useContinueWatching';
import type { ContinueWatchingItem, Video } from '../api/types';

export function BrowsePage() {
  const { data: videos = [], isLoading: videosLoading } = useVideoList();
  const { data: continueWatchingList = [] } = useContinueWatching();

  // Build a map of video_id -> ContinueWatchingItem for quick lookup
  const continueWatchingMap = useMemo(() => {
    const map = new Map<number, ContinueWatchingItem>();
    continueWatchingList.forEach((item) => {
      map.set(item.video_id, item);
    });
    return map;
  }, [continueWatchingList]);

  // Hero: use first video
  const heroVideo = videos[0] ?? null;

  // Continue watching: build Video objects from ContinueWatchingItem
  const continueWatchingVideos = useMemo((): Video[] => {
    return continueWatchingList
      .map((item) => {
        // Find the full Video object from the catalog
        const fullVideo = videos.find((v) => v.id === item.video_id);
        if (fullVideo) return fullVideo;
        // Fallback: construct minimal Video from ContinueWatchingItem
        return {
          id: item.video_id,
          title: item.title,
          description: null,
          releaseYear: null,
          durationSeconds: item.duration_s,
          thumbnailUrl: item.thumbnail_url,
          storagePrefix: null,
        } satisfies Video;
      });
  }, [continueWatchingList, videos]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar transparent />

      {/* Hero Banner */}
      <HeroBanner
        video={heroVideo}
        isLoading={videosLoading}
      />

      {/* Content rows — sit over the hero fade */}
      <div className="relative -mt-16 md:-mt-24 z-10">
        {/* Continue Watching row */}
        {continueWatchingVideos.length > 0 && (
          <VideoRow
            title="Continue Watching"
            videos={continueWatchingVideos}
            continueWatchingMap={continueWatchingMap}
          />
        )}

        {/* All Videos */}
        <VideoRow
          title="Popular on Netflix"
          videos={videos}
          isLoading={videosLoading}
          continueWatchingMap={continueWatchingMap}
        />

        {/* Trending Now — show a different slice */}
        {videos.length > 4 && (
          <VideoRow
            title="Trending Now"
            videos={[...videos].reverse()}
            continueWatchingMap={continueWatchingMap}
          />
        )}

        {/* New Releases — sort by release year desc */}
        {videos.length > 0 && (
          <VideoRow
            title="New Releases"
            videos={[...videos].sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0))}
            continueWatchingMap={continueWatchingMap}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 md:px-12 py-12 mt-8">
        <div className="text-netflix-gray-mid text-sm space-y-4">
          <p className="hover:underline cursor-pointer">Questions? Call 000-800-919-1743</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              'FAQ',
              'Investor Relations',
              'Privacy',
              'Speed Test',
              'Help Center',
              'Jobs',
              'Cookie Preferences',
              'Legal Notices',
              'Account',
              'Ways to Watch',
              'Corporate Information',
              'Only on Netflix',
              'Media Center',
              'Terms of Use',
              'Contact Us',
            ].map((item) => (
              <a key={item} href="#" className="hover:underline">
                {item}
              </a>
            ))}
          </div>
          <p className="text-xs">Netflix Clone</p>
        </div>
      </footer>
    </div>
  );
}
