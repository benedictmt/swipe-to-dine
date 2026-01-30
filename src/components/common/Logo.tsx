'use client';

/**
 * Swipe to Dine Logo component
 * Includes both icon and wordmark versions
 */

import { motion } from 'framer-motion';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const sizes = {
  sm: { icon: 32, text: 'text-lg' },
  md: { icon: 48, text: 'text-2xl' },
  lg: { icon: 64, text: 'text-3xl' },
};

export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  animate = false,
}: LogoProps) {
  const iconSize = sizes[size].icon;

  const IconSvg = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plate */}
      <circle
        cx="32"
        cy="32"
        r="28"
        className="fill-gray-100 dark:fill-gray-800"
        stroke="url(#plateGradient)"
        strokeWidth="3"
      />

      {/* Fork */}
      <motion.g
        initial={animate ? { x: -5, opacity: 0 } : undefined}
        animate={animate ? { x: 0, opacity: 1 } : undefined}
        transition={{ delay: 0.2 }}
      >
        <path
          d="M20 18V28M24 18V28M20 28C20 30 22 32 22 32L22 46M24 28C24 30 22 32 22 32"
          stroke="url(#forkGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* Knife */}
      <motion.g
        initial={animate ? { x: 5, opacity: 0 } : undefined}
        animate={animate ? { x: 0, opacity: 1 } : undefined}
        transition={{ delay: 0.3 }}
      >
        <path
          d="M42 18C42 18 46 22 46 28C46 32 44 32 44 32L44 46"
          stroke="url(#knifeGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* Heart in center */}
      <motion.path
        d="M32 40C32 40 24 34 24 29C24 26 26 24 29 24C30.5 24 32 25 32 25C32 25 33.5 24 35 24C38 24 40 26 40 29C40 34 32 40 32 40Z"
        className="fill-rose-500"
        initial={animate ? { scale: 0 } : undefined}
        animate={animate ? { scale: 1 } : undefined}
        transition={{ delay: 0.5, type: 'spring' }}
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="plateGradient" x1="4" y1="4" x2="60" y2="60">
          <stop stopColor="#f43f5e" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="forkGradient" x1="20" y1="18" x2="24" y2="46">
          <stop stopColor="#f43f5e" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="knifeGradient" x1="42" y1="18" x2="46" y2="46">
          <stop stopColor="#f43f5e" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={className}>
        <IconSvg />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <IconSvg />
      <div className="flex flex-col">
        <span
          className={`
            font-bold tracking-tight
            bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent
            ${sizes[size].text}
          `}
        >
          Swipe to Dine
        </span>
      </div>
    </div>
  );
}
