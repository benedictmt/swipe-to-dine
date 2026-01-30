/**
 * Location Store
 *
 * Manages user location for distance-based restaurant search.
 * Supports both browser geolocation and manual entry.
 * Includes reverse geocoding to get city/area names from coordinates.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserLocation } from '@/types';

interface LocationState {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;

  // Actions
  requestGeolocation: () => Promise<void>;
  setManualLocation: (address: string, lat?: number, lng?: number) => void;
  clearLocation: () => void;
}

/**
 * Reverse geocode coordinates to get a human-readable location name
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: {
          'User-Agent': 'SwipeToDine/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // Extract the most relevant location name
    const address = data.address;
    if (!address) return null;

    // Priority: city > town > village > county > state
    const locationName =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state;

    // Include state/country for context if available
    if (locationName && address.state && locationName !== address.state) {
      return `${locationName}, ${address.state}`;
    }

    return locationName || null;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return null;
  }
}

// Default location (NYC) for when geolocation is not available
const DEFAULT_LOCATION: UserLocation = {
  lat: 40.7128,
  lng: -74.006,
  source: 'manual',
  address: 'New York, NY',
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      isLoading: false,
      error: null,
      permissionDenied: false,

      requestGeolocation: async () => {
        if (!navigator.geolocation) {
          set({
            error: 'Geolocation is not supported by your browser',
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
              });
            }
          );

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Try to get the city/area name via reverse geocoding
          const locationName = await reverseGeocode(lat, lng);

          set({
            location: {
              lat,
              lng,
              source: 'geolocation',
              address: locationName || undefined,
            },
            isLoading: false,
            permissionDenied: false,
          });
        } catch (error) {
          const geoError = error as GeolocationPositionError;

          if (geoError.code === geoError.PERMISSION_DENIED) {
            set({
              permissionDenied: true,
              isLoading: false,
              error: 'Location permission denied',
            });
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            set({
              isLoading: false,
              error: 'Location unavailable',
            });
          } else {
            set({
              isLoading: false,
              error: 'Failed to get location',
            });
          }
        }
      },

      setManualLocation: (address, lat, lng) => {
        // If lat/lng not provided, use default (in production, you'd geocode the address)
        set({
          location: {
            lat: lat ?? DEFAULT_LOCATION.lat,
            lng: lng ?? DEFAULT_LOCATION.lng,
            source: 'manual',
            address,
          },
          error: null,
          permissionDenied: false,
        });
      },

      clearLocation: () =>
        set({
          location: null,
          error: null,
          isLoading: false,
        }),
    }),
    {
      name: 'swipe-to-dine-location',
    }
  )
);
