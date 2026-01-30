'use client';

/**
 * Photo carousel with tap/button navigation
 */

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoCarouselProps {
  photos: string[];
  alt: string;
  className?: string;
}

export function PhotoCarousel({ photos, alt, className = '' }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    if (isLeftHalf) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  if (photos.length === 0) {
    return (
      <div
        className={`relative w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400">No photos</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Image container */}
      <div
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
        onClick={handleTap}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={photos[currentIndex]}
              alt={`${alt} - Photo ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Tap zones indicator (subtle) */}
        {photos.length > 1 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-2">
              <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-2">
              <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${
                  index === currentIndex
                    ? 'bg-rose-500 w-4'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}
