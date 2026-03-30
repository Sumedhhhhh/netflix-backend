import apiClient from './client';
import type { ProgressRequest, ProgressResponse } from './types';

export async function reportProgress(data: ProgressRequest): Promise<ProgressResponse> {
  return apiClient.post('progress', { json: data }).json<ProgressResponse>();
}
