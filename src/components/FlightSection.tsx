import React, { useState } from 'react';
import { Trip, Flight } from '../types';
import { Plane, Plus, Trash2, Edit3, Calendar, Clock } from 'lucide-react';

interface FlightSectionProps {
  trip: Trip;
  onAddFlight: (tripId: string, flight: Omit<Flight, 'id'>) => void;
  onDeleteFlight: (tripId: string, id: string) => void;
  onUpdateFlight: (tripId: string, flight: Flight) => void;
}

export const FlightSection: React.FC<FlightSectionProps> = ({
  trip,
  onAddFlight,
  onDeleteFlight,
  onUpdateFlight
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);

  // Form State
  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  
  const [hasReturn, setHasReturn] = useState(false);
  const [returnAirline, setReturnAirline] = useState('');
  const [returnFlightNumber, setReturnFlightNumber] = useState('');
  const [returnDepartureAirport, setReturnDepartureAirport] = useState('');
  const [returnDepartureTime, setReturnDepartureTime] = useState('');
  const [returnArrivalAirport, setReturnArrivalAirport] = useState('');
  const [returnArrivalTime, setReturnArrivalTime] = useState('');
  
  const [cost, setCost] = useState<number>(0);

  const resetForm = () => {
    setAirline('');
    setFlightNumber('');
    setDepartureAirport('');
    setDepartureTime('');
    setArrivalAirport('');
    setArrivalTime('');
    setHasReturn(false);
    setReturnAirline('');
    setReturnFlightNumber('');
    setReturnDepartureAirport('');
    setReturnDepartureTime('');
    setReturnArrivalAirport('');
    setReturnArrivalTime('');
    setCost(0);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
    setEditingFlightId(null);
  };

  const handleOpenEdit = (flight: Flight) => {
    setEditingFlightId(flight.id);
    setIsAdding(false);
    
    setAirline(flight.airline);
    setFlightNumber(flight.flightNumber);
    setDepartureAirport(flight.departureAirport);
    setDepartureTime(flight.departureTime);
    setArrivalAirport(flight.arrivalAirport);
    setArrivalTime(flight.arrivalTime);
    
    setHasReturn(!!flight.returnAirline);
    setReturnAirline(flight.returnAirline || '');
    setReturnFlightNumber(flight.returnFlightNumber || '');
    setReturnDepartureAirport(flight.returnDepartureAirport || '');
    setReturnDepartureTime(flight.returnDepartureTime || '');
    setReturnArrivalAirport(flight.returnArrivalAirport || '');
    setReturnArrivalTime(flight.returnArrivalTime || '');
    
    setCost(flight.cost);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const flightData = {
      airline,
      flightNumber,
      departureAirport: departureAirport.toUpperCase(),
      departureTime,
      arrivalAirport: arrivalAirport.toUpperCase(),
      arrivalTime,
      ...(hasReturn ? {
        returnAirline,
        returnFlightNumber,
        returnDepartureAirport: returnDepartureAirport.toUpperCase(),
        returnDepartureTime,
        returnArrivalAirport: returnArrivalAirport.toUpperCase(),
        returnArrivalTime
      } : {}),
      cost: Number(cost) || 0
    };

    if (editingFlightId) {
      onUpdateFlight(trip.id, { ...flightData, id: editingFlightId });
      setEditingFlightId(null);
    } else {
      onAddFlight(trip.id, flightData);
      setIsAdding(false);
    }
    resetForm();
  };

  return (
    <div className="glass-card fade-in-up">
      <div className="section-header">
        <h3 className="section-title">
          <Plane size={18} style={{ color: 'var(--color-flights)' }} /> Flight Collator
        </h3>
        {!isAdding && !editingFlightId && (
          <button onClick={handleOpenAdd} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <Plus size={14} /> Add Flight Options
          </button>
        )}
      </div>

      {/* Adding / Editing Form Panel */}
      {(isAdding || editingFlightId) && (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--card-border)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-accent)' }}>
            {editingFlightId ? 'Edit Flight Option' : 'New Flight Option'}
          </h4>

          {/* Outbound Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Outbound Flight</span>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Airline</label>
                <input required type="text" value={airline} onChange={e => setAirline(e.target.value)} placeholder="e.g. British Airways" className="form-control" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Flight #</label>
                <input required type="text" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="e.g. BA245" className="form-control" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Departure (Airport / Time)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input required type="text" value={departureAirport} onChange={e => setDepartureAirport(e.target.value)} placeholder="LHR" maxLength={4} className="form-control" style={{ width: '65px', textAlign: 'center' }} />
                  <input required type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="form-control" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Arrival (Airport / Time)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input required type="text" value={arrivalAirport} onChange={e => setArrivalAirport(e.target.value)} placeholder="HND" maxLength={4} className="form-control" style={{ width: '65px', textAlign: 'center' }} />
                  <input required type="datetime-local" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} className="form-control" />
                </div>
              </div>
            </div>
          </div>

          {/* Return Toggle */}
          <div style={{ margin: '6px 0' }}>
            <label className="switch-container">
              <input 
                type="checkbox" 
                checked={hasReturn} 
                onChange={e => setHasReturn(e.target.checked)} 
                style={{ display: 'none' }} 
              />
              <div className={`switch-track ${hasReturn ? 'active' : ''}`}>
                <div className="switch-thumb" />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Include Return Flight</span>
            </label>
          </div>

          {/* Return Section */}
          {hasReturn && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Return Flight</span>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Airline</label>
                  <input required={hasReturn} type="text" value={returnAirline} onChange={e => setReturnAirline(e.target.value)} placeholder="e.g. British Airways" className="form-control" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Flight #</label>
                  <input required={hasReturn} type="text" value={returnFlightNumber} onChange={e => setReturnFlightNumber(e.target.value)} placeholder="e.g. BA246" className="form-control" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Departure (Airport / Time)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input required={hasReturn} type="text" value={returnDepartureAirport} onChange={e => setReturnDepartureAirport(e.target.value)} placeholder="HND" maxLength={4} className="form-control" style={{ width: '65px', textAlign: 'center' }} />
                    <input required={hasReturn} type="datetime-local" value={returnDepartureTime} onChange={e => setReturnDepartureTime(e.target.value)} className="form-control" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Arrival (Airport / Time)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input required={hasReturn} type="text" value={returnArrivalAirport} onChange={e => setReturnArrivalAirport(e.target.value)} placeholder="LHR" maxLength={4} className="form-control" style={{ width: '65px', textAlign: 'center' }} />
                    <input required={hasReturn} type="datetime-local" value={returnArrivalTime} onChange={e => setReturnArrivalTime(e.target.value)} className="form-control" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Submit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--card-border)', paddingTop: '12px', marginTop: '4px' }}>
            <div className="form-group" style={{ marginBottom: 0, width: '160px' }}>
              <label>Cost ({trip.currencySymbol})</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{trip.currencySymbol}</span>
                <input type="number" required value={cost || ''} onChange={e => setCost(Number(e.target.value))} placeholder="0.00" className="form-control" style={{ paddingLeft: '24px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => { setIsAdding(false); setEditingFlightId(null); }} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Flight</button>
            </div>
          </div>
        </form>
      )}

      {/* Flight Cards list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {trip.flights.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 0',
            color: 'var(--text-muted)',
            fontSize: '13px',
            border: '1.5px dashed var(--card-border)',
            borderRadius: 'var(--radius-md)',
            gap: '8px'
          }}>
            <Plane size={24} style={{ opacity: 0.5 }} />
            No flights recorded yet. Add your first travel option.
          </div>
        ) : (
          <div className="grid-cards">
            {trip.flights.map((flight) => {
              const outDepDate = flight.departureTime ? new Date(flight.departureTime) : null;
              const outArrDate = flight.arrivalTime ? new Date(flight.arrivalTime) : null;
              const retDepDate = flight.returnDepartureTime ? new Date(flight.returnDepartureTime) : null;
              const retArrDate = flight.returnArrivalTime ? new Date(flight.returnArrivalTime) : null;

              const formatDateTime = (date: Date | null) => {
                if (!date) return 'N/A';
                return date.toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
              };

              return (
                <div key={flight.id} className="item-card">
                  <div className="item-card-header">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {flight.airline} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({flight.flightNumber})</span>
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {flight.departureAirport} → {flight.arrivalAirport}
                      </span>
                    </div>
                    <span className="item-card-price flights">
                      {trip.currencySymbol}{flight.cost.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', width: '32px', color: 'var(--text-muted)' }}>Dep:</span>
                        <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{formatDateTime(outDepDate)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', width: '32px', color: 'var(--text-muted)' }}>Arr:</span>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{formatDateTime(outArrDate)}</span>
                      </div>
                    </div>

                    {flight.returnAirline && (
                      <div style={{
                        marginTop: '8px',
                        borderTop: '1px solid var(--card-border)',
                        paddingTop: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Return Flight</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                          {flight.returnAirline} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({flight.returnFlightNumber})</span>
                        </span>
                        <span style={{ fontSize: '11px' }}>{flight.returnDepartureAirport} → {flight.returnArrivalAirport}</span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '600', width: '32px', color: 'var(--text-muted)' }}>Dep:</span>
                            <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                            <span>{formatDateTime(retDepDate)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '600', width: '32px', color: 'var(--text-muted)' }}>Arr:</span>
                            <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                            <span>{formatDateTime(retArrDate)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '10px', marginTop: 'auto' }}>
                    <button onClick={() => handleOpenEdit(flight)} className="btn-icon" title="Edit Flight"><Edit3 size={13} /></button>
                    <button onClick={() => onDeleteFlight(trip.id, flight.id)} className="btn-icon" title="Delete Flight"><Trash2 size={13} style={{ color: 'var(--color-danger)' }} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
