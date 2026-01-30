/**
 * Google Places Service
 *
 * Client-side service for fetching restaurant data from Google Places API
 * via our proxy endpoint.
 */

import { Restaurant, DiningFilters, CuisineType, CUISINE_LABELS } from '@/types';

interface SearchOptions {
  lat: number;
  lng: number;
  filters: DiningFilters;
}

// Map our cuisine types to search keywords
const CUISINE_SEARCH_TERMS: Record<CuisineType, string> = {
  american: 'american',
  italian: 'italian',
  mexican: 'mexican',
  chinese: 'chinese',
  japanese: 'japanese',
  thai: 'thai',
  indian: 'indian',
  mediterranean: 'mediterranean',
  french: 'french',
  korean: 'korean',
  vietnamese: 'vietnamese',
  greek: 'greek',
  bbq: 'barbecue bbq',
  seafood: 'seafood',
  pizza: 'pizza',
  burgers: 'burger hamburger',
  sushi: 'sushi',
  vegan: 'vegan vegetarian',
  breakfast: 'breakfast brunch',
  dessert: 'dessert bakery ice cream',
  bar: 'bar pub happy hour',
};

// Map price levels to Google's 0-4 scale
function mapPriceLevelToGoogle(level: string): number {
  switch (level) {
    case '$':
      return 1;
    case '$$':
      return 2;
    case '$$$':
      return 3;
    case '$$$$':
      return 4;
    default:
      return 2;
  }
}

/**
 * Search for restaurants using Google Places API
 */
export async function searchGooglePlaces(options: SearchOptions): Promise<Restaurant[]> {
  const { lat, lng, filters } = options;

  // Convert miles to meters (1 mile = 1609.34 meters)
  const radiusMeters = Math.round(filters.maxDistance * 1609.34);

  // Build cuisine search terms
  const cuisineTerms = filters.cuisineTypes.length > 0
    ? filters.cuisineTypes.map((c) => CUISINE_SEARCH_TERMS[c])
    : [];

  // Get price range
  const priceRange = filters.priceRange.length > 0 ? filters.priceRange : ['$', '$$', '$$$'];
  const minPrice = Math.min(...priceRange.map(mapPriceLevelToGoogle));
  const maxPrice = Math.max(...priceRange.map(mapPriceLevelToGoogle));

  try {
    const response = await fetch('/api/places/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat,
        lng,
        radius: radiusMeters,
        cuisineTypes: cuisineTerms,
        minPrice,
        maxPrice,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let restaurants: Restaurant[] = data.restaurants || [];

    // Apply additional client-side filters
    restaurants = restaurants.filter((r) => {
      // Rating filter
      if (r.rating < filters.minRating) return false;

      // Distance filter (double-check)
      if (r.distanceMiles > filters.maxDistance) return false;

      // Family-friendly filter
      if (filters.familyFriendly !== null && r.familyFriendly !== filters.familyFriendly) {
        return false;
      }

      return true;
    });

    return restaurants;
  } catch (error) {
    console.error('Google Places search failed:', error);
    throw error;
  }
}

/**
 * Check if Google Places API is configured
 */
export async function isGooglePlacesConfigured(): Promise<boolean> {
  try {
    // Make a minimal request to check if the API is configured
    const response = await fetch('/api/places/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 0, lng: 0, radius: 1000 }),
    });

    // If we get a 500 error about missing API key, it's not configured
    if (response.status === 500) {
      const data = await response.json();
      if (data.error?.includes('not configured')) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
