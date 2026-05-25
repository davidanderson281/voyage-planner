export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTime: string;
  returnAirline?: string;
  returnFlightNumber?: string;
  returnDepartureAirport?: string;
  returnDepartureTime?: string;
  returnArrivalAirport?: string;
  returnArrivalTime?: string;
  cost: number;
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  nights: number;
  totalCost: number;
  link: string;
  isSelected: boolean;
}

export interface Activity {
  id: string;
  name: string;
  day: number; // 0 for unscheduled, 1+ for specific trip day
  time: string; // "14:30"
  cost: number;
  category: 'Sightseeing' | 'Dining' | 'Adventure' | 'Transport' | 'Shopping' | 'Misc';
  notes: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: 'Essentials' | 'Clothing' | 'Electronics' | 'Toiletries' | 'Misc';
  isPacked: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  currencySymbol: string;
  flights: Flight[];
  hotels: Hotel[];
  activities: Activity[];
  packingList: PackingItem[];
  notes: string;
}
