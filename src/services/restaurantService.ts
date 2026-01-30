/**
 * Restaurant Service
 *
 * Handles restaurant search, filtering, and ranking.
 *
 * TODO: Replace with real API integration
 *
 * Google Places API integration:
 * 1. Create a Cloud project at console.cloud.google.com
 * 2. Enable Places API
 * 3. Create API key with appropriate restrictions
 * 4. Use Nearby Search: GET /maps/api/place/nearbysearch/json
 *    - location: lat,lng
 *    - radius: meters (1 mile = 1609.34 meters)
 *    - type: restaurant
 *    - minprice/maxprice: 0-4 (maps to $-$$$$)
 *    - keyword: cuisine types
 * 5. Use Place Details for more info
 * 6. Use Place Photos for images
 *
 * Yelp Fusion API alternative:
 * 1. Create app at yelp.com/developers
 * 2. Use Business Search: GET /v3/businesses/search
 *    - location or latitude/longitude
 *    - radius: meters (max 40000)
 *    - categories: cuisine types
 *    - price: 1-4
 */

import { Restaurant, DiningFilters, Profile, CuisineType } from '@/types';
import { mockRestaurants, getRestaurantById } from '@/data/mockRestaurants';

interface SearchParams {
  filters: DiningFilters;
  userLat?: number;
  userLng?: number;
  profiles?: Profile[]; // For preference scoring
}

interface ScoredRestaurant {
  restaurant: Restaurant;
  filterScore: number;
  preferenceScore: number;
  totalScore: number;
}

/**
 * Search and rank restaurants based on filters and group preferences
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
