'use client';

import React from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  onClose: () => void;
}

export default function ImagePreviewModal({
  isOpen,
  imageUrl,
  title,
  onClose,
}: ImagePreviewModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 cursor-zoom-out" onClick={onClose} />

      <div className="relative max-w-xl max-h-[90vh] flex flex-col items-center z-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl font-bold leading-none cursor-pointer p-1"
          aria-label="Tutup pratinjau foto"
        >
          &times;
        </button>

        <img
          src={imageUrl}
          alt={title}
          className="max-h-[80vh] w-auto h-auto rounded-lg shadow-2xl object-contain border-2 border-white/20"
        />

        <p className="text-white/90 font-serif font-semibold text-sm sm:text-base mt-3 text-center px-4">
          {title}
        </p>
      </div>
    </div>
  );
}
