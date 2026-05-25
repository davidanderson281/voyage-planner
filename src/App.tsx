import { useState, useEffect } from 'react';
import { Trip, Flight, Hotel, Activity, PackingItem } from './types';
import { Sidebar } from './components/Sidebar';
import { CostSection } from './components/CostSection';
import { FlightSection } from './components/FlightSection';
import { HotelSection } from './components/HotelSection';
import { ItinerarySection } from './components/ItinerarySection';
import { PackingSection } from './components/PackingSection';
import { AiAssistant } from './components/AiAssistant';
import { Calendar, MapPin, Plane, CheckSquare, AlertCircle } from 'lucide-react';

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'tokyo-demo',
    destination: 'Tokyo, Japan',
    startDate: '2026-10-15',
    endDate: '2026-10-22',
    budget: 6500,
    currency: 'JPY',
    currencySymbol: '¥',
    flights: [
      {
        id: 'flight-1',
        airline: 'All Nippon Airways',
        flightNumber: 'NH212',
        departureAirport: 'LHR',
        departureTime: '2026-10-15T19:00',
        arrivalAirport: 'HND',
        arrivalTime: '2026-10-16T15:00',
        returnAirline: 'All Nippon Airways',
        returnFlightNumber: 'NH211',
        returnDepartureAirport: 'HND',
        returnDepartureTime: '2026-10-22T11:30',
        returnArrivalAirport: 'LHR',
        returnArrivalTime: '2026-10-22T16:20',
        cost: 950
      }
    ],
    hotels: [
      {
        id: 'hotel-1',
        name: 'Park Hyatt Tokyo',
        rating: 5,
        pricePerNight: 420,
        nights: 7,
        totalCost: 2940,
        link: 'https://www.hyatt.com/en-US/hotel/japan/park-hyatt-tokyo/tyoph',
        isSelected: true
      },
      {
        id: 'hotel-2',
        name: 'Shinjuku Granbell Hotel',
        rating: 4,
        pricePerNight: 160,
        nights: 7,
        totalCost: 1120,
        link: 'https://www.granbellhotel.jp/en/shinjuku/',
        isSelected: false
      }
    ],
    activities: [
      { id: 'act-1', name: 'TeamLab Planets Digital Museum', day: 1, time: '11:00', cost: 25, category: 'Sightseeing', notes: 'Booked. Wear trousers that can be rolled up above knees.' },
      { id: 'act-2', name: 'Sushi Omakase Dinner', day: 1, time: '19:30', cost: 120, category: 'Dining', notes: 'Reservation under Anderson.' },
      { id: 'act-3', name: 'Hike Mount Takao', day: 3, time: '08:30', cost: 15, category: 'Adventure', notes: 'Take Keio line train from Shinjuku.' },
      { id: 'act-4', name: 'Shopping in Akihabara Electric Town', day: 4, time: '14:00', cost: 50, category: 'Shopping', notes: 'Check out retro game stores.' }
    ],
    packingList: [
      { id: 'pack-1', name: 'Passport & Visa confirmation', category: 'Essentials', isPacked: true },
      { id: 'pack-2', name: 'Pocket Wi-Fi reservation QR code', category: 'Essentials', isPacked: true },
      { id: 'pack-3', name: 'Comfortable trainers', category: 'Clothing', isPacked: false },
      { id: 'pack-4', name: 'Type A electrical adapter', category: 'Electronics', isPacked: true },
      { id: 'pack-5', name: 'Yen cash banknotes', category: 'Essentials', isPacked: false }
    ],
    notes: 'Remember to download Suica card to Apple Wallet before landing!'
  },
  {
    id: 'paris-demo',
    destination: 'Paris, France',
    startDate: '2026-07-02',
    endDate: '2026-07-06',
    budget: 2000,
    currency: 'EUR',
    currencySymbol: '€',
    flights: [],
    hotels: [],
    activities: [],
    packingList: [],
    notes: 'Weekend getaway to see museums.'
  }
];

