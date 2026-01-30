/**
 * Filter Store
 *
 * Manages dining filter preferences for the current session.
 * Filters are applied when searching for restaurants.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DiningFilters, DEFAULT_FILTERS, CuisineType, PriceLevel } from '@/types';

interface FilterState {
  filters: DiningFilters;

  // Actions
  setMinRating: (rating: number) => void;
  setMaxDistance: (distance: number) => void;
  togglePriceLevel: (level: PriceLevel) => void;
  setPriceRange: (levels: PriceLevel[]) => void;
  setFamilyFriendly: (value: boolean | null) => void;
  toggleCuisine: (cuisine: CuisineType) => void;
  setCuisines: (cuisines: CuisineType[]) => void;
  resetFilters: () => void;
  setFilters: (filters: Partial<DiningFilters>) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: { ...DEFAULT_FILTERS },

      setMinRating: (rating) =>
        set((state) => ({
          filters: { ...state.filters, minRating: rating },
        })),

      setMaxDistance: (distance) =>
        set((state) => ({
          filters: { ...state.filters, maxDistance: distance },
        })),

      togglePriceLevel: (level) =>
        set((state) => {
          const current = state.filters.priceRange;
          const newRange = current.includes(level)
            ? current.filter((l) => l !== level)
            : [...current, level];
          return {
            filters: { ...state.filters, priceRange: newRange },
          };
        }),

      setPriceRange: (levels) =>
        set((state) => ({
          filters: { ...state.filters, priceRange: levels },
        })),

      setFamilyFriendly: (value) =>
        set((state) => ({
          filters: { ...state.filters, familyFriendly: value },
        })),

      toggleCuisine: (cuisine) =>
        set((state) => {
          const current = state.filters.cuisineTypes;
          const newCuisines = current.includes(cuisine)
            ? current.filter((c) => c !== cuisine)
            : [...current, cuisine];
          return {
            filters: { ...state.filters, cuisineTypes: newCuisines },
          };
        }),

      setCuisines: (cuisines) =>
        set((state) => ({
          filters: { ...state.filters, cuisineTypes: cuisines },
        })),

      resetFilters: () =>
        set({
          filters: { ...DEFAULT_FILTERS },
        }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
    }),
    {
      name: 'swipe-to-dine-filters',
    }
  )
);
