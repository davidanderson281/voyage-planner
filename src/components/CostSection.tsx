import React from 'react';
import { Trip } from '../types';
import { TrendingUp, Award, Wallet, AlertCircle } from 'lucide-react';

interface CostSectionProps {
  trip: Trip;
}

export const CostSection: React.FC<CostSectionProps> = ({ trip }) => {
  // Calculations
  const flightsCost = trip.flights.reduce((sum, f) => sum + (f.cost || 0), 0);
  
  const selectedHotel = trip.hotels.find(h => h.isSelected);
  const lodgingCost = selectedHotel ? (selectedHotel.pricePerNight * selectedHotel.nights) : 0;
  
  const activitiesCost = trip.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  
  const totalCost = flightsCost + lodgingCost + activitiesCost;
  const budget = trip.budget || 0;
  const remaining = budget - totalCost;
  const isOverBudget = remaining < 0;

  // Nights calculation
  let durationNights = 1;
  if (trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    durationNights = diffDays > 0 ? diffDays : 1;
  }
  const costPerNight = totalCost / durationNights;

  // Percentages for chart & progress bars
  const flightPercent = totalCost > 0 ? (flightsCost / totalCost) * 100 : 0;
  const lodgingPercent = totalCost > 0 ? (lodgingCost / totalCost) * 100 : 0;
  const activityPercent = totalCost > 0 ? (activitiesCost / totalCost) * 100 : 0;

  // SVG Donut Calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.19
  
  const flightStroke = (flightPercent / 100) * circumference;
  const lodgingStroke = (lodgingPercent / 100) * circumference;
  const activityStroke = (activityPercent / 100) * circumference;

  const budgetProgress = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;

  return (
    <div className="glass-card fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="section-header">
        <h3 className="section-title">
          <TrendingUp size={18} style={{ color: 'var(--color-budget)' }} /> Cost Breakdown
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {durationNights} {durationNights === 1 ? 'night' : 'nights'} trip
        </span>
      </div>

      {/* Main Budget Card Summary */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <Wallet size={14} /> Total Cost
          </div>
          <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            {trip.currencySymbol}{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Budget Progress Bar */}
        {budget > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Budget Usage</span>
              <span>{Math.round((totalCost / budget) * 100)}%</span>
            </div>
            <div className="progress-bar-container" style={{ height: '8px' }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${budgetProgress}%`,
                  backgroundColor: isOverBudget ? 'var(--color-danger)' : 'var(--color-accent)' 
                }} 
              />
            </div>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px', 
          marginTop: '4px',
          borderTop: '1px solid var(--card-border)',
          paddingTop: '12px'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget</span>
            <span style={{ fontSize: '15px', fontWeight: '600' }}>
              {trip.currencySymbol}{budget.toLocaleString()}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </span>
            <span style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              color: isOverBudget ? 'var(--color-danger)' : 'var(--color-success)'
            }}>
              {isOverBudget ? '-' : ''}{trip.currencySymbol}{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Donut Chart and legend */}
      {totalCost > 0 ? (
        <div className="chart-container">
          <svg width="100" height="100" viewBox="0 0 100 100" className="chart-svg">
            {/* Background hole */}
            <circle cx="50" cy="50" r={radius} className="chart-hole" />
            
            {/* Flights Segment */}
            {flightsCost > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="chart-segment"
                stroke="var(--color-flights)"
                strokeWidth="10"
                strokeDasharray={`${flightStroke} ${circumference}`}
                strokeDashoffset={0}
              />
            )}

            {/* Lodging Segment */}
            {lodgingCost > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="chart-segment"
                stroke="var(--color-hotels)"
                strokeWidth="10"
                strokeDasharray={`${lodgingStroke} ${circumference}`}
                strokeDashoffset={-flightStroke}
              />
            )}

            {/* Activities Segment */}
            {activitiesCost > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="chart-segment"
                stroke="var(--color-activities)"
                strokeWidth="10"
                strokeDasharray={`${activityStroke} ${circumference}`}
                strokeDashoffset={-(flightStroke + lodgingStroke)}
              />
            )}
          </svg>

          {/* Stats Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-flights)' }} />
                Flights
              </span>
              <span style={{ fontWeight: '500' }}>{Math.round(flightPercent)}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-hotels)' }} />
                Hotels
              </span>
              <span style={{ fontWeight: '500' }}>{Math.round(lodgingPercent)}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-activities)' }} />
                Activities
              </span>
              <span style={{ fontWeight: '500' }}>{Math.round(activityPercent)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 0',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          border: '1.5px dashed var(--card-border)',
          borderRadius: 'var(--radius-md)'
        }}>
          <AlertCircle size={20} />
          Add items to see budget distribution
        </div>
      )}

      {/* Numerical Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
        {/* Flights Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Flights Cost</span>
            <span style={{ fontWeight: '600' }}>{trip.currencySymbol}{flightsCost.toLocaleString()}</span>
          </div>
          <div className="progress-bar-container" style={{ height: '5px' }}>
            <div className="progress-bar-fill" style={{ width: `${flightPercent}%`, backgroundColor: 'var(--color-flights)' }} />
          </div>
        </div>

        {/* Hotels Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Lodging (Selected)</span>
            <span style={{ fontWeight: '600' }}>{trip.currencySymbol}{lodgingCost.toLocaleString()}</span>
          </div>
          <div className="progress-bar-container" style={{ height: '5px' }}>
            <div className="progress-bar-fill" style={{ width: `${lodgingPercent}%`, backgroundColor: 'var(--color-hotels)' }} />
          </div>
        </div>

        {/* Activities Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Activities</span>
            <span style={{ fontWeight: '600' }}>{trip.currencySymbol}{activitiesCost.toLocaleString()}</span>
          </div>
          <div className="progress-bar-container" style={{ height: '5px' }}>
            <div className="progress-bar-fill" style={{ width: `${activityPercent}%`, backgroundColor: 'var(--color-activities)' }} />
          </div>
        </div>
      </div>

      {/* Average Costs */}
      <div style={{
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg-accent-translucent)',
        border: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '12px'
      }}>
        <Award size={14} style={{ color: 'var(--color-accent)' }} />
        <span>Average cost per night: <strong>{trip.currencySymbol}{Math.round(costPerNight).toLocaleString()}</strong></span>
      </div>
    </div>
  );
};
