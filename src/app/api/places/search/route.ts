/**
 * Google Places API Proxy
 *
 * This API route proxies requests to Google Places API to:
 * 1. Keep the API key secure (server-side only)
 * 2. Handle CORS restrictions
 * 3. Transform the response to our Restaurant format
 */

import { NextRequest, NextResponse } from 'next/server';
import { Restaurant, CuisineType, PriceLevel } from '@/types';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Map Google place types to our cuisine types
const TYPE_TO_CUISINE: Record<string, CuisineType> = {
  american_restaurant: 'american',
  italian_restaurant: 'italian',
  mexican_restaurant: 'mexican',
  chinese_restaurant: 'chinese',
  japanese_restaurant: 'japanese',
  thai_restaurant: 'thai',
  indian_restaurant: 'indian',
  mediterranean_restaurant: 'mediterranean',
  french_restaurant: 'french',
  korean_restaurant: 'korean',
  vietnamese_restaurant: 'vietnamese',
  greek_restaurant: 'greek',
  barbecue_restaurant: 'bbq',
  seafood_restaurant: 'seafood',
  pizza_restaurant: 'pizza',
  hamburger_restaurant: 'burgers',
  sushi_restaurant: 'sushi',
  vegan_restaurant: 'vegan',
  vegetarian_restaurant: 'vegan',
  breakfast_restaurant: 'breakfast',
  brunch_restaurant: 'breakfast',
  cafe: 'breakfast',
  bakery: 'dessert',
  ice_cream_shop: 'dessert',
  bar: 'bar',
  wine_bar: 'bar',
  pub: 'bar',
  night_club: 'bar',
};

// Map Google price levels to our format
function mapPriceLevel(priceLevel?: number): PriceLevel {
  switch (priceLevel) {
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return '$$'; // Default to moderate
  }
}

// Extract cuisines from Google place types
function extractCuisines(types: string[]): CuisineType[] {
  const cuisines: CuisineType[] = [];
  for (const type of types) {
    const cuisine = TYPE_TO_CUISINE[type];
    if (cuisine && !cuisines.includes(cuisine)) {
      cuisines.push(cuisine);
    }
  }
  // Default to 'american' if no specific cuisine found
  return cuisines.length > 0 ? cuisines : ['american'];
}

// Calculate distance between two coordinates in miles
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Build photo URL from Google Places photo reference
function buildPhotoUrl(photoName: string, maxWidth = 800): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;
}

export async function POST(request: NextRequest) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: 'Google Places API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      lat,
      lng,
      radius = 8047, // Default 5 miles in meters
      cuisineTypes = [],
      minPrice,
      maxPrice,
    } = body;

    // Build the text query based on cuisine types
    let textQuery = 'restaurants';
    if (cuisineTypes.length > 0) {
      textQuery = cuisineTypes.join(' OR ') + ' restaurant';
    }

    // Use Google Places Text Search (New)
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';

    const searchBody = {
      textQuery,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius,
        },
      },
      includedType: 'restaurant',
      maxResultCount: 20,
      languageCode: 'en',
    };

    // Add price level filter if specified
    if (minPrice !== undefined || maxPrice !== undefined) {
      (searchBody as Record<string, unknown>).priceLevels = [];
      const levels = ['PRICE_LEVEL_FREE', 'PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE', 'PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'];
      const min = minPrice ?? 0;
      const max = maxPrice ?? 4;
      for (let i = min; i <= max; i++) {
        (searchBody as Record<string, unknown>).priceLevels = [
          ...((searchBody as Record<string, unknown>).priceLevels as string[]),
          levels[i],
        ];
      }
    }

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.photos,places.websiteUri,places.nationalPhoneNumber,places.currentOpeningHours,places.goodForChildren',
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch from Google Places API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const places = data.places || [];

    // Transform to our Restaurant format
    const restaurants: Restaurant[] = places.map((place: Record<string, unknown>) => {
      const location = place.location as { latitude: number; longitude: number };
      const photos = (place.photos as Array<{ name: string }>) || [];
      const displayName = place.displayName as { text: string };
      const types = (place.types as string[]) || [];
      const priceLevel = place.priceLevel as string | undefined;
      const openingHours = place.currentOpeningHours as { weekdayDescriptions?: string[] } | undefined;

      // Map Google's price level string to number
      let priceLevelNum = 2;
      if (priceLevel) {
        const priceLevelMap: Record<string, number> = {
          PRICE_LEVEL_FREE: 0,
          PRICE_LEVEL_INEXPENSIVE: 1,
          PRICE_LEVEL_MODERATE: 2,
          PRICE_LEVEL_EXPENSIVE: 3,
          PRICE_LEVEL_VERY_EXPENSIVE: 4,
        };
        priceLevelNum = priceLevelMap[priceLevel] ?? 2;
      }

      return {
        id: place.id as string,
        name: displayName?.text || 'Unknown Restaurant',
        rating: (place.rating as number) || 4.0,
        priceLevel: mapPriceLevel(priceLevelNum),
        cuisines: extractCuisines(types),
        address: (place.formattedAddress as string) || '',
        lat: location?.latitude,
        lng: location?.longitude,
        photos: photos.slice(0, 5).map((p) => buildPhotoUrl(p.name)),
        description: `${displayName?.text || 'Restaurant'} - ${extractCuisines(types).join(', ')}`,
        familyFriendly: (place.goodForChildren as boolean) ?? true,
        distanceMiles: location
          ? Math.round(calculateDistance(lat, lng, location.latitude, location.longitude) * 10) / 10
          : 0,
        phone: place.nationalPhoneNumber as string | undefined,
        website: place.websiteUri as string | undefined,
        hours: openingHours?.weekdayDescriptions?.join('\n'),
      } satisfies Restaurant;
    });

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error('Places search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
