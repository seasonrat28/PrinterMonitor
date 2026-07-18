import React from 'react';
import { Star, Clock, Printer } from 'lucide-react';
import StatusBadge from './StatusBadge';

const PrinterCard = ({ ip, data, isFavorite, onToggleFavorite }) => {
  const { name, logs } = data;
  const latestLog = logs && logs.length > 0 ? logs[0] : null;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <Printer size={24} style={{ color: 'var(--info)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)', wordBreak: 'break-all' }}>
              {name || 'Unknown Printer'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {ip}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => onToggleFavorite(ip)}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star 
            size={20} 
            style={{ 
              color: isFavorite ? '#F59E0B' : 'var(--text-muted)',
              fill: isFavorite ? '#F59E0B' : 'none',
              transition: 'all 0.2s'
            }} 
          />
        </button>
      </div>

      {/* Statuses */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <StatusBadge label="Toner" value={latestLog?.toner} />
        <StatusBadge label="Drum" value={latestLog?.drum} />
      </div>

      {/* Footer / Last Update */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '0.75rem', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        color: 'var(--text-muted)',
        fontSize: '0.75rem'
      }}>
        <Clock size={12} />
        <span>Updated: {latestLog?.datetime || 'N/A'}</span>
      </div>
      
    </div>
  );
};

export default PrinterCard;
