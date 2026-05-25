import React, { useState } from 'react';
import { Trip, Hotel } from '../types';
import { Hotel as HotelIcon, Plus, Trash2, Edit3, Star, CheckCircle2, Link as LinkIcon } from 'lucide-react';

interface HotelSectionProps {
  trip: Trip;
  onAddHotel: (tripId: string, hotel: Omit<Hotel, 'id'>) => void;
  onDeleteHotel: (tripId: string, id: string) => void;
  onUpdateHotel: (tripId: string, hotel: Hotel) => void;
  onSelectHotel: (tripId: string, id: string) => void;
}

export const HotelSection: React.FC<HotelSectionProps> = ({
  trip,
  onAddHotel,
  onDeleteHotel,
  onUpdateHotel,
  onSelectHotel
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(4);
  const [pricePerNight, setPricePerNight] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [link, setLink] = useState('');

  // Auto calculate nights from trip dates if available
  const getSuggestedNights = () => {
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  };

  const resetForm = () => {
    setName('');
    setRating(4);
    setPricePerNight(0);
    setNights(getSuggestedNights());
    setLink('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
    setEditingHotelId(null);
  };

  const handleOpenEdit = (hotel: Hotel) => {
    setEditingHotelId(hotel.id);
    setIsAdding(false);
    
    setName(hotel.name);
    setRating(hotel.rating);
    setPricePerNight(hotel.pricePerNight);
    setNights(hotel.nights);
    setLink(hotel.link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hotelData = {
      name,
      rating,
      pricePerNight: Number(pricePerNight) || 0,
      nights: Number(nights) || 1,
      totalCost: (Number(pricePerNight) || 0) * (Number(nights) || 1),
      link,
      isSelected: editingHotelId ? (trip.hotels.find(h => h.id === editingHotelId)?.isSelected || false) : false
    };

    if (editingHotelId) {
      onUpdateHotel(trip.id, { ...hotelData, id: editingHotelId });
      setEditingHotelId(null);
    } else {
      // If it's the first hotel, let's auto select it
      const shouldSelect = trip.hotels.length === 0;
      onAddHotel(trip.id, { ...hotelData, isSelected: shouldSelect });
      setIsAdding(false);
    }
    resetForm();
  };

  return (
    <div className="glass-card fade-in-up">
      <div className="section-header">
        <h3 className="section-title">
          <HotelIcon size={18} style={{ color: 'var(--color-hotels)' }} /> Hotel Options
        </h3>
        {!isAdding && !editingHotelId && (
          <button onClick={handleOpenAdd} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <Plus size={14} /> Add Hotel
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingHotelId) && (
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
            {editingHotelId ? 'Edit Hotel Info' : 'New Hotel Info'}
          </h4>

          <div className="form-group">
            <label>Hotel Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ritz-Carlton Tokyo" className="form-control" />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Rating</label>
              <select value={rating} onChange={e => setRating(Number(e.target.value))} className="form-control">
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
                <option value={2}>⭐⭐ (2 Stars)</option>
                <option value={1}>⭐ (1 Star)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Link / Website URL (Optional)</label>
              <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Price per night ({trip.currencySymbol})</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{trip.currencySymbol}</span>
                <input required type="number" value={pricePerNight || ''} onChange={e => setPricePerNight(Number(e.target.value))} placeholder="0.00" className="form-control" style={{ paddingLeft: '24px' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Total Nights</label>
              <input required type="number" min={1} value={nights || ''} onChange={e => setNights(Number(e.target.value))} className="form-control" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '12px', marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Estimated Total: <strong style={{ color: 'var(--color-hotels)' }}>{trip.currencySymbol}{((pricePerNight || 0) * (nights || 1)).toLocaleString()}</strong>
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => { setIsAdding(false); setEditingHotelId(null); }} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Hotel</button>
            </div>
          </div>
        </form>
      )}

      {/* Hotel Options Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {trip.hotels.length === 0 ? (
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
            <HotelIcon size={24} style={{ opacity: 0.5 }} />
            No hotels registered. Compare multiple options by adding them.
          </div>
        ) : (
          <div className="grid-cards">
            {trip.hotels.map((hotel) => {
              const stars = Array.from({ length: hotel.rating }, (_, i) => i);
              return (
                <div 
                  key={hotel.id} 
                  className={`item-card ${hotel.isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectHotel(trip.id, hotel.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="item-card-header">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {hotel.name}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {stars.map((s) => (
                          <Star key={s} size={10} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
                        ))}
                      </div>
                    </div>
                    
                    {hotel.isSelected && (
                      <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', margin: '6px 0' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {trip.currencySymbol}{hotel.pricePerNight} / night × {hotel.nights} nights
                    </span>
                    <span className="item-card-price hotels">
                      {trip.currencySymbol}{hotel.totalCost.toLocaleString()}
                    </span>
                  </div>

                  {hotel.link && (
                    <a 
                      href={hotel.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()} 
                      style={{ 
                        fontSize: '11px', 
                        color: 'var(--color-accent)', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        marginTop: '2px',
                        width: 'fit-content'
                      }}
                    >
                      <LinkIcon size={10} /> View Website
                    </a>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderTop: '1px solid var(--card-border)', 
                    paddingTop: '10px', 
                    marginTop: '10px'
                  }}>
                    <span style={{ 
                      fontSize: '11px', 
                      color: hotel.isSelected ? 'var(--color-success)' : 'var(--text-muted)',
                      fontWeight: hotel.isSelected ? '600' : '400'
                    }}>
                      {hotel.isSelected ? 'Selected Lodging' : 'Click to select'}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(hotel);
                        }} 
                        className="btn-icon" 
                        title="Edit Hotel"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHotel(trip.id, hotel.id);
                        }} 
                        className="btn-icon" 
                        title="Delete Hotel"
                      >
                        <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </div>
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
