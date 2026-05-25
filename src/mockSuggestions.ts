import { Activity, PackingItem } from './types';

export interface WeatherDay {
  day: string;
  temp: number;
  condition: string;
  icon: string;
}

export interface DestinationSuggestion {
  currency: string;
  currencySymbol: string;
  weather: WeatherDay[];
  advice: string;
  packingList: Omit<PackingItem, 'id' | 'isPacked'>[];
  activities: Omit<Activity, 'id'>[];
}

export const getSuggestions = (destination: string): DestinationSuggestion => {
  const destLower = destination.toLowerCase().trim();

  // Tokyo
  if (destLower.includes('tokyo') || destLower.includes('japan')) {
    return {
      currency: 'JPY',
      currencySymbol: '¥',
      weather: [
        { day: 'Day 1', temp: 22, condition: 'Sunny', icon: '☀️' },
        { day: 'Day 2', temp: 20, condition: 'Partly Cloudy', icon: '⛅' },
        { day: 'Day 3', temp: 18, condition: 'Showers', icon: '🌧️' },
        { day: 'Day 4', temp: 21, condition: 'Sunny', icon: '☀️' }
      ],
      advice: 'Tokyo is highly cash-oriented for small shops, so carry yen. Purchase a Pasmo or Suica card for seamless subway transport. Respect quiet rules on public transport and download offline translation apps.',
      packingList: [
        { name: 'Suica/Pasmo transit card', category: 'Essentials' },
        { name: 'Slip-on shoes (for shrines/restaurants)', category: 'Clothing' },
        { name: 'Pocket Wi-Fi or eSIM registration', category: 'Electronics' },
        { name: 'Universal power adapter (Type A)', category: 'Electronics' },
        { name: 'Hand towel (many public restrooms lack dryers)', category: 'Toiletries' },
        { name: 'Cash (Yen banknotes)', category: 'Essentials' }
      ],
      activities: [
        { name: 'TeamLab Planets Digital Art Museum', day: 1, time: '10:00', cost: 3800, category: 'Sightseeing', notes: 'Incredible digital light projections. Book tickets weeks in advance!' },
        { name: 'Sushi Dinner in Tsukiji Outer Market', day: 1, time: '18:30', cost: 6000, category: 'Dining', notes: 'Freshly prepared sashimi and premium sushi rolls.' },
        { name: 'Explore Senso-ji Temple in Asakusa', day: 2, time: '09:00', cost: 0, category: 'Sightseeing', notes: 'Tokyo\'s oldest and most iconic Buddhist temple.' },
        { name: 'Shibuya Crossing & Hachiko Statue', day: 2, time: '16:00', cost: 0, category: 'Sightseeing', notes: 'Observe the world\'s busiest pedestrian intersection from a cafe overhead.' },
        { name: 'Meiji Jingu Shrine & Harajuku Walk', day: 3, time: '11:00', cost: 0, category: 'Sightseeing', notes: 'Tranquil forested shrine adjacent to the vibrant Takeshita Street.' },
        { name: 'Ramen Tasting in Shinjuku Golden Gai', day: 3, time: '20:00', cost: 1500, category: 'Dining', notes: 'Cozy, traditional narrow alleys packed with tiny micro-bars.' }
      ]
    };
  }

  // Paris
  if (destLower.includes('paris') || destLower.includes('france')) {
    return {
      currency: 'EUR',
      currencySymbol: '€',
      weather: [
        { day: 'Day 1', temp: 19, condition: 'Clear', icon: '☀️' },
        { day: 'Day 2', temp: 17, condition: 'Windy', icon: '💨' },
        { day: 'Day 3', temp: 16, condition: 'Rainy', icon: '🌧️' },
        { day: 'Day 4', temp: 18, condition: 'Overcast', icon: '☁️' }
      ],
      advice: 'Learn basic French greetings ("Bonjour", "Merci") to instantly gain warmer service. Watch out for pickpockets in heavy tourist zones near the Eiffel Tower and Louvre. Use the metro system, it is fast and dense.',
      packingList: [
        { name: 'Comfortable walking shoes', category: 'Clothing' },
        { name: 'Light rain jacket or umbrella', category: 'Clothing' },
        { name: 'European Type C/E adapter', category: 'Electronics' },
        { name: 'Crossbody anti-theft bag', category: 'Essentials' },
        { name: 'Louvre pre-booked museum ticket', category: 'Essentials' }
      ],
      activities: [
        { name: 'Louvre Museum Guided Tour', day: 1, time: '09:30', cost: 22, category: 'Sightseeing', notes: 'See the Mona Lisa and Winged Victory. Book early!' },
        { name: 'Croissants & Coffee at Cafe de Flore', day: 1, time: '14:30', cost: 15, category: 'Dining', notes: 'Historic intellectual hub in Saint-Germain-des-Prés.' },
        { name: 'Eiffel Tower Summit Access', day: 2, time: '19:00', cost: 28, category: 'Sightseeing', notes: 'Magnificent panoramic views of the city lights sparkling.' },
        { name: 'Seine River Sunset Cruise', day: 2, time: '21:00', cost: 18, category: 'Adventure', notes: '1-hour boat tour showing historical bridges and illuminated monuments.' },
        { name: 'Stroll through Montmartre & Sacré-Cœur', day: 3, time: '10:00', cost: 0, category: 'Sightseeing', notes: 'Vibrant artist square and breath-taking views from the white dome.' },
        { name: 'French Bistro Dinner', day: 3, time: '20:30', cost: 50, category: 'Dining', notes: 'Indulge in duck confit, escargot, and Bordeaux wine.' }
      ]
    };
  }

  // London
  if (destLower.includes('london') || destLower.includes('uk') || destLower.includes('united kingdom') || destLower.includes('england')) {
    return {
      currency: 'GBP',
      currencySymbol: '£',
      weather: [
        { day: 'Day 1', temp: 17, condition: 'Partly Cloudy', icon: '⛅' },
        { day: 'Day 2', temp: 15, condition: 'Showers', icon: '🌧️' },
        { day: 'Day 3', temp: 18, condition: 'Sunny Spells', icon: '⛅' },
        { day: 'Day 4', temp: 19, condition: 'Mostly Sunny', icon: '☀️' }
      ],
      advice: 'No need for Oyster cards; just tap in and out of the Tube using contactless bank cards or Apple/Google Pay. Standard service tip is 12.5% (often added automatically). Always carry an umbrella!',
      packingList: [
        { name: 'Windproof umbrella', category: 'Clothing' },
        { name: 'UK Type G 3-pin adapter', category: 'Electronics' },
        { name: 'Contactless payment method', category: 'Essentials' },
        { name: 'Layered clothing (weather changes fast)', category: 'Clothing' }
      ],
      activities: [
        { name: 'British Museum Exploration', day: 1, time: '10:00', cost: 0, category: 'Sightseeing', notes: 'Admire the Rosetta Stone and Egyptian mummies. Entry is free!' },
        { name: 'Traditional Fish & Chips Lunch', day: 1, time: '13:00', cost: 18, category: 'Dining', notes: 'Enjoy crispy battered cod with mushy peas at a local pub.' },
        { name: 'Tower of London & Crown Jewels', day: 2, time: '09:30', cost: 33, category: 'Sightseeing', notes: 'Learn about royal history, prisoners, and the resident ravens.' },
        { name: 'West End Musical Theatre Show', day: 2, time: '19:30', cost: 65, category: 'Adventure', notes: 'Catch a high-profile production in the Theatreland district.' },
        { name: 'Sky Garden Panoramic View', day: 3, time: '15:00', cost: 0, category: 'Sightseeing', notes: 'Free garden observation deck. Must book ticket slot online in advance.' }
      ]
    };
  }

  // Edinburgh (Reference to previous marathon conversation could trigger interest)
  if (destLower.includes('edinburgh') || destLower.includes('scotland')) {
    return {
      currency: 'GBP',
      currencySymbol: '£',
      weather: [
        { day: 'Day 1', temp: 14, condition: 'Overcast', icon: '☁️' },
        { day: 'Day 2', temp: 12, condition: 'Drizzle', icon: '🌧️' },
        { day: 'Day 3', temp: 15, condition: 'Clearing', icon: '⛅' },
        { day: 'Day 4', temp: 13, condition: 'Chilly/Sunny', icon: '☀️' }
      ],
      advice: 'The city is hilly and cobbled, so proper footwear is essential. Edinburgh Castle dominates the skyline—book online. Try local specialties like haggis or sample single malt Scotch whisky in the Grassmarket.',
      packingList: [
        { name: 'Sturdy waterproof walking boots', category: 'Clothing' },
        { name: 'Warm fleece or windbreaker', category: 'Clothing' },
        { name: 'UK Type G plug adapter', category: 'Electronics' },
        { name: 'Reusable water bottle', category: 'Essentials' }
      ],
      activities: [
        { name: 'Edinburgh Castle Tour', day: 1, time: '09:30', cost: 21, category: 'Sightseeing', notes: 'Historic fortress sitting on Castle Rock.' },
        { name: 'Hike Arthur\'s Seat', day: 1, time: '14:00', cost: 0, category: 'Adventure', notes: 'Extinct volcano in Holyrood Park providing panoramic views of the city.' },
        { name: 'Whisky Masterclass on the Royal Mile', day: 2, time: '17:00', cost: 45, category: 'Dining', notes: 'Sample and learn to identify regions of Scotch whisky.' },
        { name: 'Real Mary King\'s Close Underground Tour', day: 3, time: '11:00', cost: 23, category: 'Sightseeing', notes: 'Explore buried 17th-century streets under the Royal Mile.' },
        { name: 'Traditional Scottish Pub Supper', day: 3, time: '19:30', cost: 25, category: 'Dining', notes: 'Taste haggis, neeps, and tatties accompanied by live folk music.' }
      ]
    };
  }

  // Default / Generic Destination
  return {
    currency: 'USD',
    currencySymbol: '$',
    weather: [
      { day: 'Day 1', temp: 24, condition: 'Sunny', icon: '☀️' },
      { day: 'Day 2', temp: 25, condition: 'Sunny', icon: '☀️' },
      { day: 'Day 3', temp: 23, condition: 'Partly Cloudy', icon: '⛅' },
      { day: 'Day 4', temp: 22, condition: 'Clear', icon: '☀️' }
    ],
    advice: 'Research local transport options and download offline maps. Register with your embassy if traveling internationally. Always have travel insurance covering medical emergencies and trip disruptions.',
    packingList: [
      { name: 'Passport & Travel Documents', category: 'Essentials' },
      { name: 'Toothbrush & Toiletries kit', category: 'Toiletries' },
      { name: 'Universal power adapter', category: 'Electronics' },
      { name: 'Phone charger & power bank', category: 'Electronics' },
      { name: 'Prescription medications', category: 'Essentials' },
      { name: 'Comfortable outfits & layers', category: 'Clothing' }
    ],
    activities: [
      { name: 'City Center Orientation Walk', day: 1, time: '10:00', cost: 0, category: 'Sightseeing', notes: 'Familiarize yourself with major landmarks and layout.' },
      { name: 'Welcome Dinner at Highly-Rated Restaurant', day: 1, time: '19:00', cost: 40, category: 'Dining', notes: 'Savor regional culinary specialties.' },
      { name: 'Main Museum or Landmark Tour', day: 2, time: '10:00', cost: 20, category: 'Sightseeing', notes: 'Pre-book online to skip ticketing lines.' },
      { name: 'Scenic Park Stroll or Local Adventure', day: 2, time: '15:00', cost: 5, category: 'Adventure', notes: 'Great spots for photography and relaxing.' },
      { name: 'Local Souvenir and Boutique Shopping', day: 3, time: '14:00', cost: 0, category: 'Shopping', notes: 'Support local artisans and vendors.' }
    ]
  };
};
