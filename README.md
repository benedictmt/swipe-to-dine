# Swipe to Dine

A sleek, mobile-first web application for deciding where to eat together. Swipe right on restaurants you'd consider, and when everyone agrees, it's a match!

## Features

- **Dining Filters**: Set preferences for rating, distance, price, cuisine, and family-friendliness
- **Group Profiles**: Create and manage diner profiles with cuisine preferences
- **Dual Attendance Modes**:
  - **Remote**: Diners participate from their own devices
  - **On-Deck**: Pass-the-phone mode for in-person groups
- **Swipe Cards**: Tinder-style swiping with beautiful restaurant cards
- **Consensus Tracking**: Real-time vote status for all diners
- **Unanimous Match**: Celebration when everyone agrees
- **Wildcard Feature**: "Let Fate Decide" wheel spinner when you can't agree
- **Invite System**: Share invite links for remote participants

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/swipe-to-dine.git
cd swipe-to-dine

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # / - Filters page
│   ├── group/             # /group - Profile selection
│   ├── instructions/      # /instructions - How to swipe
│   ├── swipe/             # /swipe - Main swiping experience
│   ├── match/             # /match - Match celebration
│   └── invite/[id]/       # /invite/[id] - Accept invite
├── components/
│   ├── ui/                # Reusable UI components
│   ├── common/            # Logo, PhotoCarousel, animations
│   ├── group/             # Profile forms, diner lists
│   └── swipe/             # Swipe cards, vote buttons
├── stores/                # Zustand state management
│   ├── useFilterStore.ts  # Dining filter preferences
│   ├── useProfileStore.ts # User profiles (LocalStorage)
│   ├── usePartyStore.ts   # Party/session state
│   └── useLocationStore.ts # Geolocation
├── services/
│   └── restaurantService.ts # Restaurant search & ranking
├── data/
│   └── mockRestaurants.ts # Mock restaurant data
├── types/
│   └── index.ts           # TypeScript interfaces
└── utils/
    └── helpers.ts         # Utility functions
```

## State Management

### Profile Store
User profiles are persisted in LocalStorage:
- Name, phone, age, avatar
- Cuisine preferences (-2 to +2 scale)

### Party Store
Session state for a dining decision:
- Selected diners and attendance modes
- Votes per restaurant per diner
- Match tracking

### Filter Store
Dining preferences (persisted):
- Min rating (1-5)
- Max distance (1-25 miles)
- Price range ($-$$$$)
- Cuisine types
- Family-friendly filter

## Integrating Real APIs

### Replace Mock Restaurant Data

The mock data is in `src/data/mockRestaurants.ts` and the service is in `src/services/restaurantService.ts`.

#### Google Places API

```typescript
// Example integration in restaurantService.ts
async function searchRestaurants(params: SearchParams): Promise<Restaurant[]> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${params.lat},${params.lng}` +
    `&radius=${params.maxDistance * 1609}` + // Convert miles to meters
    `&type=restaurant` +
    `&minprice=${minPrice}&maxprice=${maxPrice}` +
    `&key=${GOOGLE_API_KEY}`
  );

  const data = await response.json();
  return data.results.map(mapGooglePlaceToRestaurant);
}
```

#### Yelp Fusion API

```typescript
async function searchRestaurants(params: SearchParams): Promise<Restaurant[]> {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search` +
    `?latitude=${params.lat}&longitude=${params.lng}` +
    `&radius=${params.maxDistance * 1609}` +
    `&categories=restaurants` +
    `&price=${priceFilter}`,
    {
      headers: { Authorization: `Bearer ${YELP_API_KEY}` }
    }
  );

  const data = await response.json();
  return data.businesses.map(mapYelpBusinessToRestaurant);
}
```

### Replace LocalStorage with Backend

For real-time multiplayer support, replace the LocalStorage-based stores with:

#### Supabase (Recommended)

```typescript
// Example: Real-time party sync with Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Subscribe to party changes
supabase
  .channel('party:' + partyId)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'party_votes' },
    (payload) => {
      // Update local state with new votes
    })
  .subscribe();

// Record a vote
await supabase
  .from('party_votes')
  .insert({ party_id, diner_id, restaurant_id, vote });
```

#### Firebase Realtime Database

```typescript
import { ref, onValue, set } from 'firebase/database';

// Listen for party changes
const partyRef = ref(db, `parties/${partyId}`);
onValue(partyRef, (snapshot) => {
  const data = snapshot.val();
  // Update local state
});

// Record a vote
await set(ref(db, `parties/${partyId}/votes/${restaurantId}/${dinerId}`), vote);
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dining filters |
| `/group` | Profile selection & attendance modes |
| `/instructions` | How to swipe |
| `/swipe` | Main swiping experience |
| `/match` | Match celebration & actions |
| `/invite/[id]` | Accept invite & join party |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Animations**: Framer Motion
- **Storage**: LocalStorage (mock backend)

## Environment Variables

For production with real APIs:

```env
# Google Places API
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here

# OR Yelp Fusion API
YELP_API_KEY=your_key_here

# Supabase (for real-time backend)
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Restaurant images from [Unsplash](https://unsplash.com)
- Icons from [Heroicons](https://heroicons.com)
