import { useQuery } from '@tanstack/react-query';
import { getVideo } from '../api/videos';

export function videoDetailQueryKey(id: number) {
  return ['videos', id] as const;
}

export function useVideoDetail(id: number) {
  return useQuery({
    queryKey: videoDetailQueryKey(id),
    queryFn: () => getVideo(id),
    staleTime: 5 * 60 * 1000,
    enabled: id > 0,
  });
}
