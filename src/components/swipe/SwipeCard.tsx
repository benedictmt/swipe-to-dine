'use client';

/**
 * Swipeable restaurant card with gesture support
 */

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Restaurant } from '@/types';
import { PhotoCarousel } from '@/components/common/PhotoCarousel';
import { openInMaps } from '@/utils/helpers';

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst?: boolean;
}

export function SwipeCard({
  restaurant,
  onSwipeLeft,
  onSwipeRight,
  isFirst = false,
}: SwipeCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Indicator opacities
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x < -threshold) {
      setExitDirection('left');
      onSwipeLeft();
    } else if (info.offset.x > threshold) {
      setExitDirection('right');
      onSwipeRight();
    }
  };

  const exitVariants = {
    left: { x: -500, opacity: 0, rotate: -20 },
    right: { x: 500, opacity: 0, rotate: 20 },
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? exitVariants[exitDirection] : {}}
      transition={exitDirection ? { duration: 0.3 } : undefined}
    >
      {/* Card content */}
      <div className="h-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="h-full flex flex-col">
          {/* Restaurant name header */}
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {restaurant.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {restaurant.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                {restaurant.priceLevel}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                {restaurant.distanceMiles.toFixed(1)} mi
              </span>
            </div>
          </div>

          {/* Photo carousel */}
          <div className="px-5">
            <PhotoCarousel photos={restaurant.photos} alt={restaurant.name} />
          </div>

          {/* Details */}
          <div className="flex-1 px-5 py-4 overflow-y-auto">
            {/* Address (clickable) */}
            <button
              onClick={() => openInMaps(restaurant.address, restaurant.lat, restaurant.lng)}
              className="flex items-start gap-2 text-left group"
            >
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-rose-500 transition-colors">
                {restaurant.address}
              </span>
            </button>

            {/* Cuisine tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {restaurant.cuisines.map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-2.5 py-1 text-xs font-medium bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full capitalize"
                >
                  {cuisine}
                </span>
              ))}
              {restaurant.familyFriendly && (
                <span className="px-2.5 py-1 text-xs font-medium bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full">
                  Family Friendly
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      {/* Swipe indicators */}
      <motion.div
        className="absolute top-8 left-8 px-4 py-2 bg-red-500 text-white font-bold rounded-lg rotate-[-15deg] border-4 border-red-600"
        style={{ opacity: leftIndicatorOpacity }}
      >
        NO WAY
      </motion.div>
      <motion.div
        className="absolute top-8 right-8 px-4 py-2 bg-green-500 text-white font-bold rounded-lg rotate-[15deg] border-4 border-green-600"
        style={{ opacity: rightIndicatorOpacity }}
      >
        MAYBE
      </motion.div>

      {/* First card reveal effect */}
      {isFirst && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-3xl" />
        </motion.div>
      )}
    </motion.div>
  );
}
