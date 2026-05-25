import React, { useState } from 'react';
import { Trip, Activity, PackingItem } from '../types';
import { getSuggestions } from '../mockSuggestions';
import { Sparkles, Info, Calendar, Briefcase, ChevronRight } from 'lucide-react';

interface AiAssistantProps {
  trip: Trip;
  onImportActivities: (tripId: string, activities: Omit<Activity, 'id'>[]) => void;
  onImportPacking: (tripId: string, items: Omit<PackingItem, 'id' | 'isPacked'>[]) => void;
  onImportCurrency: (tripId: string, currency: string, symbol: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  trip,
  onImportActivities,
  onImportPacking,
  onImportCurrency
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof getSuggestions> | null>(null);

  const handleGenerate = () => {
    setLoading(true);
    // Simulate thinking network delay
    setTimeout(() => {
      const data = getSuggestions(trip.destination);
      setSuggestions(data);
      setLoading(false);
      
      // Proactively update currency if it doesn't match default
      if (trip.currency !== data.currency) {
        onImportCurrency(trip.id, data.currency, data.currencySymbol);
      }
    }, 800);
  };

  return (
    <div className="glass-card fade-in-up" style={{
      border: '1px solid rgba(99, 102, 241, 0.25)',
      background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(99, 102, 241, 0.05) 100%)'
    }}>
      <div className="section-header">
        <h3 className="section-title">
          <Sparkles size={18} style={{ color: 'var(--color-budget)' }} className="sparkling-icon" /> AI Travel Assistant
        </h3>
      </div>

      {!suggestions ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Need inspiration for your holiday to <strong>{trip.destination}</strong>? Let Voyage AI generate a customized itinerary, weather briefing, and packing checklist.
          </p>
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Analyzing Destination...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} /> Generate suggestions
              </span>
            )}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* AI Tip Advisor */}
          <div className="assistant-bubble" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Info size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: '700', fontSize: '12px', display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Voyage AI Advisor
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{suggestions.advice}</p>
            </div>
          </div>

          {/* Simulated Weather Forecast */}
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
              Expected Weather Forecast
            </span>
            <div className="weather-grid">
              {suggestions.weather.map((w, idx) => (
                <div key={idx} className="weather-day">
                  <span>{w.day}</span>
                  <span style={{ fontSize: '20px', margin: '2px 0' }}>{w.icon}</span>
                  <span className="weather-temp">{w.temp}°C</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>{w.condition}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Import Actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderTop: '1px solid var(--card-border)',
            paddingTop: '16px',
            marginTop: '4px'
          }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
              Quick Import Actions
            </span>

            {/* Import activities */}
            <button 
              onClick={() => {
                onImportActivities(trip.id, suggestions.activities);
                alert(`Imported ${suggestions.activities.length} activities to Day Timeline!`);
              }}
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', fontSize: '12px', padding: '10px 14px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} style={{ color: 'var(--color-activities)' }} />
                Import Suggested Itinerary
              </span>
              <ChevronRight size={14} />
            </button>

            {/* Import packing checklist */}
            <button 
              onClick={() => {
                onImportPacking(trip.id, suggestions.packingList);
                alert(`Imported ${suggestions.packingList.length} items to Packing Checklist!`);
              }}
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', fontSize: '12px', padding: '10px 14px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={14} style={{ color: 'var(--color-budget)' }} />
                Import Packing Essentials
              </span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Reset Engine button */}
          <button 
            onClick={() => setSuggestions(null)} 
            className="btn btn-secondary" 
            style={{ fontSize: '11px', padding: '6px', width: '100%', opacity: 0.7 }}
          >
            Clear and Re-analyze
          </button>
        </div>
      )}
    </div>
  );
};
