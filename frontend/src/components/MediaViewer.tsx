'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { getFileUrl } from '@/lib/api';

interface MediaViewerProps {
  src?: string | null;
  alt?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | string | null;
  thumbnailUrl?: string | null;
  className?: string;
  autoPlay?: boolean;
}

export const isVideoMedia = (src?: string | null, mediaType?: string | null): boolean => {
  if (!src) return false;
  if (mediaType && mediaType.toUpperCase() === 'VIDEO') return true;
  if (/\.(mp4|mov|webm|avi|m4v|3gp|mkv)($|\?)/i.test(src)) return true;
  if (src.includes('/video/upload/')) return true;
  if (src.startsWith('data:video/')) return true;
  return false;
};

export default function MediaViewer({
  src,
  alt = 'Road Distress Evidence',
  mediaType,
  thumbnailUrl,
  className = 'w-full h-full object-cover',
  autoPlay = false,
}: MediaViewerProps) {
  if (!src) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium">
        No visual evidence attached
      </div>
    );
  }

  const isVideo = isVideoMedia(src, mediaType);
  const resolvedSrc = getFileUrl(src);
  const resolvedPoster = thumbnailUrl ? getFileUrl(thumbnailUrl) : undefined;

  if (isVideo) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center group overflow-hidden">
        <video
          src={resolvedSrc}
          poster={resolvedPoster}
          controls
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          className={className}
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 pointer-events-none shadow">
          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
          <span>ROAD VIDEO</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
