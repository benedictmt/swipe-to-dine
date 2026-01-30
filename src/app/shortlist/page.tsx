'use client';

/**
 * Shortlist Page
 *
 * Route: /shortlist
 * Purpose: View and select from restaurants you've swiped "Maybe" on.
 * Only available for single-diner sessions.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui';
import { Confetti } from '@/components/common/Confetti';
import { usePartyStore, useProfileStore } from '@/stores';
import { Restaurant, CUISINE_LABELS } from '@/types';

export default function ShortlistPage() {
  const router = useRouter();
  const { party, getRestaurantsWithMaybeVotes, setMatch } = usePartyStore();
  const { getProfile } = useProfileStore();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const maybeRestaurants = getRestaurantsWithMaybeVotes();
  const profile = party?.selectedDiners[0]
    ? getProfile(party.selectedDiners[0].profileId)
    : null;

  // Redirect if no party or not single diner
  useEffect(() => {
    if (!party || party.selectedDiners.length !== 1) {
      router.push('/');
    }
  }, [party, router]);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleConfirmChoice = () => {
    if (selectedRestaurant) {
      setMatch(selectedRestaurant.id);
      setShowConfetti(true);
      setTimeout(() => {
        router.push('/match');
      }, 1500);
    }
  };

  const handleContinueSwiping = () => {
    router.push('/swipe');
  };

  if (!party) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <Confetti isActive={showConfetti} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/swipe')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <Logo variant="icon" size="sm" />
          <div className="w-9" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto px-4 py-6 pb-32 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your Shortlist
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {profile?.name ? `${profile.name}'s` : 'Your'} top picks ({maybeRestaurants.length})
            </p>
          </div>

          {maybeRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No restaurants yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Swipe right on restaurants you'd consider to build your shortlist.
              </p>
              <Button onClick={handleContinueSwiping}>Continue Swiping</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {maybeRestaurants.map((restaurant, index) => (
                  <motion.button
                    key={restaurant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectRestaurant(restaurant)}
                    className={`w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm transition-all ${
                      selectedRestaurant?.id === restaurant.id
                        ? 'ring-2 ring-rose-500 scale-[1.02]'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-4 p-3">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={restaurant.photos[0]}
                          alt={restaurant.name}
                          fill
                          className="object-cover"
                        />
                        {selectedRestaurant?.id === restaurant.id && (
                          <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-white drop-shadow-lg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {CUISINE_LABELS[restaurant.cuisines[0]]} • {restaurant.priceLevel}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-amber-500">
                            {restaurant.rating} ★
                          </span>
                          <span className="text-xs text-gray-400">
                            • {restaurant.distanceMiles} mi
                          </span>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedRestaurant?.id === restaurant.id
                              ? 'bg-rose-500 border-rose-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {selectedRestaurant?.id === restaurant.id && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Fixed CTA */}
      {maybeRestaurants.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-bottom">
          <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
            <Button
              onClick={handleConfirmChoice}
              fullWidth
              size="lg"
              disabled={!selectedRestaurant}
            >
              {selectedRestaurant
                ? `Choose ${selectedRestaurant.name}`
                : 'Select a restaurant'}
            </Button>
            <Button
              onClick={handleContinueSwiping}
              variant="secondary"
              fullWidth
            >
              Keep Swiping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
