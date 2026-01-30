'use client';

/**
 * Instructions Page
 *
 * Route: /instructions
 * Purpose: Explain swipe mechanics before starting.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { Logo } from '@/components/common/Logo';
import { usePartyStore } from '@/stores';

export default function InstructionsPage() {
  const router = useRouter();
  const { party } = usePartyStore();
  const [hasCustomLogo, setHasCustomLogo] = useState(true);

  // Redirect if no party
  useEffect(() => {
    if (!party || party.selectedDiners.length === 0) {
      router.push('/');
    }
  }, [party, router]);

  const handleContinue = () => {
    router.push('/swipe');
  };

  // Handle tap anywhere to continue
  const handleInteraction = () => {
    handleContinue();
  };

  // Handle swipe gesture to continue
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipeThreshold = 50;
    // Swipe in either direction advances
    if (Math.abs(info.offset.x) > swipeThreshold) {
      handleContinue();
    }
  };

  if (!party) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8 cursor-pointer touch-pan-y"
      onClick={handleInteraction}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        {hasCustomLogo ? (
          <div className="relative w-40 h-40">
            <Image
              src="/logo.png"
              alt="Swipe to Dine"
              fill
              className="object-contain drop-shadow-lg"
              onError={() => setHasCustomLogo(false)}
              priority
            />
          </div>
        ) : (
          <Logo size="lg" animate />
        )}
      </motion.div>

      {/* Swipe arrows */}
      <div className="flex items-center justify-center gap-16 mb-12">
        {/* Left arrow */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="animate-bounce-left">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="28" className="fill-red-100 dark:fill-red-950" />
              <path
                d="M38 44L26 32L38 20"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-red-500 font-bold text-lg">No Way</span>
        </motion.div>

        {/* Right arrow */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="animate-bounce-right">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="28" className="fill-green-100 dark:fill-green-950" />
              <path
                d="M26 20L38 32L26 44"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-green-500 font-bold text-lg">Maybe</span>
        </motion.div>
      </div>

      {/* Instructions text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center max-w-sm"
      >
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
          Swipe <span className="text-green-500 font-semibold">right</span> on
          restaurants you'd consider.
          <br />
          Swipe <span className="text-red-500 font-semibold">left</span> to pass.
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-base">
          When everyone swipes right on the same place, it's a{' '}
          <span className="text-rose-500 font-bold">Match!</span>
        </p>
      </motion.div>

      {/* Continue hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 animate-pulse"
      >
        <p className="text-gray-400 dark:text-gray-600 text-sm">
          Tap or swipe to continue
        </p>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-rose-200/30 dark:bg-rose-800/20 rounded-full blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-32 right-10 w-32 h-32 bg-pink-200/30 dark:bg-pink-800/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
    </motion.div>
  );
}
