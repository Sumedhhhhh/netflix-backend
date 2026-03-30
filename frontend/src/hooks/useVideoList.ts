import { useQuery } from '@tanstack/react-query';
import { getVideos } from '../api/videos';

export const VIDEO_LIST_QUERY_KEY = ['videos'] as const;

export function useVideoList() {
  return useQuery({
    queryKey: VIDEO_LIST_QUERY_KEY,
    queryFn: getVideos,
    staleTime: 5 * 60 * 1000,
  });
}
