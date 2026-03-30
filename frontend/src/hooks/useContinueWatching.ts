import { useQuery } from '@tanstack/react-query';
import { getContinueWatching } from '../api/continueWatching';

export const CONTINUE_WATCHING_QUERY_KEY = ['continue-watching'] as const;

export function useContinueWatching() {
  return useQuery({
    queryKey: CONTINUE_WATCHING_QUERY_KEY,
    queryFn: getContinueWatching,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
}
