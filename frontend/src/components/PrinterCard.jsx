import React from 'react';
import { Link } from 'react-router-dom';

const PrinterCard = ({ printer, handleRefresh, handleDelete, refreshing, deleting, isFavorite, onToggleFavorite }) => {
  const isError = !printer.online || (printer.printer_status && printer.printer_status.toLowerCase().includes('error'));
  const statusColor = isError ? 'text-error' : 'text-secondary-container';
  const statusBg = isError ? 'bg-error' : 'bg-secondary-container';
  const statusText = isError ? 'ERROR' : 'ACTIVE';

  return (
    <div className={`glass-panel p-md rounded-xl hover:translate-y-[-4px] transition-all flex flex-col ${isError ? 'border-error/20 neon-glow-error' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[20px] ${isError ? 'text-error' : 'text-primary'}`}>
                {isError ? 'report' : 'print'}
            </span>
            <div className="flex gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity" style={{ marginLeft: '4px' }}>
                {handleRefresh && (
                    <button 
                        onClick={(e) => { e.preventDefault(); handleRefresh(); }} 
                        disabled={refreshing === printer.id} 
                        className="text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <span className={`material-symbols-outlined text-[14px] ${refreshing === printer.id ? 'spin' : ''}`}>sync</span>
                    </button>
                )}
                {handleDelete && (
                    <button 
                        onClick={(e) => { e.preventDefault(); handleDelete(printer.id, printer.ip_address); }} 
                        disabled={deleting === printer.id} 
                        className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                )}
                {onToggleFavorite && (
                    <button 
                        onClick={(e) => { e.preventDefault(); onToggleFavorite(printer.ip_address); }} 
                        className="transition-colors disabled:opacity-50"
                        style={{ color: isFavorite ? '#FBBF24' : 'var(--on-surface-variant)' }}
                        title="Favorite"
                    >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>
                )}
            </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${statusBg} ${!isError ? 'animate-pulse shadow-[0_0_8px_#00f1fe]' : 'shadow-[0_0_8px_#ffb4ab]'}`}></div>
      </div>
      <p className="text-on-surface font-bold text-sm truncate" title={printer.model || printer.hostname || 'Unknown Device'}>
        {printer.model || printer.hostname || 'Unknown Device'}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] font-label-mono text-on-surface-variant px-1.5 py-0.5 bg-surface-container-highest/50 rounded">{printer.ip_address}</span>
        <span className={`text-[10px] font-label-mono ${statusColor}`}>{statusText}</span>
      </div>
    </div>
  );
};

export default PrinterCard;
