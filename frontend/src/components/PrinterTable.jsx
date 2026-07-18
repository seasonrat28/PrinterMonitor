import React from 'react';
import { Star } from 'lucide-react';
import StatusBadge from './StatusBadge';

const PrinterTable = ({ printers, isFavorite, onToggleFavorite, sortBy, onSort }) => {
  return (
    <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '1rem', width: '40px' }}></th>
            <th style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => onSort(sortBy === 'ip_asc' ? 'ip_desc' : 'ip_asc')}>
              IP Address {sortBy.startsWith('ip') && (sortBy.endsWith('asc') ? '↑' : '↓')}
            </th>
            <th style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => onSort(sortBy === 'name_asc' ? 'name_desc' : 'name_asc')}>
              Printer Name {sortBy.startsWith('name') && (sortBy.endsWith('asc') ? '↑' : '↓')}
            </th>
            <th style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => onSort(sortBy === 'toner_asc' ? 'toner_desc' : 'toner_asc')}>
              Toner % {sortBy.startsWith('toner') && (sortBy.endsWith('asc') ? '↑' : '↓')}
            </th>
            <th style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => onSort(sortBy === 'drum_asc' ? 'drum_desc' : 'drum_asc')}>
              Drum % {sortBy.startsWith('drum') && (sortBy.endsWith('asc') ? '↑' : '↓')}
            </th>
            <th style={{ padding: '1rem' }}>Last Update</th>
          </tr>
        </thead>
        <tbody>
          {printers.map(({ ip, data }) => {
            const { name, logs } = data;
            const latestLog = logs && logs.length > 0 ? logs[0] : null;
            const isFav = isFavorite(ip);

            return (
              <tr key={ip} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => onToggleFavorite(ip)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Star 
                      size={18} 
                      style={{ 
                        color: isFav ? '#F59E0B' : 'var(--text-muted)',
                        fill: isFav ? '#F59E0B' : 'none'
                      }} 
                    />
                  </button>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--info)' }}>{ip}</td>
                <td style={{ padding: '1rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>{name || 'Unknown'}</td>
                <td style={{ padding: '1rem' }}><StatusBadge label="Toner" value={latestLog?.toner} /></td>
                <td style={{ padding: '1rem' }}><StatusBadge label="Drum" value={latestLog?.drum} /></td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{latestLog?.datetime || 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PrinterTable;
