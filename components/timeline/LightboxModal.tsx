'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import EmojiIcon from '@/components/ui/EmojiIcon';

export interface LightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  altText?: string;
  onClose: () => void;
}

export default function LightboxModal({
  isOpen,
  images,
  initialIndex = 0,
  altText = 'Stop Photo',
  onClose,
}: LightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const deltaX = touchEndXRef.current - touchStartXRef.current;
    const minSwipeDistance = 40;

    if (deltaX < -minSwipeDistance) {
      // Swiped left -> Next photo
      handleNext();
    } else if (deltaX > minSwipeDistance) {
      // Swiped right -> Previous photo
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      data-testid="lightbox-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox Modal"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between items-center select-none backdrop-blur-md"
    >
      {/* Backdrop trigger for clicking outside image */}
      <div
        data-testid="lightbox-backdrop"
        onClick={onClose}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* Top Bar: Counter & Close Button */}
      <div className="relative z-10 w-full flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div
          data-testid="lightbox-counter"
          className="text-sm font-semibold text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20"
        >
          {currentIndex + 1}/{images.length}
        </div>

        <button
          type="button"
          data-testid="lightbox-close"
          onClick={onClose}
          aria-label="Close photo modal"
          className="w-10 h-10 rounded-full bg-white/10 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
        >
          <EmojiIcon name="close" className="text-xl font-bold leading-none" />
        </button>
      </div>

      {/* Center Image Container with Touch Swipe Events */}
      <div
        data-testid="lightbox-swipe-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 flex-1 w-full max-w-4xl flex items-center justify-center p-2 sm:p-6"
      >
        <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-xl">
          <Image
            key={currentImage}
            src={currentImage}
            alt={`${altText} - photo ${currentIndex + 1}`}
            fill
            data-testid="lightbox-image"
            className="object-contain transition-opacity duration-200"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>

        {/* Prev Button */}
        {images.length > 1 && (
          <button
            type="button"
            data-testid="lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-all active:scale-95 z-20"
          >
            ‹
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            data-testid="lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-all active:scale-95 z-20"
          >
            ›
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Dots Indicator (Optional visual Polish) */}
      {images.length > 1 && (
        <div className="relative z-10 pb-6 pt-2 flex items-center gap-1.5">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to photo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
