import React, { useState } from 'react';
import { Trip, Activity } from '../types';
import { Calendar, Plus, Trash2, Edit3, Clock } from 'lucide-react';

interface ItinerarySectionProps {
  trip: Trip;
  onAddActivity: (tripId: string, activity: Omit<Activity, 'id'>) => void;
  onDeleteActivity: (tripId: string, id: string) => void;
  onUpdateActivity: (tripId: string, activity: Activity) => void;
}

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  trip,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingActId, setEditingActId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [day, setDay] = useState<number>(0);
  const [time, setTime] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [category, setCategory] = useState<Activity['category']>('Sightseeing');
  const [notes, setNotes] = useState('');

  // Calculate days dynamically
  let totalDays = 1;
  if (trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalDays = diffDays > 0 ? diffDays + 1 : 1;
  }

  const resetForm = () => {
    setName('');
    setDay(0);
    setTime('');
    setCost(0);
    setCategory('Sightseeing');
    setNotes('');
  };

  const handleOpenAdd = (targetDay: number = 0) => {
    resetForm();
    setDay(targetDay);
    setIsAdding(true);
    setEditingActId(null);
  };

  const handleOpenEdit = (act: Activity) => {
    setEditingActId(act.id);
    setIsAdding(false);
    
    setName(act.name);
    setDay(act.day);
    setTime(act.time);
    setCost(act.cost);
    setCategory(act.category);
    setNotes(act.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activityData = {
      name,
      day: Number(day),
      time: time || '12:00',
      cost: Number(cost) || 0,
      category,
      notes
    };

    if (editingActId) {
      onUpdateActivity(trip.id, { ...activityData, id: editingActId });
      setEditingActId(null);
    } else {
      onAddActivity(trip.id, activityData);
      setIsAdding(false);
    }
    resetForm();
  };

  const getCategoryColor = (cat: Activity['category']) => {
    switch (cat) {
      case 'Sightseeing': return 'var(--color-flights)';
      case 'Dining': return 'var(--color-hotels)';
      case 'Adventure': return 'var(--color-activities)';
      case 'Transport': return 'var(--color-info)';
      case 'Shopping': return 'var(--color-warning)';
      default: return 'var(--text-muted)';
    }
  };

  // Group activities by day
  const activitiesByDay: Record<number, Activity[]> = {};
  for (let i = 0; i <= totalDays; i++) {
    activitiesByDay[i] = [];
  }
  
  trip.activities.forEach(act => {
    const actDay = act.day <= totalDays ? act.day : 0; // Fallback if trip shortened
    if (!activitiesByDay[actDay]) {
      activitiesByDay[actDay] = [];
    }
    activitiesByDay[actDay].push(act);
  });

  // Sort activities by time
  Object.keys(activitiesByDay).forEach(key => {
    const k = Number(key);
    activitiesByDay[k].sort((a, b) => a.time.localeCompare(b.time));
  });

  const renderActivityCard = (act: Activity) => (
    <div 
      key={act.id} 
      className="item-card"
      style={{
        padding: '12px 16px',
        borderLeft: `4px solid ${getCategoryColor(act.category)}`,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: getCategoryColor(act.category) }}>
            {act.category}
          </span>
          {act.time && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={10} /> {act.time}
            </span>
          )}
        </div>
        
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{act.name}</h4>
        {act.notes && <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.notes}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontWeight: '700', fontSize: '14px', fontFamily: 'var(--font-heading)' }}>
          {act.cost > 0 ? `${trip.currencySymbol}${act.cost.toLocaleString()}` : 'Free'}
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={() => handleOpenEdit(act)} className="btn-icon" title="Edit Activity" style={{ padding: '4px' }}><Edit3 size={12} /></button>
          <button onClick={() => onDeleteActivity(trip.id, act.id)} className="btn-icon" title="Delete Activity" style={{ padding: '4px' }}><Trash2 size={12} style={{ color: 'var(--color-danger)' }} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="glass-card fade-in-up">
      <div className="section-header">
        <h3 className="section-title">
          <Calendar size={18} style={{ color: 'var(--color-activities)' }} /> Itinerary Timeline
        </h3>
        {!isAdding && !editingActId && (
          <button onClick={() => handleOpenAdd(0)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <Plus size={14} /> Add Activity
          </button>
        )}
      </div>

      {/* Form Panel */}
      {(isAdding || editingActId) && (
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
            {editingActId ? 'Edit Activity Details' : 'New Activity Details'}
          </h4>

          <div className="form-group">
            <label>Activity Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Scuba diving or Michelin Dinner" className="form-control" />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Schedule Day</label>
              <select value={day} onChange={e => setDay(Number(e.target.value))} className="form-control">
                <option value={0}>💡 Unscheduled Idea</option>
                {Array.from({ length: totalDays }, (_, i) => (
                  <option key={i + 1} value={i + 1}>📅 Day {i + 1}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as Activity['category'])} className="form-control">
                <option value="Sightseeing">🎨 Sightseeing</option>
                <option value="Dining">🍽️ Dining & Culinary</option>
                <option value="Adventure">🧗 Adventure & Sport</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Misc">📦 Miscellaneous</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Cost ({trip.currencySymbol})</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{trip.currencySymbol}</span>
                <input type="number" value={cost || ''} onChange={e => setCost(Number(e.target.value))} placeholder="0" className="form-control" style={{ paddingLeft: '24px' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Notes / Booking Reference</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add links, ticket codes, or extra details..." rows={2} className="form-control" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}>
            <button type="button" onClick={() => { setIsAdding(false); setEditingActId(null); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Activity</button>
          </div>
        </form>
      )}

      {/* Itinerary Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Day-by-Day schedule */}
        {Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const dayActs = activitiesByDay[dayNum] || [];
          const dayCost = dayActs.reduce((sum, a) => sum + a.cost, 0);

          return (
            <div key={dayNum} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderLeft: '2px solid var(--card-border)',
              paddingLeft: '16px',
              position: 'relative'
            }}>
              {/* Timeline marker */}
              <div style={{
                position: 'absolute',
                left: '-6px',
                top: '4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: dayActs.length > 0 ? 'var(--color-activities)' : 'var(--text-muted)',
                border: '2px solid var(--bg-secondary)'
              }} />

              {/* Day Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Day {dayNum} 
                  {dayCost > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                      ({trip.currencySymbol}{dayCost.toLocaleString()})
                    </span>
                  )}
                </span>
                
                <button 
                  onClick={() => handleOpenAdd(dayNum)} 
                  className="btn-icon" 
                  title={`Add activity to Day ${dayNum}`}
                  style={{ padding: '2px' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Day's Activities List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dayActs.length === 0 ? (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                    No activities scheduled. Add suggestions or ideas.
                  </span>
                ) : (
                  dayActs.map(renderActivityCard)
                )}
              </div>
            </div>
          );
        })}

        {/* Unscheduled Bucket */}
        {activitiesByDay[0] && activitiesByDay[0].length > 0 && (
          <div style={{
            marginTop: '10px',
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed var(--card-border)'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 Unscheduled Ideas ({activitiesByDay[0].length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activitiesByDay[0].map(renderActivityCard)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
