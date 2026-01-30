/**
 * Location Store
 *
 * Manages user location for distance-based restaurant search.
 * Supports both browser geolocation and manual entry.
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

          set({
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              source: 'geolocation',
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
