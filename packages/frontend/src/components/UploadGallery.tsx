import { useState, useEffect } from "react";
import { listUploads, deleteUpload, getUploadBlobUrl, type UploadInfo } from "../api/client";

interface UploadGalleryProps {
  onSelect?: (upload: UploadInfo) => void;
}

export function UploadGallery({ onSelect }: UploadGalleryProps) {
  const [uploads, setUploads] = useState<UploadInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const data = await listUploads();
      setUploads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this upload?")) return;

    try {
      await deleteUpload(id);
      setUploads((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading uploads...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <button
          onClick={fetchUploads}
          className="ml-2 text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No uploads yet. Drag an image onto an Input node to upload.
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-2">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="relative group rounded border border-gray-200 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
            onClick={() => onSelect?.(upload)}
          >
            <img
              src={getUploadBlobUrl(upload.id)}
              alt={upload.filename}
              className="w-full h-20 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => handleDelete(upload.id, e)}
                className="p-1 bg-red-500 rounded text-white text-xs hover:bg-red-600"
              >
                Delete
              </button>
            </div>
            <div className="p-1 text-xs truncate bg-white">
              {upload.filename}
            </div>
            <div className="px-1 pb-1 text-xs text-gray-400">
              {formatSize(upload.size)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
