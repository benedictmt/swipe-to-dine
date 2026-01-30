'use client';

/**
 * Swipe Experience Page
 *
 * Route: /swipe
 * Purpose: Main swiping interface with cards and consensus tracking.
 *
 * Multi-diner in-person mode:
 * - One person swipes through all restaurants in their batch
 * - Then passes the phone to the next person
 * - Restaurants where everyone votes "maybe" go to shortlist
 * - After all diners complete a round, see results and option to continue or go to shortlist
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
import { usePartyStore, useProfileStore, useLocationStore } from '@/stores';
import { searchRestaurantsAsync, searchRestaurants } from '@/services/restaurantService';
import { Profile, Restaurant, VoteStatus, DEFAULT_FILTERS } from '@/types';

type SwipePhase = 'swiping' | 'inPersonHandoff' | 'noMatch' | 'spinWheel' | 'matched' | 'roundEnd';

// Restaurants per round for multi-diner mode
const RESTAURANTS_PER_ROUND = 10;
// Minimum swipes before showing shortlist option for single diner
const MIN_SWIPES_FOR_SHORTLIST = 10;

export default function SwipePage() {
  const router = useRouter();
  const { profiles, getProfile } = useProfileStore();
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
    getCurrentInPersonDiner,
    advanceToNextInPersonDiner,
    resetInPersonFlow,
    hasCurrentInPersonDinerFinishedRound,
    getInPersonDiners,
    getRestaurantsWithMaybeVotes,
    getRestaurantsWithUnanimousMaybes,
  } = usePartyStore();

  const [phase, setPhase] = useState<SwipePhase>('swiping');
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isInPersonReady, setIsInPersonReady] = useState(false);
  const [currentCardKey, setCurrentCardKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [roundStartIndex, setRoundStartIndex] = useState(0);

  // Get current restaurant
  const currentRestaurant = getCurrentRestaurant();

  // Get selected profiles
  const selectedProfiles: Profile[] = party?.selectedDiners
    .map((d) => getProfile(d.profileId))
    .filter(Boolean) as Profile[];

  // Get in-person diners
  const inPersonDiners = getInPersonDiners();
  const currentInPersonDiner = getCurrentInPersonDiner();
  const currentInPersonProfile = currentInPersonDiner
    ? getProfile(currentInPersonDiner.profileId)
    : null;

  // Check if we need in-person handoff (show at the START of a person's turn)
  const needsInPersonHandoff = inPersonDiners.length > 0 && !isInPersonReady && !!currentRestaurant;

  // Mode detection
  const isSingleDiner = party?.selectedDiners.length === 1;
  const isMultiDinerInPerson = !isSingleDiner && inPersonDiners.length > 1;
  const swipeCount = party?.currentRestaurantIndex || 0;
  const canViewShortlist = swipeCount >= MIN_SWIPES_FOR_SHORTLIST;
  const maybeCount = getRestaurantsWithMaybeVotes().length;
  const unanimousCount = getRestaurantsWithUnanimousMaybes().length;

  // Browse-only mode: single diner with "Just Browsing" profile (no match detection)
  const isBrowseOnly = isSingleDiner && selectedProfiles[0]?.name === 'Just Browsing';

  // Round tracking for multi-diner mode
  const restaurantsInCurrentRound = swipeCount - roundStartIndex;

  // For in-person mode, track how many restaurants current diner has swiped
  const currentDinerStartIndex = party?.inPersonDinerStartIndex || 0;
  const currentDinerSwipeCount = swipeCount - currentDinerStartIndex;
  const currentDinerFinishedBatch = currentDinerSwipeCount >= RESTAURANTS_PER_ROUND;

  // End of round when ALL in-person diners have finished their batches
  const allDinersFinishedRound = isMultiDinerInPerson &&
    (party?.currentInPersonDinerIndex || 0) >= inPersonDiners.length - 1 &&
    currentDinerFinishedBatch;

  const currentRound = Math.floor(roundStartIndex / (RESTAURANTS_PER_ROUND * inPersonDiners.length)) + 1;
  const remainingInDeck = restaurants.length - swipeCount;

  // Load restaurants on mount
  useEffect(() => {
    if (!party) {
      router.push('/');
      return;
    }

    if (restaurants.length === 0 && !isLoading) {
      setIsLoading(true);

      // Use filters from party state (already hydrated from localStorage)
      // instead of filter store which may not be hydrated yet
      const partyFilters = party.filters || DEFAULT_FILTERS;

      // Try async search with Google Places if location available
      const loadRestaurants = async () => {
        try {
          const results = await searchRestaurantsAsync({
            filters: partyFilters,
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
            filters: partyFilters,
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

  // Check for end of round in multi-diner mode (when all diners finish their batches)
  useEffect(() => {
    if (allDinersFinishedRound && phase === 'swiping') {
      setPhase('roundEnd');
    }
  }, [allDinersFinishedRound, phase]);

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

      if (inPersonDiners.length > 0 && currentInPersonDiner) {
        // In-person mode: current in-person diner votes
        votingDinerId = currentInPersonDiner.profileId;
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

      // For multi-diner in-person mode, don't check for instant match
      // Matches are collected into shortlist and reviewed later
      if (!isMultiDinerInPerson && !isBrowseOnly) {
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
      }

      // Move to next restaurant
      advanceToNextRestaurant();
      setCurrentCardKey((k) => k + 1);

      // In multi-diner in-person mode, check if current diner finished their batch
      if (isMultiDinerInPerson) {
        // +1 because we just advanced
        const newSwipeCount = (party.currentRestaurantIndex || 0) + 1;
        const newDinerSwipeCount = newSwipeCount - (party.inPersonDinerStartIndex || 0);

        if (newDinerSwipeCount >= RESTAURANTS_PER_ROUND) {
          // Current diner finished their batch, pass to next diner
          const allDone = advanceToNextInPersonDiner();
          setIsInPersonReady(false); // Trigger handoff overlay for next person

          if (allDone) {
            // All diners have finished this round
            setPhase('roundEnd');
          }
        }
      }
    },
    [currentRestaurant, party, inPersonDiners, currentInPersonDiner, currentVotes, isBrowseOnly, isMultiDinerInPerson]
  );

  const handleSwipeLeft = () => handleVote('no');
  const handleSwipeRight = () => handleVote('maybe');

  const handleInPersonReady = () => {
    setIsInPersonReady(true);
  };

  const handleContinueRound = () => {
    setRoundStartIndex(swipeCount);
    resetInPersonFlow(); // Reset to first in-person diner
    setIsInPersonReady(false);
    setPhase('swiping');
  };

  const handleSpinWheel = () => {
    const shortlist = isMultiDinerInPerson
      ? getRestaurantsWithUnanimousMaybes()
      : getRestaurantsWithMaybeVotes();
    if (shortlist.length > 0) {
      setPhase('spinWheel');
    } else {
      alert('No restaurants made it to your shortlist yet!');
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

  // Round end screen for multi-diner mode
  if (phase === 'roundEnd') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
        <Logo size="md" className="mb-8" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Round {currentRound} Complete!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
          Everyone has swiped through their restaurants.
        </p>
        {unanimousCount > 0 ? (
          <p className="text-rose-500 font-medium text-center mb-8">
            {unanimousCount} {unanimousCount === 1 ? 'place' : 'places'} made everyone's shortlist!
          </p>
        ) : (
          <p className="text-gray-400 text-center mb-8">
            No unanimous matches yet. Keep swiping!
          </p>
        )}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {unanimousCount > 0 && (
            <Button onClick={() => router.push('/shortlist')} fullWidth>
              View Shortlist ({unanimousCount})
            </Button>
          )}
          {remainingInDeck > 0 ? (
            <Button
              variant={unanimousCount > 0 ? 'secondary' : 'primary'}
              onClick={handleContinueRound}
              fullWidth
            >
              Continue Swiping ({remainingInDeck} left)
            </Button>
          ) : unanimousCount > 0 ? (
            <Button variant="secondary" onClick={handleSpinWheel} fullWidth>
              Let Fate Decide
            </Button>
          ) : (
            <p className="text-center text-gray-500">
              No more restaurants and no matches. Try adjusting your filters.
            </p>
          )}
          {unanimousCount > 0 && remainingInDeck > 0 && (
            <Button variant="secondary" onClick={handleSpinWheel} fullWidth>
              Let Fate Decide
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push('/')} fullWidth>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  // End of deck
  if (!currentRestaurant && phase === 'swiping') {
    // Multi-diner end screen
    if (isMultiDinerInPerson) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
          <Logo size="md" className="mb-8" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            All Done!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
            You've seen all {restaurants.length} restaurants.
          </p>
          {unanimousCount > 0 ? (
            <p className="text-rose-500 font-medium text-center mb-8">
              {unanimousCount} {unanimousCount === 1 ? 'place' : 'places'} made everyone's shortlist!
            </p>
          ) : (
            <p className="text-gray-400 text-center mb-8">
              No unanimous matches. Use the wheel to pick from individual maybes!
            </p>
          )}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {unanimousCount > 0 && (
              <Button onClick={() => router.push('/shortlist')} fullWidth>
                View Shortlist ({unanimousCount})
              </Button>
            )}
            <Button
              variant={unanimousCount > 0 ? 'secondary' : 'primary'}
              onClick={handleSpinWheel}
              fullWidth
            >
              Let Fate Decide
            </Button>
            <Button variant="secondary" onClick={() => router.push('/')} fullWidth>
              Start Over
            </Button>
          </div>
        </div>
      );
    }

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

    // No maybes end screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
        <Logo size="md" className="mb-8" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          End of the Line!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
          You've seen all the restaurants. No matches yet.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => router.push('/')} fullWidth>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  // Spin wheel phase
  if (phase === 'spinWheel') {
    const wheelRestaurants = isMultiDinerInPerson
      ? getRestaurantsWithUnanimousMaybes()
      : getRestaurantsWithMaybeVotes();

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
        <Confetti isActive={showConfetti} />
        <header className="p-4">
          <Logo variant="icon" size="sm" className="mx-auto" />
        </header>
        <WheelSpinner
          restaurants={wheelRestaurants}
          onComplete={handleWheelComplete}
        />
      </div>
    );
  }

  // Calculate current diner's progress for in-person mode
  const currentDinerIndex = party?.currentInPersonDinerIndex || 0;

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
                key={`${currentCardKey}-${party?.currentInPersonDinerIndex ?? 0}`}
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

                {/* In-Person handoff overlay */}
                <AnimatePresence>
                  {needsInPersonHandoff && currentInPersonProfile && (
                    <OnDeckOverlay
                      profile={currentInPersonProfile}
                      onReady={handleInPersonReady}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* In-person progress indicator */}
        {isMultiDinerInPerson && isInPersonReady && currentInPersonProfile && (
          <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-rose-500">{currentInPersonProfile.name}'s turn:</span>
            {' '}{currentDinerSwipeCount + 1} of {RESTAURANTS_PER_ROUND}
          </div>
        )}

        {/* Vote buttons */}
        <div className="mt-4">
          <VoteButtons
            onNo={handleSwipeLeft}
            onMaybe={handleSwipeRight}
            disabled={needsInPersonHandoff}
          />
        </div>

        {/* Voter status */}
        <div className="mt-6">
          <VoterStatus
            profiles={selectedProfiles}
            votes={currentVotes}
            currentDinerId={currentInPersonDiner?.profileId}
          />
        </div>

        {/* Restaurant counter */}
        <div className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
          {isMultiDinerInPerson ? (
            <>
              Person {currentDinerIndex + 1} of {inPersonDiners.length}
              {unanimousCount > 0 && (
                <span className="text-rose-500 ml-2">
                  ({unanimousCount} on shortlist)
                </span>
              )}
            </>
          ) : (
            <>
              {(party.currentRestaurantIndex || 0) + 1} of {restaurants.length}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 text-center space-y-2">
          {/* Shortlist button after enough swipes */}
          {canViewShortlist && (isMultiDinerInPerson ? unanimousCount > 0 : maybeCount > 0) && (
            <button
              onClick={() => router.push('/shortlist')}
              className="text-rose-500 text-sm font-medium hover:underline block mx-auto"
            >
              View Shortlist ({isMultiDinerInPerson ? unanimousCount : maybeCount})
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
