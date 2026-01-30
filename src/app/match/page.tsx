'use client';

/**
 * Match Result Page
 *
 * Route: /match
 * Purpose: Display the matched restaurant with actions.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui';
import { PhotoCarousel } from '@/components/common/PhotoCarousel';
import { Confetti } from '@/components/common/Confetti';
import { usePartyStore } from '@/stores';
import { openInMaps, downloadIcsFile, copyToClipboard, generateInviteLink } from '@/utils/helpers';

export default function MatchPage() {
  const router = useRouter();
  const { party, getMatchedRestaurant } = usePartyStore();
  const [showConfetti, setShowConfetti] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  const restaurant = getMatchedRestaurant();

  // Redirect if no match
  useEffect(() => {
    if (!party || !restaurant) {
      router.push('/');
    }
  }, [party, restaurant, router]);

  // Stop confetti after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenMaps = () => {
    if (restaurant) {
      openInMaps(restaurant.address, restaurant.lat, restaurant.lng);
    }
  };

  const handleCreateCalendarEvent = () => {
    if (restaurant && party?.dateTime) {
      downloadIcsFile(restaurant.name, restaurant.address, new Date(party.dateTime));
    } else if (restaurant) {
      // Use tomorrow at 7pm as default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(19, 0, 0, 0);
      downloadIcsFile(restaurant.name, restaurant.address, tomorrow);
    }
  };

  const handleShare = async () => {
    if (!party) return;

    const shareText = `We matched on ${restaurant?.name}! 🎉`;
    const shareUrl = generateInviteLink(party.inviteId);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Swipe to Dine Match!',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed, fall back to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    if (!party) return;
    const shareUrl = generateInviteLink(party.inviteId);
    const success = await copyToClipboard(
      `We matched on ${restaurant?.name}! 🎉\n${shareUrl}`
    );
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleStartOver = () => {
    router.push('/');
  };

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
      <Confetti isActive={showConfetti} />

      {/* Header */}
      <header className="p-4 flex items-center justify-center">
        <Logo variant="icon" size="sm" />
      </header>

      {/* Match celebration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="text-center px-4 mb-6"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-5xl mb-2"
        >
          🎉
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
          It's a Match!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Everyone agreed on this place
        </p>
      </motion.div>

      {/* Restaurant card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-md mx-auto px-4"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden">
          {/* Photos */}
          <div className="p-4">
            <PhotoCarousel photos={restaurant.photos} alt={restaurant.name} />
          </div>

          {/* Details */}
          <div className="px-6 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {restaurant.name}
            </h2>

            <div className="flex items-center gap-2 mb-3">
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

            {/* Cuisine tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisines.map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-2.5 py-1 text-xs font-medium bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full capitalize"
                >
                  {cuisine}
                </span>
              ))}
            </div>

            {/* Address */}
            <button
              onClick={handleOpenMaps}
              className="flex items-start gap-2 text-left group mb-4"
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

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {restaurant.description}
            </p>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button onClick={handleOpenMaps} fullWidth>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Open in Maps
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCreateCalendarEvent}
                  fullWidth
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Calendar
                </Button>

                <Button variant="secondary" onClick={handleShare} fullWidth>
                  {linkCopied ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-2 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Start over */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center py-8"
      >
        <button
          onClick={handleStartOver}
          className="text-gray-500 dark:text-gray-400 text-sm hover:text-rose-500 transition-colors"
        >
          Start a new session
        </button>
      </motion.div>
    </div>
  );
}
