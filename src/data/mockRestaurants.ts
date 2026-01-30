/**
 * Mock Restaurant Data
 *
 * This file contains mock restaurant data for development and testing.
 *
 * TODO: Replace with Google Places API / Yelp API integration
 *
 * To integrate with Google Places:
 * 1. Get an API key from Google Cloud Console
 * 2. Use the Nearby Search endpoint: https://maps.googleapis.com/maps/api/place/nearbysearch/json
 * 3. Map response fields to our Restaurant interface
 * 4. Use Place Photos API for images
 *
 * Example API call:
 * GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
 *   ?location=${lat},${lng}
 *   &radius=${distanceMeters}
 *   &type=restaurant
 *   &minprice=${minPrice}
 *   &maxprice=${maxPrice}
 *   &key=${API_KEY}
 */

import { Restaurant, CuisineType, PriceLevel } from '@/types';

// Placeholder images - using Unsplash for demo
const FOOD_IMAGES = {
  italian: [
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop',
  ],
  mexican: [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&h=600&fit=crop',
  ],
  japanese: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=600&fit=crop',
  ],
  american: [
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&h=600&fit=crop',
  ],
  chinese: [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  ],
  thai: [
    'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&h=600&fit=crop',
  ],
  indian: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop',
  ],
  mediterranean: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=800&h=600&fit=crop',
  ],
  seafood: [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop',
  ],
};

