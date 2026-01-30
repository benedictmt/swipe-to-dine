'use client';

/**
 * Toggle switch component
 */

import { motion } from 'framer-motion';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: ToggleProps) {
  return (
    <label
      className={`
        flex items-center gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`
          relative w-12 h-7 rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
          ${value ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'}
        `}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
          animate={{ left: value ? '24px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </label>
  );
}
