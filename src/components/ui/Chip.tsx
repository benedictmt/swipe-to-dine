'use client';

/**
 * Chip component for selectable tags/filters
 */

import { motion } from 'framer-motion';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
}: ChipProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-full font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${
          selected
            ? 'bg-rose-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }
        ${className}
      `}
    >
      {label}
    </motion.button>
  );
}
