/**
 * Restaurant Service
 *
 * Handles restaurant search, filtering, and ranking.
 * Uses Google Places API when configured, falls back to mock data.
 */

import { Restaurant, DiningFilters, Profile, CuisineType } from '@/types';
import { mockRestaurants, getRestaurantById } from '@/data/mockRestaurants';
import { searchGooglePlaces } from './googlePlacesService';

interface SearchParams {
  filters: DiningFilters;
  userLat?: number;
  userLng?: number;
  profiles?: Profile[]; // For preference scoring
  useGooglePlaces?: boolean; // Try Google Places API first
}

interface ScoredRestaurant {
  restaurant: Restaurant;
  filterScore: number;
  preferenceScore: number;
  totalScore: number;
}

/**
 * Async search that tries Google Places API first, falls back to mock data
 */
export async function searchRestaurantsAsync(params: SearchParams): Promise<Restaurant[]> {
  const { filters, userLat, userLng, profiles = [] } = params;

  // Try Google Places API if we have coordinates
  if (userLat && userLng) {
    try {
      const restaurants = await searchGooglePlaces({
        lat: userLat,
        lng: userLng,
        filters,
      });

      if (restaurants.length > 0) {
        // Apply preference scoring and sort
        return rankRestaurants(restaurants, filters, profiles);
      }
    } catch (error) {
      console.warn('Google Places search failed, using mock data:', error);
    }
  }

  // Fall back to mock data
  return searchRestaurants(params);
}

/**
 * Search and rank restaurants based on filters and group preferences (sync/mock data)
 */
export function searchRestaurants(params: SearchParams): Restaurant[] {
  const { filters, profiles = [] } = params;

  // Step 1: Filter restaurants
  let filtered = mockRestaurants.filter((restaurant) => {
    // Rating filter
    if (restaurant.rating < filters.minRating) {
      return false;
    }

    // Distance filter
    if (restaurant.distanceMiles > filters.maxDistance) {
      return false;
    }

    // Price filter (if any selected)
    if (
      filters.priceRange.length > 0 &&
      !filters.priceRange.includes(restaurant.priceLevel)
    ) {
      return false;
    }

    // Family-friendly filter (if set)
    if (
      filters.familyFriendly !== null &&
      restaurant.familyFriendly !== filters.familyFriendly
    ) {
      return false;
    }

    // Cuisine filter (if any selected, restaurant must have at least one matching)
    if (filters.cuisineTypes.length > 0) {
      const hasMatchingCuisine = restaurant.cuisines.some((c) =>
        filters.cuisineTypes.includes(c)
      );
      if (!hasMatchingCuisine) {
        return false;
      }
    }

    return true;
  });

  // Step 2: Score and rank restaurants
  const scored: ScoredRestaurant[] = filtered.map((restaurant) => {
    const filterScore = calculateFilterScore(restaurant, filters);
    const preferenceScore = calculatePreferenceScore(restaurant, profiles);
    const totalScore = filterScore + preferenceScore;

    return {
      restaurant,
      filterScore,
      preferenceScore,
      totalScore,
    };
  });

  // Step 3: Sort by total score (descending)
  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.map((s) => s.restaurant);
}

/**
 * Rank pre-fetched restaurants by filters and preferences
 */
function rankRestaurants(
  restaurants: Restaurant[],
  filters: DiningFilters,
  profiles: Profile[]
): Restaurant[] {
  const scored: ScoredRestaurant[] = restaurants.map((restaurant) => {
    const filterScore = calculateFilterScore(restaurant, filters);
    const preferenceScore = calculatePreferenceScore(restaurant, profiles);
    const totalScore = filterScore + preferenceScore;

    return {
      restaurant,
      filterScore,
      preferenceScore,
      totalScore,
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored.map((s) => s.restaurant);
}

/**
 * Calculate score based on how well restaurant matches filters
 * Higher is better
 */
function calculateFilterScore(
  restaurant: Restaurant,
  filters: DiningFilters
): number {
  let score = 0;

  // Bonus for higher ratings (0-2 points)
  score += (restaurant.rating - 3) * 1; // Rating 5 = +2, Rating 3 = 0

  // Bonus for closer distance (0-2 points)
  const distanceRatio = 1 - restaurant.distanceMiles / filters.maxDistance;
  score += distanceRatio * 2;

  // Bonus for exact cuisine match (0-1 point per matching cuisine)
  if (filters.cuisineTypes.length > 0) {
    const matchingCuisines = restaurant.cuisines.filter((c) =>
      filters.cuisineTypes.includes(c)
    ).length;
    score += matchingCuisines * 0.5;
  }

  return score;
}

/**
 * Calculate score based on group cuisine preferences
 * Aggregates preferences from all profiles
 */
function calculatePreferenceScore(
  restaurant: Restaurant,
  profiles: Profile[]
): number {
  if (profiles.length === 0) return 0;

  let totalScore = 0;
  let preferenceCount = 0;

  for (const profile of profiles) {
    for (const cuisine of restaurant.cuisines) {
      const preference = profile.cuisinePreferences[cuisine];
      if (preference !== undefined) {
        totalScore += preference; // -2 to +2
        preferenceCount++;
      }
    }
  }

  // Normalize by number of preferences counted
  // Result ranges roughly from -2 to +2
  if (preferenceCount > 0) {
    return totalScore / preferenceCount;
  }

  return 0;
}

/**
 * Get a single restaurant by ID
 */
export { getRestaurantById };

/**
 * Get all restaurants (unfiltered)
 */
export function getAllRestaurants(): Restaurant[] {
  return mockRestaurants;
}

/**
 * Simulate "recently seen" tracking
 * In production, this would be stored per-user in the database
 */
const recentlySeenMap = new Map<string, number>();

export function markRestaurantSeen(restaurantId: string): void {
  recentlySeenMap.set(restaurantId, Date.now());
}

export function wasRecentlySeen(restaurantId: string, withinMs = 86400000): boolean {
  const seenAt = recentlySeenMap.get(restaurantId);
  if (!seenAt) return false;
  return Date.now() - seenAt < withinMs;
}

/**
 * Apply novelty bonus to scoring
 * Restaurants not seen recently get a small boost
 */
export function applyNoveltyBonus(
  restaurants: Restaurant[],
  boostAmount = 0.5
): Restaurant[] {
  // Sort with novelty consideration
  return [...restaurants].sort((a, b) => {
    const aBonus = wasRecentlySeen(a.id) ? 0 : boostAmount;
    const bBonus = wasRecentlySeen(b.id) ? 0 : boostAmount;

    // This is a simple approach - in production, you'd integrate
    // this into the main scoring function
    return bBonus - aBonus;
  });
}

/**
 * Get random restaurant from a list
 * Used for "Let Fate Decide" feature
 */
export function getRandomRestaurant(restaurants: Restaurant[]): Restaurant | null {
  if (restaurants.length === 0) return null;
  const index = Math.floor(Math.random() * restaurants.length);
  return restaurants[index];
}
