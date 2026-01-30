'use client';

/**
 * Vote buttons for accessibility (alternative to swiping)
 */

import { motion } from 'framer-motion';

interface VoteButtonsProps {
  onNo: () => void;
  onMaybe: () => void;
  disabled?: boolean;
}

export function VoteButtons({ onNo, onMaybe, disabled = false }: VoteButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* No Way button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onNo}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-4 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.button>

      {/* Maybe button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onMaybe}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-4 border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.button>
    </div>
  );
}
