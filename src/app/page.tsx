'use client';

/**
 * Landing / Filters Page
 *
 * Route: /
 * Purpose: Set dining preferences before starting the swiping experience.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Logo } from '@/components/common/Logo';
import { Button, Slider, Chip, Toggle, Input } from '@/components/ui';
import { useFilterStore, useLocationStore, usePartyStore } from '@/stores';
import { ALL_CUISINES, CUISINE_LABELS, PriceLevel } from '@/types';

const PRICE_LEVELS: PriceLevel[] = ['$', '$$', '$$$', '$$$$'];

export default function FiltersPage() {
  const router = useRouter();
  const { filters, setMinRating, setMaxDistance, togglePriceLevel, setFamilyFriendly, toggleCuisine } =
    useFilterStore();
  const { location, isLoading, permissionDenied, requestGeolocation, setManualLocation } =
    useLocationStore();
  const { createParty } = usePartyStore();

  const [manualCity, setManualCity] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [hasCustomLogo, setHasCustomLogo] = useState(true);

  // Request geolocation on mount
  useEffect(() => {
    if (!location) {
      requestGeolocation();
    }
  }, []);

  // Show manual input if permission denied
  useEffect(() => {
    if (permissionDenied) {
      setShowManualInput(true);
    }
  }, [permissionDenied]);

  const handleManualLocation = () => {
    if (manualCity.trim()) {
      setManualLocation(manualCity.trim());
      setShowManualInput(false);
    }
  };

  const handleNext = () => {
    // Create a new party with current filters
    createParty(null, filters);
    router.push('/group');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center">
          {hasCustomLogo ? (
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="Swipe to Dine"
                fill
                className="object-contain"
                onError={() => setHasCustomLogo(false)}
                priority
              />
            </div>
          ) : (
            <Logo size="md" animate />
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Dining Preferences
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Set your filters to find the perfect restaurant
          </p>

          {/* Current Location */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Current Location
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              {isLoading ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <span>Getting your location...</span>
                </div>
              ) : location ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-rose-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {location.address || 'Current Location'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {location.source === 'geolocation'
                        ? 'Using your location'
                        : 'Manual entry'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="text-rose-500 text-sm font-medium hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : showManualInput ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Enter city or zip code"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                  />
                  <Button size="sm" onClick={handleManualLocation} fullWidth>
                    Set Location
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Location access was denied
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowManualInput(true)}
                    fullWidth
                  >
                    Enter Location Manually
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Distance */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Maximum Distance
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <Slider
                value={filters.maxDistance}
                onChange={setMaxDistance}
                min={1}
                max={25}
                step={1}
                valueLabel={(v) => `${v} miles`}
              />
            </div>
          </section>

          {/* Rating */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Minimum Rating
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <Slider
                value={filters.minRating}
                onChange={setMinRating}
                min={1}
                max={5}
                step={0.1}
                valueLabel={(v) => `${v.toFixed(1)} ★`}
              />
            </div>
          </section>

          {/* Price Range */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Price Range
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {PRICE_LEVELS.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    selected={filters.priceRange.includes(level)}
                    onClick={() => togglePriceLevel(level)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Family Friendly */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Family Friendly
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <Chip
                  label="Any"
                  selected={filters.familyFriendly === null}
                  onClick={() => setFamilyFriendly(null)}
                />
                <Chip
                  label="Yes"
                  selected={filters.familyFriendly === true}
                  onClick={() => setFamilyFriendly(true)}
                />
                <Chip
                  label="No"
                  selected={filters.familyFriendly === false}
                  onClick={() => setFamilyFriendly(false)}
                />
              </div>
            </div>
          </section>

          {/* Cuisine Types */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Cuisine Types
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Leave empty for all cuisines
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {ALL_CUISINES.map((cuisine) => (
                  <Chip
                    key={cuisine}
                    label={CUISINE_LABELS[cuisine]}
                    selected={filters.cuisineTypes.includes(cuisine)}
                    onClick={() => toggleCuisine(cuisine)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-bottom">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Button onClick={handleNext} fullWidth size="lg">
            Next: Choose Group
          </Button>
        </div>
      </div>
    </div>
  );
}
