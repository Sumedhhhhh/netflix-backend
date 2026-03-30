import apiClient from './client';
import type { ContinueWatchingItem } from './types';

export async function getContinueWatching(): Promise<ContinueWatchingItem[]> {
  return apiClient.get('me/continue-watching').json<ContinueWatchingItem[]>();
}
