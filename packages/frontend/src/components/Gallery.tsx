import { useQuery } from "@tanstack/react-query";
import { listImages, getImageUrl, type ImageInfo } from "../api/client";

export function Gallery() {
  const { data: images, isLoading, error, refetch } = useQuery({
    queryKey: ["images"],
    queryFn: listImages,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-zinc-400">Loading images...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        Error loading images: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
        <div className="text-lg mb-2">No images yet</div>
        <div className="text-sm">
          Create a workflow and click Execute to generate images
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-zinc-900 min-h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Gallery ({images.length} image{images.length !== 1 ? "s" : ""})
        </h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
}

function ImageCard({ image }: { image: ImageInfo }) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <a
        href={getImageUrl(image.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-square bg-gray-100 dark:bg-zinc-900"
      >
        <img
          src={getImageUrl(image.id)}
          alt={image.filename}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </a>
      <div className="p-3">
        <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
          {image.filename}
        </div>
        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          {image.mime} • {formatSize(image.size)}
        </div>
        <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
          {formatDate(image.createdAt)}
        </div>
      </div>
    </div>
  );
}
