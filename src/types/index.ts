/**
 * Core type definitions for Swipe to Dine
 *
 * This file contains all TypeScript interfaces and types used throughout the application.
 * When integrating with a real backend, these types should match your API response schemas.
 */

// ============================================================================
// Restaurant Types
// ============================================================================

/**
 * Restaurant data model
 *
 * TODO: Replace mock data with Google Places API
 * Google Places returns: place_id, name, rating, price_level (0-4),
 * types[], formatted_address, geometry.location, photos[], etc.
 */
export interface Restaurant {
  id: string;
  name: string;
  rating: number; // 1.0 - 5.0
  priceLevel: PriceLevel;
  cuisines: CuisineType[];
  address: string;
  lat?: number;
  lng?: number;
  photos: string[]; // URLs - use placeholders for mock
  description: string;
  familyFriendly: boolean;
  distanceMiles: number; // Computed from user location
  phone?: string;
  website?: string;
  hours?: string;
}

export type PriceLevel = '$' | '$$' | '$$$' | '$$$$';

export type CuisineType =
  | 'american'
  | 'italian'
  | 'mexican'
  | 'chinese'
  | 'japanese'
  | 'thai'
  | 'indian'
  | 'mediterranean'
  | 'french'
  | 'korean'
  | 'vietnamese'
  | 'greek'
  | 'bbq'
  | 'seafood'
  | 'pizza'
  | 'burgers'
  | 'sushi'
  | 'vegan'
  | 'breakfast'
  | 'dessert'
  | 'bar';

export const ALL_CUISINES: CuisineType[] = [
  'american',
  'italian',
  'mexican',
  'chinese',
  'japanese',
  'thai',
  'indian',
  'mediterranean',
  'french',
  'korean',
  'vietnamese',
  'greek',
  'bbq',
  'seafood',
  'pizza',
  'burgers',
  'sushi',
  'vegan',
  'breakfast',
  'dessert',
  'bar',
];

export const CUISINE_LABELS: Record<CuisineType, string> = {
  american: 'American',
  italian: 'Italian',
  mexican: 'Mexican',
  chinese: 'Chinese',
  japanese: 'Japanese',
  thai: 'Thai',
  indian: 'Indian',
  mediterranean: 'Mediterranean',
  french: 'French',
  korean: 'Korean',
  vietnamese: 'Vietnamese',
  greek: 'Greek',
  bbq: 'BBQ',
  seafood: 'Seafood',
  pizza: 'Pizza',
  burgers: 'Burgers',
  sushi: 'Sushi',
  vegan: 'Vegan',
  breakfast: 'Breakfast',
  dessert: 'Dessert',
  bar: 'Happy Hour/Bar',
};

// ============================================================================
// Filter Types
// ============================================================================

export interface DiningFilters {
  minRating: number; // 1.0 - 5.0, step 0.1
  maxDistance: number; // miles, 1-25
  priceRange: PriceLevel[];
  familyFriendly: boolean | null; // null = no preference
  cuisineTypes: CuisineType[];
}

export const DEFAULT_FILTERS: DiningFilters = {
  minRating: 3.0,
  maxDistance: 10,
  priceRange: ['$', '$$', '$$$'],
  familyFriendly: null,
  cuisineTypes: [],
};

// ============================================================================
// Profile Types
// ============================================================================

/**
 * User profile stored in LocalStorage
 */
export interface Profile {
  id: string;
  name: string;
  phone: string;
  avatar: string; // Base64 image or SVG string
  avatarType: 'generated' | 'uploaded';
  cuisinePreferences: CuisinePreferences;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Cuisine preferences map
 * Values range from -2 (hate) to +2 (love)
 * -2 = 🤮, -1 = 😕, 0 = 😐, +1 = 🙂, +2 = 😀
 */
export type CuisinePreferences = Partial<Record<CuisineType, number>>;

export const PREFERENCE_EMOJIS = ['🤮', '😕', '😐', '🙂', '😀'];
export const PREFERENCE_VALUES = [-2, -1, 0, 1, 2];

// ============================================================================
// Party / Session Types
// ============================================================================

export type AttendanceMode = 'remote' | 'inPerson'; // 'inPerson' = pass-the-phone mode

export type VoteStatus = 'no' | 'maybe' | 'unknown';

export interface DinerSelection {
  profileId: string;
  mode: AttendanceMode;
}

/**
 * Party state - represents a dining session
 *
 * TODO: Replace with real-time backend (Firebase, Supabase, or custom WebSocket)
 * This would become a database record synced in real-time across clients.
 */
export interface PartyState {
  inviteId: string;
  hostProfileId: string | null;
  dateTime: string | null; // ISO string
  filters: DiningFilters;
  selectedDiners: DinerSelection[];
  /** Votes by restaurant ID, then by diner ID */
  votes: Record<string, Record<string, VoteStatus>>;
  /** IDs of restaurants that have been shown */
  seenRestaurantIds: string[];
  /** The matched restaurant ID, if any */
  matchedRestaurantId: string | null;
  /** Timestamp when match was found */
  matchedAt: number | null;
  /** Current restaurant being voted on */
  currentRestaurantIndex: number;
  /** For In-Person: current diner index (which person is currently swiping all restaurants) */
  currentInPersonDinerIndex: number;
  /** For In-Person: track which restaurant index each person started at */
  inPersonDinerStartIndex: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Location Types
// ============================================================================

export interface UserLocation {
  lat: number;
  lng: number;
  source: 'geolocation' | 'manual';
  address?: string;
}

// ============================================================================
// Invite Types
// ============================================================================

export interface Invite {
  id: string;
  hostName: string;
  dateTime: string | null;
  partyId: string;
  createdAt: number;
}
