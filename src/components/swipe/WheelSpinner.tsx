'use client';

/**
 * Wheel spinner for "Let Fate Decide" feature
 */

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Restaurant } from '@/types';

interface WheelSpinnerProps {
  restaurants: Restaurant[];
  onComplete: (restaurant: Restaurant) => void;
}

export function WheelSpinner({ restaurants, onComplete }: WheelSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const controls = useAnimation();

  // Calculate segment size
  const segmentAngle = 360 / restaurants.length;

  // Generate colors for segments
  const colors = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
    '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9',
    '#14b8a6', '#10b981', '#22c55e', '#84cc16',
  ];

  const spin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);

    // Random index
    const randomIndex = Math.floor(Math.random() * restaurants.length);
    const selectedRestaurant = restaurants[randomIndex];

    // Calculate rotation (multiple full spins + landing position)
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalAngle = spins * 360 + (randomIndex * segmentAngle) + segmentAngle / 2;

    await controls.start({
      rotate: finalAngle,
      transition: {
        duration: 4,
        ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for natural deceleration
      },
    });

    setSelectedRestaurant(selectedRestaurant);
    setIsSpinning(false);

    // Delay before calling onComplete for dramatic effect
    setTimeout(() => {
      onComplete(selectedRestaurant);
    }, 1000);
  };

  useEffect(() => {
    // Auto-start spin
    const timer = setTimeout(spin, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      {/* Wheel */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-rose-500 drop-shadow-lg" />
        </div>

        {/* Wheel container */}
        <motion.div
          animate={controls}
          className="relative w-72 h-72 rounded-full shadow-2xl"
          style={{ transformOrigin: 'center center' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {restaurants.map((restaurant, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = startAngle + segmentAngle;

              // Convert to radians
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);

              // Calculate arc points
              const x1 = 50 + 48 * Math.cos(startRad);
              const y1 = 50 + 48 * Math.sin(startRad);
              const x2 = 50 + 48 * Math.cos(endRad);
              const y2 = 50 + 48 * Math.sin(endRad);

              // Large arc flag
              const largeArc = segmentAngle > 180 ? 1 : 0;

              // Path
              const path = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`;

              // Text position (middle of segment)
              const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
              const textX = 50 + 30 * Math.cos(midAngle);
              const textY = 50 + 30 * Math.sin(midAngle);
              const textRotation = (startAngle + endAngle) / 2;

              return (
                <g key={restaurant.id}>
                  <path
                    d={path}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="3"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    className="select-none"
                  >
                    {restaurant.name.length > 12
                      ? restaurant.name.substring(0, 12) + '...'
                      : restaurant.name}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx="50" cy="50" r="8" fill="white" />
            <circle cx="50" cy="50" r="6" fill="#f43f5e" />
          </svg>
        </motion.div>
      </div>

      {/* Status text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        {isSpinning ? (
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Spinning the wheel of fate...
          </p>
        ) : selectedRestaurant ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Fate has chosen...
            </p>
            <p className="text-2xl font-bold text-rose-500">
              {selectedRestaurant.name}
            </p>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
