/**
 * Party Store
 *
 * Manages the dining party/session state including:
 * - Selected diners and their attendance modes
 * - Votes for each restaurant
 * - Match detection
 * - In-Person pass-the-phone flow (one person swipes all 10, then next)
 *
 * TODO: Replace with real-time backend
 * Options for real-time sync:
 * 1. Firebase Realtime Database / Firestore
 * 2. Supabase Realtime
 * 3. Custom WebSocket server
 * 4. Pusher / Ably
 *
 * The party state would be stored in a database keyed by inviteId,
 * and changes would be broadcast to all connected clients.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PartyState,
  DiningFilters,
  DEFAULT_FILTERS,
  DinerSelection,
  AttendanceMode,
  VoteStatus,
  Restaurant,
} from '@/types';
import { generateInviteId } from '@/utils/helpers';

interface PartyStoreState {
  party: PartyState | null;
  restaurants: Restaurant[];

  // Party lifecycle
  createParty: (hostProfileId: string | null, filters?: DiningFilters) => string;
  loadParty: (inviteId: string) => PartyState | null;
  clearParty: () => void;

  // Diner management
  addDiner: (profileId: string, mode?: AttendanceMode) => void;
  removeDiner: (profileId: string) => void;
  setDinerMode: (profileId: string, mode: AttendanceMode) => void;
  isDinerSelected: (profileId: string) => boolean;
  getInPersonDiners: () => DinerSelection[];
  getRemoteDiners: () => DinerSelection[];

  // Date/time
  setDateTime: (dateTime: string | null) => void;

  // Restaurant management
  setRestaurants: (restaurants: Restaurant[]) => void;
  getCurrentRestaurant: () => Restaurant | null;
  advanceToNextRestaurant: () => void;

  // Voting
  vote: (dinerId: string, restaurantId: string, status: VoteStatus) => void;
  getVote: (dinerId: string, restaurantId: string) => VoteStatus;
  getAllVotesForRestaurant: (restaurantId: string) => Record<string, VoteStatus>;
  checkForMatch: (restaurantId: string) => boolean;

  // In-Person flow (one person swipes all restaurants, then passes to next)
  getCurrentInPersonDiner: () => DinerSelection | null;
  advanceToNextInPersonDiner: () => boolean; // Returns true if all in-person diners are done
  resetInPersonFlow: () => void;
  hasCurrentInPersonDinerFinishedRound: (roundSize: number) => boolean;

  // Match
  setMatch: (restaurantId: string) => void;
  getMatchedRestaurant: () => Restaurant | null;

  // Utility
  getRestaurantsWithMaybeVotes: () => Restaurant[];
  getRestaurantsWithUnanimousMaybes: () => Restaurant[];
  clearVotesForRestaurant: (restaurantId: string) => void;
}

// Storage key prefix for parties
const PARTY_STORAGE_KEY = 'swipe-to-dine-party-';

export const usePartyStore = create<PartyStoreState>()(
  persist(
    (set, get) => ({
      party: null,
      restaurants: [],

      createParty: (hostProfileId, filters) => {
        const inviteId = generateInviteId();
        const now = Date.now();

        const newParty: PartyState = {
          inviteId,
          hostProfileId,
          dateTime: null,
          filters: filters || { ...DEFAULT_FILTERS },
          selectedDiners: [],
          votes: {},
          seenRestaurantIds: [],
          matchedRestaurantId: null,
          matchedAt: null,
          currentRestaurantIndex: 0,
          currentInPersonDinerIndex: 0,
          inPersonDinerStartIndex: 0,
          createdAt: now,
          updatedAt: now,
        };

        // Clear old restaurants so new ones are fetched based on new filters
        set({ party: newParty, restaurants: [] });

        // Also save to localStorage with inviteId key for cross-device access
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `${PARTY_STORAGE_KEY}${inviteId}`,
            JSON.stringify(newParty)
          );
        }

        return inviteId;
      },

      loadParty: (inviteId) => {
        if (typeof window === 'undefined') return null;

        const stored = localStorage.getItem(`${PARTY_STORAGE_KEY}${inviteId}`);
        if (stored) {
          const party = JSON.parse(stored) as PartyState;
          set({ party });
          return party;
        }
        return null;
      },

      clearParty: () => set({ party: null, restaurants: [] }),

      addDiner: (profileId, mode = 'remote') => {
        set((state) => {
          if (!state.party) return state;

          // Check if already added
          if (state.party.selectedDiners.some((d) => d.profileId === profileId)) {
            return state;
          }

          const updatedParty = {
            ...state.party,
            selectedDiners: [
              ...state.party.selectedDiners,
              { profileId, mode },
            ],
            updatedAt: Date.now(),
          };

          // Sync to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      removeDiner: (profileId) => {
        set((state) => {
          if (!state.party) return state;

          const updatedParty = {
            ...state.party,
            selectedDiners: state.party.selectedDiners.filter(
              (d) => d.profileId !== profileId
            ),
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      setDinerMode: (profileId, mode) => {
        set((state) => {
          if (!state.party) return state;

          const updatedParty = {
            ...state.party,
            selectedDiners: state.party.selectedDiners.map((d) =>
              d.profileId === profileId ? { ...d, mode } : d
            ),
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      isDinerSelected: (profileId) => {
        const { party } = get();
        return party?.selectedDiners.some((d) => d.profileId === profileId) || false;
      },

      getInPersonDiners: () => {
        const { party } = get();
        return party?.selectedDiners.filter((d) => d.mode === 'inPerson') || [];
      },

      getRemoteDiners: () => {
        const { party } = get();
        return party?.selectedDiners.filter((d) => d.mode === 'remote') || [];
      },

      setDateTime: (dateTime) => {
        set((state) => {
          if (!state.party) return state;

          const updatedParty = {
            ...state.party,
            dateTime,
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      setRestaurants: (restaurants) => set({ restaurants }),

      getCurrentRestaurant: () => {
        const { party, restaurants } = get();
        if (!party || restaurants.length === 0) return null;
        return restaurants[party.currentRestaurantIndex] || null;
      },

      advanceToNextRestaurant: () => {
        set((state) => {
          if (!state.party) return state;

          const nextIndex = state.party.currentRestaurantIndex + 1;
          const currentRestaurant = state.restaurants[state.party.currentRestaurantIndex];

          const updatedParty = {
            ...state.party,
            currentRestaurantIndex: nextIndex,
            // Don't reset in-person diner index - one person swipes all restaurants in their turn
            seenRestaurantIds: currentRestaurant
              ? [...state.party.seenRestaurantIds, currentRestaurant.id]
              : state.party.seenRestaurantIds,
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      vote: (dinerId, restaurantId, status) => {
        set((state) => {
          if (!state.party) return state;

          const updatedVotes = {
            ...state.party.votes,
            [restaurantId]: {
              ...(state.party.votes[restaurantId] || {}),
              [dinerId]: status,
            },
          };

          const updatedParty = {
            ...state.party,
            votes: updatedVotes,
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      getVote: (dinerId, restaurantId) => {
        const { party } = get();
        return party?.votes[restaurantId]?.[dinerId] || 'unknown';
      },

      getAllVotesForRestaurant: (restaurantId) => {
        const { party } = get();
        return party?.votes[restaurantId] || {};
      },

      checkForMatch: (restaurantId) => {
        const { party } = get();
        if (!party) return false;

        const votes = party.votes[restaurantId] || {};
        const allDiners = party.selectedDiners;

        // All diners must have voted 'maybe'
        for (const diner of allDiners) {
          if (votes[diner.profileId] !== 'maybe') {
            return false;
          }
        }

        return allDiners.length > 0;
      },

      getCurrentInPersonDiner: () => {
        const { party } = get();
        if (!party) return null;

        const inPersonDiners = party.selectedDiners.filter((d) => d.mode === 'inPerson');
        return inPersonDiners[party.currentInPersonDinerIndex] || null;
      },

      advanceToNextInPersonDiner: () => {
        const state = get();
        if (!state.party) return true;

        const inPersonDiners = state.party.selectedDiners.filter(
          (d) => d.mode === 'inPerson'
        );
        const nextIndex = state.party.currentInPersonDinerIndex + 1;

        if (nextIndex >= inPersonDiners.length) {
          // All in-person diners have completed their turns
          return true;
        }

        set((s) => {
          if (!s.party) return s;

          // Reset currentRestaurantIndex to round start so next diner sees same restaurants
          // Keep inPersonDinerStartIndex unchanged (it marks the round start)
          const updatedParty = {
            ...s.party,
            currentInPersonDinerIndex: nextIndex,
            currentRestaurantIndex: s.party.inPersonDinerStartIndex,
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${s.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });

        return false;
      },

      resetInPersonFlow: () => {
        set((state) => {
          if (!state.party) return state;

          const updatedParty = {
            ...state.party,
            currentInPersonDinerIndex: 0,
            inPersonDinerStartIndex: state.party.currentRestaurantIndex,
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      hasCurrentInPersonDinerFinishedRound: (roundSize: number) => {
        const { party } = get();
        if (!party) return true;

        // Check if current diner has swiped roundSize restaurants since their start
        const swipedInThisTurn = party.currentRestaurantIndex - party.inPersonDinerStartIndex;
        return swipedInThisTurn >= roundSize;
      },

      setMatch: (restaurantId) => {
        set((state) => {
          if (!state.party) return state;

          const updatedParty = {
            ...state.party,
            matchedRestaurantId: restaurantId,
            matchedAt: Date.now(),
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },

      getMatchedRestaurant: () => {
        const { party, restaurants } = get();
        if (!party?.matchedRestaurantId) return null;
        return restaurants.find((r) => r.id === party.matchedRestaurantId) || null;
      },

      getRestaurantsWithMaybeVotes: () => {
        const { party, restaurants } = get();
        if (!party) return [];

        return restaurants.filter((restaurant) => {
          const votes = party.votes[restaurant.id];
          if (!votes) return false;

          // At least one 'maybe' vote
          return Object.values(votes).some((v) => v === 'maybe');
        });
      },

      getRestaurantsWithUnanimousMaybes: () => {
        const { party, restaurants } = get();
        if (!party) return [];

        return restaurants.filter((restaurant) => {
          const votes = party.votes[restaurant.id];
          if (!votes) return false;

          // All diners must have voted 'maybe'
          for (const diner of party.selectedDiners) {
            if (votes[diner.profileId] !== 'maybe') {
              return false;
            }
          }
          return true;
        });
      },

      clearVotesForRestaurant: (restaurantId) => {
        set((state) => {
          if (!state.party) return state;

          const updatedVotes = { ...state.party.votes };
          delete updatedVotes[restaurantId];

          const updatedParty = {
            ...state.party,
            votes: updatedVotes,
            updatedAt: Date.now(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `${PARTY_STORAGE_KEY}${state.party.inviteId}`,
              JSON.stringify(updatedParty)
            );
          }

          return { party: updatedParty };
        });
      },
    }),
    {
      name: 'swipe-to-dine-current-party',
      partialize: (state) => ({ party: state.party }),
    }
  )
);
