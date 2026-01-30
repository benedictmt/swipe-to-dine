'use client';

/**
 * Swipe Experience Page
 *
 * Route: /swipe
 * Purpose: Main swiping interface with cards and consensus tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui';
import { SwipeCard } from '@/components/swipe/SwipeCard';
import { VoteButtons } from '@/components/swipe/VoteButtons';
import { VoterStatus } from '@/components/swipe/VoterStatus';
import { OnDeckOverlay } from '@/components/swipe/OnDeckOverlay';
import { WheelSpinner } from '@/components/swipe/WheelSpinner';
import { StarBurst } from '@/components/common/StarBurst';
import { Confetti } from '@/components/common/Confetti';
import { usePartyStore, useProfileStore, useFilterStore, useLocationStore } from '@/stores';
import { searchRestaurantsAsync, searchRestaurants } from '@/services/restaurantService';
import { Profile, Restaurant, VoteStatus } from '@/types';

type SwipePhase = 'swiping' | 'onDeckHandoff' | 'noMatch' | 'spinWheel' | 'matched';

// Minimum swipes before showing shortlist option for single diner
const MIN_SWIPES_FOR_SHORTLIST = 10;

export default function SwipePage() {
  const router = useRouter();
  const { profiles, getProfile } = useProfileStore();
  const { filters } = useFilterStore();
  const { location } = useLocationStore();
  const {
    party,
    restaurants,
    setRestaurants,
    getCurrentRestaurant,
    advanceToNextRestaurant,
    vote,
    getVote,
    getAllVotesForRestaurant,
    checkForMatch,
    setMatch,
    getCurrentOnDeckDiner,
    advanceOnDeckTurn,
    resetOnDeckForRestaurant,
    hasAllOnDeckVoted,
    getOnDeckDiners,
    getRestaurantsWithMaybeVotes,
  } = usePartyStore();

  const [phase, setPhase] = useState<SwipePhase>('swiping');
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isOnDeckReady, setIsOnDeckReady] = useState(false);
  const [currentCardKey, setCurrentCardKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Get current restaurant
  const currentRestaurant = getCurrentRestaurant();

  // Get selected profiles
  const selectedProfiles: Profile[] = party?.selectedDiners
    .map((d) => getProfile(d.profileId))
    .filter(Boolean) as Profile[];

  // Get on-deck diners
  const onDeckDiners = getOnDeckDiners();
  const currentOnDeckDiner = getCurrentOnDeckDiner();
  const currentOnDeckProfile = currentOnDeckDiner
    ? getProfile(currentOnDeckDiner.profileId)
    : null;

  // Check if we need on-deck handoff
  const needsOnDeckHandoff = onDeckDiners.length > 0 && !isOnDeckReady && !!currentRestaurant;

  // Single diner mode detection
  const isSingleDiner = party?.selectedDiners.length === 1;
  const swipeCount = party?.currentRestaurantIndex || 0;
  const canViewShortlist = isSingleDiner && swipeCount >= MIN_SWIPES_FOR_SHORTLIST;
  const maybeCount = getRestaurantsWithMaybeVotes().length;

  // Load restaurants on mount
  useEffect(() => {
    if (!party) {
      router.push('/');
      return;
    }

    if (restaurants.length === 0 && !isLoading) {
      setIsLoading(true);

      // Try async search with Google Places if location available
      const loadRestaurants = async () => {
        try {
          const results = await searchRestaurantsAsync({
            filters,
            profiles: selectedProfiles,
            userLat: location?.lat,
            userLng: location?.lng,
          });
          setRestaurants(results);

          // Show star burst on first card
          if (results.length > 0) {
            setShowStarBurst(true);
            setTimeout(() => setShowStarBurst(false), 1000);
          }
        } catch (error) {
          console.error('Failed to load restaurants:', error);
          // Fall back to sync mock data search
          const results = searchRestaurants({
            filters,
            profiles: selectedProfiles,
          });
          setRestaurants(results);
        } finally {
          setIsLoading(false);
        }
      };

      loadRestaurants();
    }
  }, [party, router, isLoading]);

  // Get votes for current restaurant
  const currentVotes = currentRestaurant
    ? getAllVotesForRestaurant(currentRestaurant.id)
    : {};

  // Handle vote submission
  const handleVote = useCallback(
    (status: VoteStatus) => {
      if (!currentRestaurant || !party) return;

      // Determine which diner is voting
      let votingDinerId: string;

      if (onDeckDiners.length > 0 && currentOnDeckDiner) {
        // On-deck mode: current on-deck diner votes
        votingDinerId = currentOnDeckDiner.profileId;
      } else if (party.selectedDiners.length === 1) {
        // Single diner mode
        votingDinerId = party.selectedDiners[0].profileId;
      } else {
        // All remote mode - simulate first unvoted diner
        const unvotedDiner = party.selectedDiners.find(
          (d) => !currentVotes[d.profileId] || currentVotes[d.profileId] === 'unknown'
        );
        votingDinerId = unvotedDiner?.profileId || party.selectedDiners[0].profileId;
      }

      // Record the vote
      vote(votingDinerId, currentRestaurant.id, status);

      // Check for match
      const isMatch = checkForMatch(currentRestaurant.id);
      if (isMatch) {
        setMatch(currentRestaurant.id);
        setShowConfetti(true);
        setPhase('matched');
        setTimeout(() => {
          router.push('/match');
        }, 2000);
        return;
      }

      // Handle on-deck turn progression
      if (onDeckDiners.length > 0) {
        const allOnDeckVoted = advanceOnDeckTurn();

        if (allOnDeckVoted) {
          // All on-deck diners voted, move to next restaurant
          advanceToNextRestaurant();
          setIsOnDeckReady(false);
          setCurrentCardKey((k) => k + 1);
        } else {
          // More on-deck diners need to vote
          setIsOnDeckReady(false);
        }
      } else {
        // No on-deck diners, move to next restaurant
        advanceToNextRestaurant();
        setCurrentCardKey((k) => k + 1);
      }
    },
    [currentRestaurant, party, onDeckDiners, currentOnDeckDiner, currentVotes]
  );

  const handleSwipeLeft = () => handleVote('no');
  const handleSwipeRight = () => handleVote('maybe');

  const handleOnDeckReady = () => {
    setIsOnDeckReady(true);
  };

  const handleNoMatch = () => {
    setPhase('noMatch');
  };

  const handleSpinWheel = () => {
    const maybeRestaurants = getRestaurantsWithMaybeVotes();
    if (maybeRestaurants.length > 0) {
      setPhase('spinWheel');
    } else {
      alert('No restaurants received any "Maybe" votes!');
    }
  };

  const handleWheelComplete = (restaurant: Restaurant) => {
    setMatch(restaurant.id);
    setShowConfetti(true);
    setPhase('matched');
    setTimeout(() => {
      router.push('/match');
    }, 2000);
  };

  if (!party) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
        <Logo size="md" className="mb-8" />
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Finding restaurants near you...
        </p>
      </div>
    );
  }

  // No restaurants found
  if (restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
        <Logo size="md" className="mb-8" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          No Restaurants Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Try relaxing your filters to see more options.
        </p>
        <Button onClick={() => router.push('/')}>Adjust Filters</Button>
      </div>
    );
  }

  // End of deck
  if (!currentRestaurant && phase === 'swiping') {
    // Single diner end screen with shortlist option
    if (isSingleDiner && maybeCount > 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
          <Logo size="md" className="mb-8" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            All Done!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
            You've seen all {restaurants.length} restaurants.
          </p>
          <p className="text-rose-500 font-medium text-center mb-8">
            {maybeCount} {maybeCount === 1 ? 'place' : 'places'} made your shortlist!
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => router.push('/shortlist')} fullWidth>
              View My Shortlist
            </Button>
            <Button variant="secondary" onClick={handleSpinWheel} fullWidth>
              Let Fate Decide
            </Button>
            <Button variant="secondary" onClick={() => router.push('/')} fullWidth>
              Start Over
            </Button>
          </div>
        </div>
      );
    }

    // Multi-diner or no maybes end screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
        <Logo size="md" className="mb-8" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          End of the Line!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
          You've seen all the restaurants. No unanimous match yet.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={handleSpinWheel} fullWidth>
            Let Fate Decide
          </Button>
          <Button variant="secondary" onClick={() => router.push('/')} fullWidth>
            Start Over
          </Button>
        </div>
      </div>
    );
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
          restaurants={getRestaurantsWithMaybeVotes()}
          onComplete={handleWheelComplete}
        />
      </div>
    );
  }

  // Calculate on-deck progress
  const onDeckProgress = onDeckDiners.length > 0
    ? {
        current: onDeckDiners.filter((d) => currentVotes[d.profileId]).length,
        total: onDeckDiners.length,
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <Confetti isActive={showConfetti} />

      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/group')}
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
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Card area */}
      <div className="flex-1 px-4 pb-4 flex flex-col">
        {/* Card container */}
        <div className="relative flex-1 max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            {currentRestaurant && (
              <motion.div
                key={currentCardKey}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="absolute inset-0"
              >
                <SwipeCard
                  restaurant={currentRestaurant}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  isFirst={currentCardKey === 0}
                />
                <StarBurst isActive={showStarBurst && currentCardKey === 0} />

                {/* On-Deck overlay */}
                <AnimatePresence>
                  {needsOnDeckHandoff && currentOnDeckProfile && (
                    <OnDeckOverlay
                      profile={currentOnDeckProfile}
                      onReady={handleOnDeckReady}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* On-deck progress indicator */}
        {onDeckProgress && isOnDeckReady && (
          <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            On-Deck: {onDeckProgress.current + 1}/{onDeckProgress.total} voting
          </div>
        )}

        {/* Vote buttons */}
        <div className="mt-4">
          <VoteButtons
            onNo={handleSwipeLeft}
            onMaybe={handleSwipeRight}
            disabled={needsOnDeckHandoff}
          />
        </div>

        {/* Voter status */}
        <div className="mt-6">
          <VoterStatus
            profiles={selectedProfiles}
            votes={currentVotes}
            currentDinerId={currentOnDeckDiner?.profileId}
          />
        </div>

        {/* Restaurant counter */}
        <div className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
          {(party.currentRestaurantIndex || 0) + 1} of {restaurants.length}
        </div>

        {/* Action buttons */}
        <div className="mt-4 text-center space-y-2">
          {/* Shortlist button for single diners after 10+ swipes */}
          {canViewShortlist && maybeCount > 0 && (
            <button
              onClick={() => router.push('/shortlist')}
              className="text-rose-500 text-sm font-medium hover:underline block mx-auto"
            >
              View Shortlist ({maybeCount})
            </button>
          )}
          <button
            onClick={handleSpinWheel}
            className="text-gray-400 dark:text-gray-500 text-sm hover:underline"
          >
            Can't decide? Let Fate Choose
          </button>
        </div>
      </div>
    </div>
  );
}
