import { useState, useEffect } from 'react';
import { Trip, Flight, Hotel, Activity, PackingItem } from './types';
import { Sidebar } from './components/Sidebar';
import { CostSection } from './components/CostSection';
import { FlightSection } from './components/FlightSection';
import { HotelSection } from './components/HotelSection';
import { ItinerarySection } from './components/ItinerarySection';
import { PackingSection } from './components/PackingSection';
import { AiAssistant } from './components/AiAssistant';
import { AuthModal } from './components/AuthModal';
import { auth, db, hasFirebase } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { Calendar, MapPin, Plane, CheckSquare, AlertCircle, Cloud } from 'lucide-react';

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'tokyo-demo',
    userId: null,
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
    userId: null,
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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'packing'>('details');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('color-scheme') as 'dark' | 'light';
    const initTheme = savedTheme || 'dark';
    setTheme(initTheme);
    document.documentElement.setAttribute('data-theme', initTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('color-scheme', theme);
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  // Auth subscriber & Cloud sync listener
  useEffect(() => {
    if (!hasFirebase || !auth) {
      // Offline fallback: load from local storage
      const saved = localStorage.getItem('voyage_trips');
      const loadedTrips = saved ? JSON.parse(saved) : INITIAL_TRIPS;
      setTrips(loadedTrips);
      const savedActiveId = localStorage.getItem('voyage_active_trip_id');
      setActiveTripId(savedActiveId || (loadedTrips.length > 0 ? loadedTrips[0].id : null));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // User logged in: Listen to Firestore real-time updates
        const q = query(collection(db!, 'trips'), where('userId', '==', firebaseUser.uid));
        const unsubSnapshot = onSnapshot(q, (snapshot) => {
          const cloudTrips: Trip[] = [];
          snapshot.forEach((doc) => {
            cloudTrips.push(doc.data() as Trip);
          });

          if (cloudTrips.length > 0) {
            setTrips(cloudTrips);
            // Verify if active trip exists in cloud
            setActiveTripId(prev => {
              if (prev && cloudTrips.some(t => t.id === prev)) return prev;
              return cloudTrips[0].id;
            });
          } else {
            // Keep local data or seed initial
            const saved = localStorage.getItem('voyage_trips');
            const local = saved ? JSON.parse(saved) : INITIAL_TRIPS;
            setTrips(local);
            setActiveTripId(prev => prev || (local.length > 0 ? local[0].id : null));
          }
        });

        return () => unsubSnapshot();
      } else {
        // User logged out: reload local storage
        const saved = localStorage.getItem('voyage_trips');
        const loadedTrips = saved ? JSON.parse(saved) : INITIAL_TRIPS;
        setTrips(loadedTrips);
        const savedActiveId = localStorage.getItem('voyage_active_trip_id');
        setActiveTripId(savedActiveId || (loadedTrips.length > 0 ? loadedTrips[0].id : null));
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Sync state to local storage when in Guest Mode
  useEffect(() => {
    if (!user) {
      localStorage.setItem('voyage_trips', JSON.stringify(trips));
    }
  }, [trips, user]);

  useEffect(() => {
    if (!user && activeTripId) {
      localStorage.setItem('voyage_active_trip_id', activeTripId);
    }
  }, [activeTripId, user]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Helper to push updates to Firestore/LocalState
  const syncTrip = async (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));

    if (user && db) {
      try {
        const tripDocRef = doc(db!, 'trips', updatedTrip.id);
        await setDoc(tripDocRef, {
          ...updatedTrip,
          userId: user.uid
        });
      } catch (err) {
        console.error('Error updating trip in Firestore:', err);
      }
    }
  };

  const handleAddTrip = async (destination: string) => {
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      userId: user ? user.uid : null,
      destination,
      startDate: '',
      endDate: '',
      budget: 3000,
      currency: 'GBP',
      currencySymbol: '£',
      flights: [],
      hotels: [],
      activities: [],
      packingList: [],
      notes: ''
    };

    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);

    if (user && db) {
      try {
        await setDoc(doc(db!, 'trips', newTrip.id), {
          ...newTrip,
          userId: user.uid
        });
      } catch (err) {
        console.error('Error creating trip in Firestore:', err);
      }
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (trips.length <= 1) {
      alert('Keep at least one trip idea on your planner!');
      return;
    }
    const filtered = trips.filter(t => t.id !== id);
    setTrips(filtered);
    if (activeTripId === id) {
      setActiveTripId(filtered[0].id);
    }

    if (user && db) {
      try {
        await deleteDoc(doc(db!, 'trips', id));
      } catch (err) {
        console.error('Error deleting trip from Firestore:', err);
      }
    }
  };

  const handleCloneTrip = async (id: string) => {
    const target = trips.find(t => t.id === id);
    if (!target) return;
    const cloned: Trip = {
      ...target,
      id: `trip-${Date.now()}`,
      userId: user ? user.uid : null,
      destination: `Copy of ${target.destination}`,
      flights: target.flights.map(f => ({ ...f, id: `flight-${Date.now()}-${Math.random()}` })),
      hotels: target.hotels.map(h => ({ ...h, id: `hotel-${Date.now()}-${Math.random()}` })),
      activities: target.activities.map(a => ({ ...a, id: `act-${Date.now()}-${Math.random()}` })),
      packingList: target.packingList.map(p => ({ ...p, id: `pack-${Date.now()}-${Math.random()}` }))
    };

    setTrips(prev => [cloned, ...prev]);
    setActiveTripId(cloned.id);

    if (user && db) {
      try {
        await setDoc(doc(db!, 'trips', cloned.id), {
          ...cloned,
          userId: user.uid
        });
      } catch (err) {
        console.error('Error writing cloned trip:', err);
      }
    }
  };

  const handleUpdateTripMeta = (id: string, fields: Partial<Pick<Trip, 'destination' | 'startDate' | 'endDate' | 'notes' | 'currency' | 'currencySymbol'>>) => {
    const target = trips.find(t => t.id === id);
    if (!target) return;
    const updated = { ...target, ...fields };
    syncTrip(updated);
  };

  const handleUpdateBudget = (id: string, budget: number) => {
    const target = trips.find(t => t.id === id);
    if (!target) return;
    const updated = { ...target, budget };
    syncTrip(updated);
  };

  // Flights operations
  const handleAddFlight = (tripId: string, flightData: Omit<Flight, 'id'>) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const newFlight: Flight = { ...flightData, id: `flight-${Date.now()}` };
    const updated: Trip = { ...target, flights: [...target.flights, newFlight] };
    syncTrip(updated);
  };

  const handleDeleteFlight = (tripId: string, id: string) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, flights: target.flights.filter(f => f.id !== id) };
    syncTrip(updated);
  };

  const handleUpdateFlight = (tripId: string, updatedFlight: Flight) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, flights: target.flights.map(f => f.id === updatedFlight.id ? updatedFlight : f) };
    syncTrip(updated);
  };

  // Hotels operations
  const handleAddHotel = (tripId: string, hotelData: Omit<Hotel, 'id'>) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const newHotel: Hotel = { ...hotelData, id: `hotel-${Date.now()}` };
    const updated: Trip = { ...target, hotels: [...target.hotels, newHotel] };
    syncTrip(updated);
  };

  const handleDeleteHotel = (tripId: string, id: string) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, hotels: target.hotels.filter(h => h.id !== id) };
    syncTrip(updated);
  };

  const handleUpdateHotel = (tripId: string, updatedHotel: Hotel) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, hotels: target.hotels.map(h => h.id === updatedHotel.id ? updatedHotel : h) };
    syncTrip(updated);
  };

  const handleSelectHotel = (tripId: string, id: string) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = {
      ...target,
      hotels: target.hotels.map(h => ({ ...h, isSelected: h.id === id }))
    };
    syncTrip(updated);
  };

  // Activities operations
  const handleAddActivity = (tripId: string, actData: Omit<Activity, 'id'>) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const newAct: Activity = { ...actData, id: `act-${Date.now()}` };
    const updated: Trip = { ...target, activities: [...target.activities, newAct] };
    syncTrip(updated);
  };

  const handleDeleteActivity = (tripId: string, id: string) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, activities: target.activities.filter(a => a.id !== id) };
    syncTrip(updated);
  };

  const handleUpdateActivity = (tripId: string, updatedAct: Activity) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, activities: target.activities.map(a => a.id === updatedAct.id ? updatedAct : a) };
    syncTrip(updated);
  };

  // Packing list operations
  const handleAddPackingItem = (tripId: string, itemData: Omit<PackingItem, 'id' | 'isPacked'>) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const newItem: PackingItem = { ...itemData, id: `pack-${Date.now()}`, isPacked: false };
    const updated: Trip = { ...target, packingList: [...target.packingList, newItem] };
    syncTrip(updated);
  };

  const handleTogglePackingItem = (tripId: string, id: string) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = {
      ...target,
      packingList: target.packingList.map(item => item.id === id ? { ...item, isPacked: !item.isPacked } : item)
    };
    syncTrip(updated);
  };

  const handleDeletePackingItem = (tripId: string, id: string) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, packingList: target.packingList.filter(item => item.id !== id) };
    syncTrip(updated);
  };

  // AI Import actions
  const handleImportActivities = (tripId: string, newActs: Omit<Activity, 'id'>[]) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const populated = newActs.map((a, idx) => ({ ...a, id: `act-ai-${Date.now()}-${idx}` }));
    const updated: Trip = { ...target, activities: [...target.activities, ...populated] };
    syncTrip(updated);
  };

  const handleImportPacking = (tripId: string, newItems: Omit<PackingItem, 'id' | 'isPacked'>[]) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const populated = newItems.map((item, idx) => ({ ...item, id: `pack-ai-${Date.now()}-${idx}`, isPacked: false }));
    const updated: Trip = { ...target, packingList: [...target.packingList, ...populated] };
    syncTrip(updated);
  };

  const handleImportCurrency = (tripId: string, currency: string, symbol: string) => {
    const target = trips.find(t => t.id === tripId);
    if (!target) return;
    const updated: Trip = { ...target, currency, currencySymbol: symbol };
    syncTrip(updated);
  };

  // Sync all local offline trips into logged in account database
  const handleSyncLocalTrips = async () => {
    if (!user || !db) return;
    const unsyncedTrips = trips.filter(t => !t.userId);
    if (unsyncedTrips.length === 0) {
      alert('All trip ideas are already synced to the cloud!');
      return;
    }

    try {
      const batch = writeBatch(db);
      unsyncedTrips.forEach((trip) => {
        const docRef = doc(db!, 'trips', trip.id);
        batch.set(docRef, {
          ...trip,
          userId: user.uid
        });
      });
      await batch.commit();
      alert(`Successfully synced ${unsyncedTrips.length} trip ideas to your cloud account!`);
      // Update local state to reflect that they are now owned by the user
      setTrips(prev => prev.map(t => !t.userId ? { ...t, userId: user.uid } : t));
    } catch (err) {
      console.error('Error syncing local trips:', err);
      alert('Failed to sync local trips to the cloud.');
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const activeTrip = trips.find(t => t.id === activeTripId) || null;
  const hasLocalUnsynced = user && trips.some(t => !t.userId);

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
        hasFirebase={hasFirebase}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {/* Banner for unsynced local storage plans */}
        {hasLocalUnsynced && (
          <div style={{
            backgroundColor: 'var(--bg-accent-translucent)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '8px 32px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'slideIn 0.2s ease-out'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cloud size={14} style={{ color: 'var(--color-accent)' }} />
              You have local trip ideas that aren't backed up in the cloud yet.
            </span>
            <button 
              onClick={handleSyncLocalTrips} 
              className="btn btn-primary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              Sync to Account
            </button>
          </div>
        )}

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

      {/* Cloud Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}

export default App;
