import apiClient from './client';
import type { VideoRaw, Video, VideoCreate } from './types';

export function normalizeVideo(raw: VideoRaw): Video {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    releaseYear: raw.release_year,
    durationSeconds: raw.duration_S, // capital S from backend
    thumbnailUrl: raw.thumbnail_url,
    storagePrefix: raw.storage_prefix,
  };
}

export async function getVideos(): Promise<Video[]> {
  const raws = await apiClient.get('videos').json<VideoRaw[]>();
  return raws.map(normalizeVideo);
}

export async function getVideo(id: number): Promise<Video> {
  const raw = await apiClient.get(`videos/${id}`).json<VideoRaw>();
  return normalizeVideo(raw);
}

export async function createVideo(data: VideoCreate): Promise<Video> {
  const raw = await apiClient.post('admin/videos', { json: data }).json<VideoRaw>();
  return normalizeVideo(raw);
}

export async function uploadVideo(
  file: File,
  title: string,
  description?: string,
  releaseYear?: number,
  durationS?: number,
  thumbnailUrl?: string,
): Promise<Video> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  if (description) formData.append('description', description);
  if (releaseYear) formData.append('release_year', String(releaseYear));
  if (durationS) formData.append('duration_s', String(durationS));
  if (thumbnailUrl) formData.append('thumbnail_url', thumbnailUrl);

  const raw = await apiClient.post('upload/upload', { body: formData }).json<VideoRaw>();
  return normalizeVideo(raw);
}
