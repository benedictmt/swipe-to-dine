'use client';

/**
 * Segmented Control (pill toggle) component
 */

import { motion } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: SegmentedControlProps) {
  const selectedIndex = options.findIndex((o) => o.value === value);

  const sizeStyles = {
    sm: 'p-1 text-xs',
    md: 'p-1 text-sm',
  };

  const buttonSizeStyles = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
  };

  return (
    <div
      className={`
        relative inline-flex rounded-lg bg-gray-100 dark:bg-gray-800
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {/* Sliding background */}
      <motion.div
        className="absolute inset-y-1 bg-white dark:bg-gray-700 rounded-md shadow"
        initial={false}
        animate={{
          x: `${selectedIndex * 100}%`,
          width: `${100 / options.length}%`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />

      {/* Options */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative z-10 font-medium rounded-md
            transition-colors duration-200
            ${buttonSizeStyles[size]}
            ${
              option.value === value
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
