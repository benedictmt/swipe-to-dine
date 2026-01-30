'use client';

/**
 * Shortlist Page
 *
 * Route: /shortlist
 * Purpose: View and select from restaurants on the shortlist.
 * - Single diner: Shows restaurants with "maybe" votes
 * - Multi-diner: Shows restaurants with unanimous "maybe" votes
 * - Elimination mode: Users take turns eliminating until one remains
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui';
import { Confetti } from '@/components/common/Confetti';
import { WheelSpinner } from '@/components/swipe/WheelSpinner';
import { usePartyStore, useProfileStore } from '@/stores';
import { Restaurant, CUISINE_LABELS, Profile } from '@/types';

type ShortlistPhase = 'view' | 'elimination' | 'spinWheel' | 'winner';

export default function ShortlistPage() {
  const router = useRouter();
  const { party, getRestaurantsWithMaybeVotes, getRestaurantsWithUnanimousMaybes, setMatch, getInPersonDiners } = usePartyStore();
  const { getProfile } = useProfileStore();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [phase, setPhase] = useState<ShortlistPhase>('view');

  // Elimination mode state
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());
  const [currentEliminatorIndex, setCurrentEliminatorIndex] = useState(0);

  // Determine if multi-diner mode
  const isSingleDiner = party?.selectedDiners.length === 1;
  const inPersonDiners = getInPersonDiners();
  const isMultiDinerInPerson = !isSingleDiner && inPersonDiners.length > 1;

  // Get appropriate restaurants based on mode
  const maybeRestaurants = isMultiDinerInPerson
    ? getRestaurantsWithUnanimousMaybes()
    : getRestaurantsWithMaybeVotes();

  // Filter out eliminated restaurants
  const activeRestaurants = maybeRestaurants.filter(r => !eliminatedIds.has(r.id));

  // Get profiles for elimination turns
  const eliminatorProfiles: Profile[] = isMultiDinerInPerson
    ? inPersonDiners.map(d => getProfile(d.profileId)).filter(Boolean) as Profile[]
    : party?.selectedDiners.map(d => getProfile(d.profileId)).filter(Boolean) as Profile[] || [];

  const currentEliminator = eliminatorProfiles[currentEliminatorIndex % eliminatorProfiles.length];

  const profile = party?.selectedDiners[0]
    ? getProfile(party.selectedDiners[0].profileId)
    : null;

  // Redirect if no party
  useEffect(() => {
    if (!party) {
      router.push('/');
    }
  }, [party, router]);

  // Check if we have a winner (only 1 restaurant left in elimination mode)
  useEffect(() => {
    if (phase === 'elimination' && activeRestaurants.length === 1) {
      // We have a winner!
      setSelectedRestaurant(activeRestaurants[0]);
      setMatch(activeRestaurants[0].id);
      setShowConfetti(true);
      setPhase('winner');
      setTimeout(() => {
        router.push('/match');
      }, 2000);
    }
  }, [activeRestaurants, phase]);

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

  const handleStartElimination = () => {
    setPhase('elimination');
    setEliminatedIds(new Set());
    setCurrentEliminatorIndex(0);
  };

  const handleEliminateRestaurant = (restaurant: Restaurant) => {
    setEliminatedIds(prev => new Set([...prev, restaurant.id]));
    // Move to next eliminator
    setCurrentEliminatorIndex(prev => prev + 1);
  };

  const handleSpinWheel = () => {
    setPhase('spinWheel');
  };

  const handleWheelComplete = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setMatch(restaurant.id);
    setShowConfetti(true);
    setPhase('winner');
    setTimeout(() => {
      router.push('/match');
    }, 2000);
  };

  if (!party) {
    return null;
  }

  // Spin wheel phase
  if (phase === 'spinWheel') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
        <Confetti isActive={showConfetti} />
        <header className="p-4">
          <Logo variant="icon" size="sm" className="mx-auto" />
        </header>
        <WheelSpinner
          restaurants={activeRestaurants}
          onComplete={handleWheelComplete}
        />
      </div>
    );
  }

  // Winner phase
  if (phase === 'winner' && selectedRestaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
        <Confetti isActive={showConfetti} />
        <Logo size="md" className="mb-8" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Winner!
        </h2>
        <p className="text-rose-500 font-semibold text-xl text-center mb-8">
          {selectedRestaurant.name}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <Confetti isActive={showConfetti} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => phase === 'elimination' ? setPhase('view') : router.push('/swipe')}
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
              {phase === 'elimination' ? 'Elimination Round' : 'Your Shortlist'}
            </h1>
            {phase === 'elimination' ? (
              <>
                <p className="text-rose-500 font-medium">
                  {currentEliminator?.name || 'Player'}'s turn to eliminate
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {activeRestaurants.length} {activeRestaurants.length === 1 ? 'restaurant' : 'restaurants'} remaining
                </p>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                {isMultiDinerInPerson
                  ? `Everyone's unanimous picks (${maybeRestaurants.length})`
                  : `${profile?.name ? `${profile.name}'s` : 'Your'} top picks (${maybeRestaurants.length})`}
              </p>
            )}
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
                {isMultiDinerInPerson
                  ? "No unanimous matches yet. Keep swiping together!"
                  : "Swipe right on restaurants you'd consider to build your shortlist."}
              </p>
              <Button onClick={handleContinueSwiping}>Continue Swiping</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {(phase === 'elimination' ? activeRestaurants : maybeRestaurants).map((restaurant, index) => (
                  <motion.button
                    key={restaurant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => phase === 'elimination' ? handleEliminateRestaurant(restaurant) : handleSelectRestaurant(restaurant)}
                    className={`w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm transition-all ${
                      phase === 'elimination'
                        ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:ring-2 hover:ring-red-400'
                        : selectedRestaurant?.id === restaurant.id
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
                        {phase !== 'elimination' && selectedRestaurant?.id === restaurant.id && (
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
                        {phase === 'elimination' && (
                          <div className="absolute inset-0 bg-black/0 hover:bg-red-500/30 flex items-center justify-center transition-colors group">
                            <svg
                              className="w-8 h-8 text-transparent group-hover:text-white drop-shadow-lg transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                              />
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

                      {/* Selection/Eliminate indicator */}
                      <div className="flex items-center">
                        {phase === 'elimination' ? (
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                        ) : (
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
                        )}
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
            {phase === 'view' ? (
              // View mode CTAs
              <>
                {/* Single diner: select and confirm */}
                {isSingleDiner && (
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
                )}

                {/* Multi-diner: elimination mode or spin wheel */}
                {isMultiDinerInPerson && maybeRestaurants.length > 1 && (
                  <Button
                    onClick={handleStartElimination}
                    fullWidth
                    size="lg"
                  >
                    Start Elimination Round
                  </Button>
                )}

                {/* If only 1 restaurant on shortlist, just pick it */}
                {isMultiDinerInPerson && maybeRestaurants.length === 1 && (
                  <Button
                    onClick={() => {
                      setMatch(maybeRestaurants[0].id);
                      setShowConfetti(true);
                      setTimeout(() => router.push('/match'), 1500);
                    }}
                    fullWidth
                    size="lg"
                  >
                    Choose {maybeRestaurants[0].name}!
                  </Button>
                )}

                {/* Spin wheel option */}
                {maybeRestaurants.length > 1 && (
                  <Button
                    onClick={handleSpinWheel}
                    variant="secondary"
                    fullWidth
                  >
                    Let Fate Decide
                  </Button>
                )}

                <Button
                  onClick={handleContinueSwiping}
                  variant="secondary"
                  fullWidth
                >
                  Keep Swiping
                </Button>
              </>
            ) : phase === 'elimination' ? (
              // Elimination mode CTAs
              <>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Tap a restaurant to eliminate it
                </p>
                <Button
                  onClick={handleSpinWheel}
                  variant="secondary"
                  fullWidth
                >
                  Skip to Wheel
                </Button>
                <Button
                  onClick={() => setPhase('view')}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
