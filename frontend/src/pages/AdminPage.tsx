import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { uploadVideo } from '../api/videos';
import { VIDEO_LIST_QUERY_KEY } from '../hooks/useVideoList';

interface FormState {
  title: string;
  description: string;
  release_year: string;
  duration_s: string;
  thumbnail_url: string;
}

const initialForm: FormState = {
  title: '',
  description: '',
  release_year: '',
  duration_s: '',
  thumbnail_url: '',
};

export function AdminPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<FormState & { file: string }>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const mutation = useMutation({
    mutationFn: () => uploadVideo(
      selectedFile!,
      form.title.trim(),
      form.description.trim() || undefined,
      form.release_year ? parseInt(form.release_year, 10) : undefined,
      form.duration_s ? parseInt(form.duration_s, 10) : undefined,
      form.thumbnail_url.trim() || undefined,
    ),
    onSuccess: (video) => {
      setSuccessMessage(`"${video.title}" uploaded — transcoding queued!`);
      setForm(initialForm);
      setSelectedFile(null);
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: VIDEO_LIST_QUERY_KEY });
      setTimeout(() => setSuccessMessage(''), 6000);
    },
  });

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState & { file: string }> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!selectedFile) newErrors.file = 'Video file is required';
    if (form.release_year && isNaN(parseInt(form.release_year, 10)))
      newErrors.release_year = 'Must be a valid year';
    if (form.duration_s && isNaN(parseInt(form.duration_s, 10)))
      newErrors.duration_s = 'Must be a valid number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSuccessMessage('');
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />

      <div className="pt-24 px-4 md:px-12 pb-16 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Upload size={28} className="text-netflix-red" />
            <h1 className="text-white text-3xl font-bold">Upload Video</h1>
          </div>
          <p className="text-netflix-gray-mid text-sm">
            Fill in the video details and select a file. Fields marked * are required.
          </p>
        </div>

        {successMessage && (
          <div className="flex items-center gap-3 bg-green-900/30 border border-green-600/50 rounded px-4 py-3 mb-6 animate-fadeIn">
            <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">{successMessage}</p>
          </div>
        )}

        {mutation.isError && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-netflix-red/50 rounded px-4 py-3 mb-6 animate-fadeIn">
            <AlertCircle size={18} className="text-netflix-red flex-shrink-0" />
            <p className="text-red-300 text-sm">
              {(mutation.error as Error)?.message || 'Upload failed. Please try again.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-netflix-bg-secondary rounded-lg p-6 space-y-5 border border-netflix-gray-dark/30">
            <h2 className="text-white font-semibold text-lg border-b border-netflix-gray-dark pb-3">
              Basic Info
            </h2>

            <Input
              label="Title *"
              type="text"
              value={form.title}
              onChange={handleChange('title')}
              error={errors.title}
              placeholder="e.g. The Dark Knight"
              disabled={mutation.isPending}
            />

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-netflix-gray-light">Description</label>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Brief description of the video..."
                disabled={mutation.isPending}
                rows={4}
                className="
                  bg-netflix-bg-elevated border border-netflix-gray-dark
                  text-white placeholder-netflix-gray-mid
                  rounded px-4 py-3 w-full
                  focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent
                  transition-all duration-200 resize-vertical disabled:opacity-50
                "
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-netflix-bg-secondary rounded-lg p-6 space-y-5 border border-netflix-gray-dark/30">
            <h2 className="text-white font-semibold text-lg border-b border-netflix-gray-dark pb-3">
              Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Release Year"
                type="number"
                value={form.release_year}
                onChange={handleChange('release_year')}
                error={errors.release_year}
                placeholder="e.g. 2024"
                min={1888}
                max={2100}
                disabled={mutation.isPending}
              />
              <Input
                label="Duration (seconds)"
                type="number"
                value={form.duration_s}
                onChange={handleChange('duration_s')}
                error={errors.duration_s}
                placeholder="e.g. 7200"
                min={0}
                disabled={mutation.isPending}
              />
            </div>
          </div>

          {/* Media */}
          <div className="bg-netflix-bg-secondary rounded-lg p-6 space-y-5 border border-netflix-gray-dark/30">
            <h2 className="text-white font-semibold text-lg border-b border-netflix-gray-dark pb-3">
              Media
            </h2>

            <Input
              label="Thumbnail URL"
              type="url"
              value={form.thumbnail_url}
              onChange={handleChange('thumbnail_url')}
              error={errors.thumbnail_url}
              placeholder="https://example.com/thumbnail.jpg"
              disabled={mutation.isPending}
            />

            {form.thumbnail_url && (
              <div className="mt-2">
                <p className="text-netflix-gray-mid text-xs mb-2">Preview:</p>
                <img
                  src={form.thumbnail_url}
                  alt="Thumbnail preview"
                  className="w-48 aspect-video object-cover rounded border border-netflix-gray-dark"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-netflix-gray-light">Video File *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                disabled={mutation.isPending}
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] ?? null);
                  setErrors((prev) => ({ ...prev, file: undefined }));
                }}
                className="
                  text-sm text-netflix-gray-light
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:bg-netflix-red file:text-white file:cursor-pointer
                  file:hover:bg-red-700 file:transition-colors
                  disabled:opacity-50
                "
              />
              {selectedFile && (
                <p className="text-netflix-gray-mid text-xs mt-1">
                  {selectedFile.name} — {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
              {errors.file && (
                <p className="text-netflix-red text-xs mt-1">{errors.file}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={mutation.isPending}
            className="text-base"
          >
            <Upload size={20} />
            Upload & Queue Transcode
          </Button>
        </form>
      </div>
    </div>
  );
}