function App() {
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('voyage_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [activeTripId, setActiveTripId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('voyage_active_trip_id');
    if (savedId) return savedId;
    return INITIAL_TRIPS.length > 0 ? INITIAL_TRIPS[0].id : null;
  });

  const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'packing'>('details');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('color-scheme') as 'dark' | 'light';
    return savedTheme || 'dark';
  });

  // Save trips state to localStorage
  useEffect(() => {
    localStorage.setItem('voyage_trips', JSON.stringify(trips));
  }, [trips]);

  // Save active trip ID state to localStorage
  useEffect(() => {
    if (activeTripId) {
      localStorage.setItem('voyage_active_trip_id', activeTripId);
    }
  }, [activeTripId]);

  // Sync theme to DOM element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('color-scheme', theme);
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAddTrip = (destination: string) => {
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      destination,
      startDate: '',
      endDate: '',
      budget: 3000,
      currency: 'USD',
      currencySymbol: '$',
      flights: [],
      hotels: [],
      activities: [],
      packingList: [],
      notes: ''
    };
    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
  };

  const handleDeleteTrip = (id: string) => {
    if (trips.length <= 1) {
      alert('Keep at least one trip idea on your planner!');
      return;
    }
    const filtered = trips.filter(t => t.id !== id);
    setTrips(filtered);
    if (activeTripId === id) {
      setActiveTripId(filtered[0].id);
    }
  };

  const handleCloneTrip = (id: string) => {
    const target = trips.find(t => t.id === id);
    if (!target) return;
    const cloned: Trip = {
      ...target,
      id: `trip-${Date.now()}`,
      destination: `Copy of ${target.destination}`,
      flights: target.flights.map(f => ({ ...f, id: `flight-${Date.now()}-${Math.random()}` })),
      hotels: target.hotels.map(h => ({ ...h, id: `hotel-${Date.now()}-${Math.random()}` })),
      activities: target.activities.map(a => ({ ...a, id: `act-${Date.now()}-${Math.random()}` })),
      packingList: target.packingList.map(p => ({ ...p, id: `pack-${Date.now()}-${Math.random()}` }))
    };
    setTrips(prev => [cloned, ...prev]);
    setActiveTripId(cloned.id);
  };

  const handleUpdateTripMeta = (id: string, fields: Partial<Pick<Trip, 'destination' | 'startDate' | 'endDate' | 'notes' | 'currency' | 'currencySymbol'>>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t));
  };

  const handleUpdateBudget = (id: string, budget: number) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, budget } : t));
  };

  // Flights operations
  const handleAddFlight = (tripId: string, flightData: Omit<Flight, 'id'>) => {
    const newFlight: Flight = { ...flightData, id: `flight-${Date.now()}` };
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, flights: [...t.flights, newFlight] } : t));
  };

  const handleDeleteFlight = (tripId: string, id: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, flights: t.flights.filter(f => f.id !== id) } : t));
  };

  const handleUpdateFlight = (tripId: string, updatedFlight: Flight) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, flights: t.flights.map(f => f.id === updatedFlight.id ? updatedFlight : f) } : t));
  };

  // Hotels operations
  const handleAddHotel = (tripId: string, hotelData: Omit<Hotel, 'id'>) => {
    const newHotel: Hotel = { ...hotelData, id: `hotel-${Date.now()}` };
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, hotels: [...t.hotels, newHotel] } : t));
  };

  const handleDeleteHotel = (tripId: string, id: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, hotels: t.hotels.filter(h => h.id !== id) } : t));
  };

  const handleUpdateHotel = (tripId: string, updatedHotel: Hotel) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, hotels: t.hotels.map(h => h.id === updatedHotel.id ? updatedHotel : h) } : t));
  };

  const handleSelectHotel = (tripId: string, id: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? {
      ...t,
      hotels: t.hotels.map(h => ({ ...h, isSelected: h.id === id }))
    } : t));
  };

  // Activities operations
  const handleAddActivity = (tripId: string, actData: Omit<Activity, 'id'>) => {
    const newAct: Activity = { ...actData, id: `act-${Date.now()}` };
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, activities: [...t.activities, newAct] } : t));
  };

  const handleDeleteActivity = (tripId: string, id: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, activities: t.activities.filter(a => a.id !== id) } : t));
  };

  const handleUpdateActivity = (tripId: string, updatedAct: Activity) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, activities: t.activities.map(a => a.id === updatedAct.id ? updatedAct : a) } : t));
  };

  // Packing list operations
  const handleAddPackingItem = (tripId: string, itemData: Omit<PackingItem, 'id' | 'isPacked'>) => {
    const newItem: PackingItem = { ...itemData, id: `pack-${Date.now()}`, isPacked: false };
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, packingList: [...t.packingList, newItem] } : t));
  };

  const handleTogglePackingItem = (tripId: string, id: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? {
      ...t,
      packingList: t.packingList.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item)
    } : t));
  };

  const handleDeletePackingItem = (tripId: string, id: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, packingList: t.packingList.filter(item => item.id !== id) } : t));
  };

  // AI Import actions
  const handleImportActivities = (tripId: string, newActs: Omit<Activity, 'id'>[]) => {
    const populated = newActs.map((a, idx) => ({ ...a, id: `act-ai-${Date.now()}-${idx}` }));
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, activities: [...t.activities, ...populated] } : t));
  };

  const handleImportPacking = (tripId: string, newItems: Omit<PackingItem, 'id' | 'isPacked'>[]) => {
    const populated = newItems.map((item, idx) => ({ ...item, id: `pack-ai-${Date.now()}-${idx}`, isPacked: false }));
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, packingList: [...t.packingList, ...populated] } : t));
  };

  const handleImportCurrency = (tripId: string, currency: string, symbol: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, currency, currencySymbol: symbol } : t));
  };

  const activeTrip = trips.find(t => t.id === activeTripId) || null;

  return (
    <div className="app-container">
      <Sidebar
        trips={trips}
        activeTripId={activeTripId}
        onSelectTrip={setActiveTripId}
        onAddTrip={handleAddTrip}
        onDeleteTrip={handleDeleteTrip}
        onCloneTrip={handleCloneTrip}
        onUpdateBudget={handleUpdateBudget}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-content">
        {activeTrip ? (
          <>
            {/* Header section with destination info and dates */}
            <header className="header-bar">
              <div className="header-title-section" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} style={{ color: 'var(--color-accent)' }} />
                  <input
                    type="text"
                    value={activeTrip.destination}
                    onChange={(e) => handleUpdateTripMeta(activeTrip.id, { destination: e.target.value })}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '1px dashed transparent',
                      fontSize: '22px',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-heading)',
                      padding: '0 2px',
                      outline: 'none',
                      width: '60%',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    onFocus={(e) => e.target.style.borderBottomColor = 'var(--color-accent)'}
                    onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                    placeholder="Enter Destination"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Calendar size={13} />
                    <input
                      type="date"
                      value={activeTrip.startDate}
                      onChange={(e) => handleUpdateTripMeta(activeTrip.id, { startDate: e.target.value })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        fontSize: 'inherit',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={activeTrip.endDate}
                      onChange={(e) => handleUpdateTripMeta(activeTrip.id, { endDate: e.target.value })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        fontSize: 'inherit',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Trip Currency Picker */}
              <div className="header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Currency:</span>
                  <select 
                    value={`${activeTrip.currency}:${activeTrip.currencySymbol}`}
                    onChange={(e) => {
                      const [code, symbol] = e.target.value.split(':');
                      handleUpdateTripMeta(activeTrip.id, { currency: code, currencySymbol: symbol });
                    }}
                    className="form-control"
                    style={{ padding: '4px 8px', width: '90px', fontSize: '12px' }}
                  >
                    <option value="GBP:£">GBP (£)</option>
                    <option value="EUR:€">EUR (€)</option>
                    <option value="USD:$">USD ($)</option>
                    <option value="JPY:¥">JPY (¥)</option>
                    <option value="AUD:A$">AUD (A$)</option>
                    <option value="CAD:C$">CAD (C$)</option>
                  </select>
                </div>
              </div>
            </header>

            {/* Split layout: Editor Panel & Summary Dashboard */}
            <div className="dashboard-grid">
              
              {/* Left Column: Config tabs */}
              <section className="planner-panel scroller">
                <nav className="navigation-tabs">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  >
                    <Plane size={15} /> Flights & Lodging
                  </button>
                  <button 
                    onClick={() => setActiveTab('itinerary')}
                    className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
                  >
                    <Calendar size={15} /> Travel Itinerary
                  </button>
                  <button 
                    onClick={() => setActiveTab('packing')}
                    className={`tab-btn ${activeTab === 'packing' ? 'active' : ''}`}
                  >
                    <CheckSquare size={15} /> Suitcase Packing
                  </button>
                </nav>

                {/* Sub Tab View switcher */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {activeTab === 'details' && (
                    <>
                      <FlightSection 
                        trip={activeTrip}
                        onAddFlight={handleAddFlight}
                        onDeleteFlight={handleDeleteFlight}
                        onUpdateFlight={handleUpdateFlight}
                      />
                      <HotelSection 
                        trip={activeTrip}
                        onAddHotel={handleAddHotel}
                        onDeleteHotel={handleDeleteHotel}
                        onUpdateHotel={handleUpdateHotel}
                        onSelectHotel={handleSelectHotel}
                      />
                    </>
                  )}

                  {activeTab === 'itinerary' && (
                    <ItinerarySection 
                      trip={activeTrip}
                      onAddActivity={handleAddActivity}
                      onDeleteActivity={handleDeleteActivity}
                      onUpdateActivity={handleUpdateActivity}
                    />
                  )}

                  {activeTab === 'packing' && (
                    <PackingSection 
                      trip={activeTrip}
                      onAddPackingItem={handleAddPackingItem}
                      onTogglePackingItem={handleTogglePackingItem}
                      onDeletePackingItem={handleDeletePackingItem}
                    />
                  )}
                </div>
              </section>

              {/* Right Column: Financial Charting & AI suggest engine */}
              <section className="summary-panel scroller">
                <CostSection trip={activeTrip} />
                
                <AiAssistant 
                  trip={activeTrip}
                  onImportActivities={handleImportActivities}
                  onImportPacking={handleImportPacking}
                  onImportCurrency={handleImportCurrency}
                />

                {/* General notes panel */}
                <div className="glass-card fade-in-up">
                  <h3 className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    📝 Trip Notes
                  </h3>
                  <textarea
                    value={activeTrip.notes || ''}
                    onChange={(e) => handleUpdateTripMeta(activeTrip.id, { notes: e.target.value })}
                    placeholder="General travel notes, visa details, contact info..."
                    rows={4}
                    className="form-control"
                    style={{ fontSize: '13px', resize: 'vertical' }}
                  />
                </div>
              </section>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '12px',
            color: 'var(--text-muted)'
          }}>
            <AlertCircle size={32} />
            <p>Select a trip idea or create one to begin planning!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
