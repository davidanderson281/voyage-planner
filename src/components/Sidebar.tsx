import React, { useState } from 'react';
import { Trip } from '../types';
import { Plus, Trash2, Copy, Compass, Calendar, DollarSign, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  trips: Trip[];
  activeTripId: string | null;
  onSelectTrip: (id: string) => void;
  onAddTrip: (destination: string) => void;
  onDeleteTrip: (id: string) => void;
  onCloneTrip: (id: string) => void;
  onUpdateBudget: (id: string, budget: number) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  trips,
  activeTripId,
  onSelectTrip,
  onAddTrip,
  onDeleteTrip,
  onCloneTrip,
  onUpdateBudget,
  theme,
  onToggleTheme
}) => {
  const [newDest, setNewDest] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeTrip = trips.find(t => t.id === activeTripId);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.trim()) return;
    onAddTrip(newDest.trim());
    setNewDest('');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <aside 
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--card-border)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'width var(--transition-normal)',
        zIndex: 10
      }}
    >
      {/* Collapse toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="btn-icon"
        style={{
          position: 'absolute',
          right: '-12px',
          top: '24px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          zIndex: 11
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Brand Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-accent-translucent)',
          color: 'var(--color-accent)',
          padding: '8px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Compass size={22} className="spinning-icon" />
        </div>
        {!isCollapsed && (
          <h1 style={{
            fontSize: '20px',
            fontFamily: 'var(--font-heading)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--color-accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            VoyagePlanner
          </h1>
        )}
      </div>

      {/* Trips list */}
      <div className="scroller" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {!isCollapsed && (
          <h2 style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            fontWeight: '700',
            paddingLeft: '8px',
            marginBottom: '4px'
          }}>
            Holiday Ideas ({trips.length})
          </h2>
        )}

        {trips.map(trip => {
          const isActive = trip.id === activeTripId;
          return (
            <div 
              key={trip.id}
              onClick={() => onSelectTrip(trip.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: isCollapsed ? '10px 0' : '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--bg-accent-translucent)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                overflow: 'hidden',
                justifyContent: isCollapsed ? 'center' : 'space-between'
              }}
              className="trip-item-row"
            >
              {isCollapsed ? (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--color-accent)' : 'var(--bg-tertiary)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {trip.destination.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '14px',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {trip.destination}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Calendar size={10} />
                      {formatDate(trip.startDate)}
                    </span>
                  </div>
                  
                  {/* Operations for items */}
                  <div className="trip-actions" style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloneTrip(trip.id);
                      }}
                      className="btn-icon"
                      title="Clone Idea"
                      style={{ padding: '2px' }}
                    >
                      <Copy size={12} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrip(trip.id);
                      }}
                      className="btn-icon"
                      title="Delete Idea"
                      style={{ padding: '2px' }}
                    >
                      <Trash2 size={12} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Add Idea input Form */}
        {!isCollapsed ? (
          <form onSubmit={handleAdd} style={{ marginTop: '12px', padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={newDest}
                onChange={(e) => setNewDest(e.target.value)}
                placeholder="Where to? (e.g. Rome)"
                className="form-control"
                style={{ padding: '8px 10px', fontSize: '13px' }}
              />
              <button 
                type="submit"
                className="btn btn-primary"
                style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
                aria-label="Add Trip"
              >
                <Plus size={16} />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="btn btn-secondary"
            style={{ padding: '10px 0', width: '100%', borderRadius: 'var(--radius-sm)' }}
            aria-label="Add Trip"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Trip Budget Adjuster Panel */}
      {!isCollapsed && activeTrip && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--card-border)',
          backgroundColor: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={12} /> Budget for {activeTrip.destination} ({activeTrip.currencySymbol})
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}>
                {activeTrip.currencySymbol}
              </span>
              <input
                type="number"
                value={activeTrip.budget || ''}
                onChange={(e) => onUpdateBudget(activeTrip.id, parseFloat(e.target.value) || 0)}
                className="form-control"
                style={{ paddingLeft: '24px', fontSize: '13px', paddingRight: '6px' }}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Profile / Settings Panel */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: '12px'
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '13px'
            }}>
              DA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>David A.</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Trip Planner</span>
            </div>
          </div>
        )}
        
        {/* Light/Dark Toggle */}
        <button 
          onClick={onToggleTheme} 
          className="btn-icon" 
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--card-border)'
          }}
        >
          {theme === 'dark' ? <Sun size={15} style={{ color: 'var(--color-warning)' }} /> : <Moon size={15} style={{ color: 'var(--color-accent)' }} />}
        </button>
      </div>
    </aside>
  );
};
