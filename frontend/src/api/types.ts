// Raw types from backend (snake_case, backend quirks preserved)
export interface VideoRaw {
  id: number;
  title: string;
  description: string | null;
  release_year: number | null;
  duration_S: number | null; // capital S - backend quirk
  thumbnail_url: string | null;
  storage_prefix: string | null;
}

// Normalized UI type (camelCase)
export interface Video {
  id: number;
  title: string;
  description: string | null;
  releaseYear: number | null;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  storagePrefix: string | null;
}

export interface ContinueWatchingItem {
  video_id: number;
  title: string;
  thumbnail_url: string | null;
  duration_s: number | null;
  position_s: number;
  updated_at: string;
}

export interface VideoCreate {
  title: string;
  description?: string;
  release_year?: number;
  duration_s?: number;
  thumbnail_url?: string;
  storage_prefix?: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface ProgressRequest {
  video_id: number;
  position_s: number;
}

export interface ProgressResponse {
  status: string;
  position_s?: number;
  current_position_s?: number;
}

// Decoded JWT payload
export interface JwtPayload {
  sub: string; // user_id as string
  exp: number; // unix timestamp
}