function getImagesForCuisine(cuisines: CuisineType[]): string[] {
  const primary = cuisines[0];
  return (
    FOOD_IMAGES[primary as keyof typeof FOOD_IMAGES] || FOOD_IMAGES.default
  );
}

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-001',
    name: "Tony's Trattoria",
    rating: 4.6,
    priceLevel: '$$',
    cuisines: ['italian', 'pizza'],
    address: '123 Main Street, Downtown',
    lat: 40.7128,
    lng: -74.006,
    photos: getImagesForCuisine(['italian']),
    description:
      'Authentic Italian cuisine with handmade pasta and wood-fired pizzas. Family recipes passed down through generations.',
    familyFriendly: true,
    distanceMiles: 1.2,
    phone: '(555) 123-4567',
  },
  {
    id: 'rest-002',
    name: 'Sakura Sushi',
    rating: 4.8,
    priceLevel: '$$$',
    cuisines: ['japanese', 'sushi'],
    address: '456 Oak Avenue, Midtown',
    lat: 40.7589,
    lng: -73.9851,
    photos: getImagesForCuisine(['japanese']),
    description:
      'Premium sushi and sashimi prepared by master chefs. Fresh fish flown in daily from Tokyo.',
    familyFriendly: true,
    distanceMiles: 2.4,
    phone: '(555) 234-5678',
  },
  {
    id: 'rest-003',
    name: 'El Mariachi',
    rating: 4.3,
    priceLevel: '$',
    cuisines: ['mexican'],
    address: '789 Elm Street, Westside',
    lat: 40.7282,
    lng: -74.0776,
    photos: getImagesForCuisine(['mexican']),
    description:
      'Vibrant Mexican cantina with house-made salsas, fresh guacamole, and signature margaritas.',
    familyFriendly: true,
    distanceMiles: 0.8,
    phone: '(555) 345-6789',
  },
  {
    id: 'rest-004',
    name: 'Golden Dragon',
    rating: 4.1,
    priceLevel: '$$',
    cuisines: ['chinese'],
    address: '321 Pine Road, Chinatown',
    lat: 40.7157,
    lng: -73.9972,
    photos: getImagesForCuisine(['chinese']),
    description:
      'Traditional Cantonese and Szechuan dishes. Famous for dim sum brunch on weekends.',
    familyFriendly: true,
    distanceMiles: 3.1,
    phone: '(555) 456-7890',
  },
  {
    id: 'rest-005',
    name: 'The Burger Joint',
    rating: 4.4,
    priceLevel: '$',
    cuisines: ['american', 'burgers'],
    address: '567 Cedar Lane, Uptown',
    lat: 40.7829,
    lng: -73.9654,
    photos: getImagesForCuisine(['american']),
    description:
      'Gourmet burgers made with grass-fed beef. Craft beers and hand-cut fries.',
    familyFriendly: true,
    distanceMiles: 1.5,
    phone: '(555) 567-8901',
  },
  {
    id: 'rest-006',
    name: 'Thai Orchid',
    rating: 4.5,
    priceLevel: '$$',
    cuisines: ['thai'],
    address: '890 Maple Drive, East Village',
    lat: 40.7264,
    lng: -73.9878,
    photos: getImagesForCuisine(['thai']),
    description:
      'Authentic Thai flavors with customizable spice levels. Beautiful garden patio seating.',
    familyFriendly: true,
    distanceMiles: 2.0,
    phone: '(555) 678-9012',
  },
  {
    id: 'rest-007',
    name: 'Bombay Palace',
    rating: 4.7,
    priceLevel: '$$',
    cuisines: ['indian'],
    address: '234 Birch Street, Little India',
    lat: 40.7451,
    lng: -73.9781,
    photos: getImagesForCuisine(['indian']),
    description:
      'Rich curries, tandoori specialties, and warm naan bread. Lunch buffet daily.',
    familyFriendly: true,
    distanceMiles: 2.8,
    phone: '(555) 789-0123',
  },
  {
    id: 'rest-008',
    name: 'Le Petit Bistro',
    rating: 4.9,
    priceLevel: '$$$$',
    cuisines: ['french', 'mediterranean'],
    address: '111 Fifth Avenue, Upper East',
    lat: 40.7614,
    lng: -73.967,
    photos: getImagesForCuisine(['mediterranean']),
    description:
      'Elegant French cuisine with seasonal tasting menus. Extensive wine collection.',
    familyFriendly: false,
    distanceMiles: 4.2,
    phone: '(555) 890-1234',
  },
  {
    id: 'rest-009',
    name: 'Seoul Kitchen',
    rating: 4.2,
    priceLevel: '$$',
    cuisines: ['korean'],
    address: '678 Walnut Street, Koreatown',
    lat: 40.748,
    lng: -73.9857,
    photos: getImagesForCuisine(['thai']), // Using similar Asian cuisine photos
    description:
      'Korean BBQ with tabletop grills. Banchan sides and authentic bibimbap.',
    familyFriendly: true,
    distanceMiles: 1.9,
    phone: '(555) 901-2345',
  },
  {
    id: 'rest-010',
    name: 'Catch of the Day',
    rating: 4.6,
    priceLevel: '$$$',
    cuisines: ['seafood', 'american'],
    address: '999 Harbor View, Waterfront',
    lat: 40.6892,
    lng: -74.0445,
    photos: getImagesForCuisine(['seafood']),
    description:
      'Fresh seafood with stunning harbor views. Lobster rolls and oyster bar.',
    familyFriendly: true,
    distanceMiles: 5.1,
    phone: '(555) 012-3456',
  },
  {
    id: 'rest-011',
    name: 'Pho Paradise',
    rating: 4.4,
    priceLevel: '$',
    cuisines: ['vietnamese'],
    address: '444 River Road, Riverside',
    lat: 40.7362,
    lng: -74.0005,
    photos: getImagesForCuisine(['thai']),
    description:
      'Steaming bowls of pho and fresh spring rolls. Quick, healthy, and delicious.',
    familyFriendly: true,
    distanceMiles: 1.1,
    phone: '(555) 234-5670',
  },
  {
    id: 'rest-012',
    name: 'Smokehouse BBQ',
    rating: 4.5,
    priceLevel: '$$',
    cuisines: ['bbq', 'american'],
    address: '777 Hickory Lane, Southside',
    lat: 40.7089,
    lng: -74.0163,
    photos: getImagesForCuisine(['american']),
    description:
      'Slow-smoked brisket, ribs, and pulled pork. House-made sauces and sides.',
    familyFriendly: true,
    distanceMiles: 2.3,
    phone: '(555) 345-6780',
  },
  {
    id: 'rest-013',
    name: 'Green Garden',
    rating: 4.3,
    priceLevel: '$$',
    cuisines: ['vegan', 'mediterranean'],
    address: '222 Sprout Street, Health District',
    lat: 40.7425,
    lng: -73.9892,
    photos: getImagesForCuisine(['mediterranean']),
    description:
      'Plant-based cuisine that delights. Creative dishes using locally sourced produce.',
    familyFriendly: true,
    distanceMiles: 1.7,
    phone: '(555) 456-7801',
  },
  {
    id: 'rest-014',
    name: "Nonna's Kitchen",
    rating: 4.7,
    priceLevel: '$$',
    cuisines: ['italian'],
    address: '555 Grapevine Way, Little Italy',
    lat: 40.7195,
    lng: -73.9977,
    photos: getImagesForCuisine(['italian']),
    description:
      'Home-style Italian cooking like grandma made. Sunday gravy and fresh cannoli.',
    familyFriendly: true,
    distanceMiles: 2.5,
    phone: '(555) 567-8902',
  },
  {
    id: 'rest-015',
    name: 'Athens Taverna',
    rating: 4.4,
    priceLevel: '$$',
    cuisines: ['greek', 'mediterranean'],
    address: '888 Olympic Boulevard, Greektown',
    lat: 40.7538,
    lng: -73.9735,
    photos: getImagesForCuisine(['mediterranean']),
    description:
      'Greek classics with a modern twist. Lamb souvlaki and flaming saganaki.',
    familyFriendly: true,
    distanceMiles: 3.4,
    phone: '(555) 678-9013',
  },
  {
    id: 'rest-016',
    name: 'Morning Glory',
    rating: 4.6,
    priceLevel: '$',
    cuisines: ['breakfast', 'american'],
    address: '333 Sunrise Avenue, Eastside',
    lat: 40.7306,
    lng: -73.9866,
    photos: getImagesForCuisine(['american']),
    description:
      'All-day breakfast spot. Fluffy pancakes, eggs benedict, and artisan coffee.',
    familyFriendly: true,
    distanceMiles: 0.9,
    phone: '(555) 789-0124',
  },
  {
    id: 'rest-017',
    name: 'Sweet Surrender',
    rating: 4.8,
    priceLevel: '$$',
    cuisines: ['dessert', 'french'],
    address: '666 Sugar Lane, Pastry Row',
    lat: 40.7485,
    lng: -73.9856,
    photos: getImagesForCuisine(['mediterranean']),
    description:
      'Artisan desserts and French pastries. Perfect for a sweet date night.',
    familyFriendly: true,
    distanceMiles: 2.1,
    phone: '(555) 890-1235',
  },
  {
    id: 'rest-018',
    name: 'Flame & Fire',
    rating: 4.5,
    priceLevel: '$$$$',
    cuisines: ['american', 'bbq'],
    address: '1000 Steakhouse Road, Financial District',
    lat: 40.7075,
    lng: -74.0089,
    photos: getImagesForCuisine(['american']),
    description:
      'Premium steakhouse with dry-aged beef. Upscale dining with impeccable service.',
    familyFriendly: false,
    distanceMiles: 3.8,
    phone: '(555) 901-2346',
  },
  {
    id: 'rest-019',
    name: 'Taco Time',
    rating: 4.0,
    priceLevel: '$',
    cuisines: ['mexican'],
    address: '121 Fiesta Street, Arts District',
    lat: 40.7245,
    lng: -73.9969,
    photos: getImagesForCuisine(['mexican']),
    description:
      'Quick and tasty tacos with creative toppings. Late night hours on weekends.',
    familyFriendly: true,
    distanceMiles: 0.5,
    phone: '(555) 012-3457',
  },
  {
    id: 'rest-020',
    name: 'Sushi Express',
    rating: 4.2,
    priceLevel: '$$',
    cuisines: ['japanese', 'sushi'],
    address: '454 Fast Lane, Business Park',
    lat: 40.7512,
    lng: -73.9754,
    photos: getImagesForCuisine(['japanese']),
    description:
      'Conveyor belt sushi with fresh daily selections. Quick lunch favorite.',
    familyFriendly: true,
    distanceMiles: 1.8,
    phone: '(555) 123-4568',
  },
];

/**
 * Get all available restaurants
 * In production, this would call the Google Places API
 */
export function getAllRestaurants(): Restaurant[] {
  return mockRestaurants;
}

/**
 * Get a restaurant by ID
 */
export function getRestaurantById(id: string): Restaurant | undefined {
  return mockRestaurants.find((r) => r.id === id);
}
