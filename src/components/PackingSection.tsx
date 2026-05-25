import React, { useState } from 'react';
import { Trip, PackingItem } from '../types';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

interface PackingSectionProps {
  trip: Trip;
  onAddPackingItem: (tripId: string, item: Omit<PackingItem, 'id' | 'isPacked'>) => void;
  onTogglePackingItem: (tripId: string, id: string) => void;
  onDeletePackingItem: (tripId: string, id: string) => void;
}

export const PackingSection: React.FC<PackingSectionProps> = ({
  trip,
  onAddPackingItem,
  onTogglePackingItem,
  onDeletePackingItem
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [category, setCategory] = useState<PackingItem['category']>('Essentials');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddPackingItem(trip.id, {
      name: newItemName.trim(),
      category
    });
    setNewItemName('');
  };

  // Group items by category
  const categories: PackingItem['category'][] = ['Essentials', 'Clothing', 'Electronics', 'Toiletries', 'Misc'];
  
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = trip.packingList.filter(item => item.category === cat);
    return acc;
  }, {} as Record<PackingItem['category'], PackingItem[]>);

  // Compute overall progress
  const totalItems = trip.packingList.length;
  const packedItems = trip.packingList.filter(item => item.isPacked).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="glass-card fade-in-up">
      <div className="section-header">
        <h3 className="section-title">
          <Briefcase size={18} style={{ color: 'var(--color-budget)' }} /> Packing Checklist
        </h3>
        {totalItems > 0 && (
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-success)' }}>
            {packedItems} / {totalItems} Packed ({progressPercent}%)
          </span>
        )}
      </div>

      {/* Progress slider overall */}
      {totalItems > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div className="progress-bar-container" style={{ height: '8px' }}>
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? 'var(--color-success)' : 'var(--color-accent)'
              }} 
            />
          </div>
        </div>
      )}

      {/* Add New Item Form */}
      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 42px',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <input 
          type="text" 
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          placeholder="Add packing item... (e.g. Passport)" 
          className="form-control"
          style={{ fontSize: '13px' }}
        />
        <select 
          value={category}
          onChange={e => setCategory(e.target.value as PackingItem['category'])}
          className="form-control"
          style={{ fontSize: '13px' }}
        >
          <option value="Essentials">⭐ Essentials</option>
          <option value="Clothing">👕 Clothing</option>
          <option value="Electronics">💻 Electronics</option>
          <option value="Toiletries">🧼 Toiletries</option>
          <option value="Misc">📦 Other</option>
        </select>
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ padding: 0 }}
          aria-label="Add item"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Checklist Sections by Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {totalItems === 0 ? (
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
            <Briefcase size={24} style={{ opacity: 0.5 }} />
            Your suitcase is empty. Add items or generate suggestions below!
          </div>
        ) : (
          categories.map(cat => {
            const catItems = itemsByCategory[cat] || [];
            if (catItems.length === 0) return null;

            const catPacked = catItems.filter(i => i.isPacked).length;
            const catProgress = Math.round((catPacked / catItems.length) * 100);

            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Category Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {cat} ({catItems.length})
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{catProgress}%</span>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {catItems.map(item => (
                    <div key={item.id} className="checklist-item">
                      <div 
                        onClick={() => onTogglePackingItem(trip.id, item.id)}
                        className="checklist-left"
                      >
                        <div className={`checkbox-custom ${item.isPacked ? 'checkbox-checked' : ''}`}>
                          {item.isPacked && <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <span className={`checklist-text ${item.isPacked ? 'checked' : ''}`}>
                          {item.name}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => onDeletePackingItem(trip.id, item.id)}
                        className="btn-icon"
                        title="Delete Item"
                        style={{ padding: '2px' }}
                      >
                        <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
