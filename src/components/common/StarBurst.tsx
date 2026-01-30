'use client';

/**
 * Star burst animation for card reveal
 */

import { motion } from 'framer-motion';

interface StarBurstProps {
  isActive: boolean;
}

export function StarBurst({ isActive }: StarBurstProps) {
  if (!isActive) return null;

  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * (Math.PI / 180),
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {/* Radial gradient flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.5, 2] }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-rose-500/20 to-transparent"
      />

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `calc(50% + ${Math.cos(star.angle) * 150}px)`,
            y: `calc(50% + ${Math.sin(star.angle) * 150}px)`,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.6,
            delay: star.id * 0.02,
            ease: 'easeOut',
          }}
          className="absolute"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L14.09 8.26L20.18 9.27L15.54 13.14L16.82 19.02L12 16.27L7.18 19.02L8.46 13.14L3.82 9.27L9.91 8.26L12 2Z"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1"
            />
          </svg>
        </motion.div>
      ))}

      {/* Sparkles */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `calc(50% + ${(Math.random() - 0.5) * 300}px)`,
            y: `calc(50% + ${(Math.random() - 0.5) * 300}px)`,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: Math.random() * 0.3,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
