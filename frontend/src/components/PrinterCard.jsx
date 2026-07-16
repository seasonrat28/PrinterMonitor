import React from 'react';
import { Link } from 'react-router-dom';

const CircularProgress = ({ pct, colorHex }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const validPct = Math.max(0, Math.min(100, pct ?? 0));
  const strokeDashoffset = circumference - (validPct / 100) * circumference;
  
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={radius} fill="none" stroke={colorHex} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-label-mono text-[10px] font-bold text-on-surface">
        {validPct}%
      </div>
    </div>
  );
};

const PrinterCard = ({ printer, handleRefresh, handleDelete, refreshing, deleting, isFavorite, onToggleFavorite }) => {
  const isError = !printer.online || (printer.printer_status && printer.printer_status.toLowerCase().includes('error'));
  const statusColor = isError ? 'text-error' : 'text-secondary-container';
  const statusBg = isError ? 'bg-error' : 'bg-secondary-container';
  const statusText = isError ? 'ERROR' : 'READY';

  return (
    <div className={`glass-panel p-md rounded-xl hover:-translate-y-1 transition-all flex flex-col ${isError ? 'border-error/20 neon-glow-error' : ''}`}>
      
      {/* Header Info */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-2 max-w-[70%]">
          <span className={`material-symbols-outlined text-[20px] ${isError ? 'text-error' : 'text-primary'}`}>
            {isError ? 'report' : 'print'}
          </span>
          <div className="overflow-hidden">
            <h4 className="text-on-surface font-bold text-sm truncate" title={printer.model || printer.hostname}>
              {printer.model || printer.hostname || 'Unknown Device'}
            </h4>
            <p className="font-label-mono text-[10px] text-on-surface-variant truncate mt-0.5">{printer.location || 'Unknown Location'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {handleRefresh && (
            <button 
              className="text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
              onClick={handleRefresh} 
              disabled={refreshing === printer.id}
            >
              <span className={`material-symbols-outlined text-[16px] ${refreshing === printer.id ? 'spin' : ''}`}>sync</span>
            </button>
          )}
          {handleDelete && (
            <button 
              className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50 ml-1"
              onClick={() => handleDelete(printer.id, printer.ip_address)} 
              disabled={deleting === printer.id}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}
          {onToggleFavorite && (
            <button 
              className="ml-1 transition-colors disabled:opacity-50"
              style={{ color: isFavorite ? '#FBBF24' : 'var(--on-surface-variant)' }}
              onClick={() => onToggleFavorite(printer.ip_address)}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>star</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="font-label-mono text-[10px] text-on-surface-variant px-2 py-1 bg-surface-container-highest/50 rounded">{printer.ip_address}</span>
        <div className="flex items-center gap-1.5">
          <span className={`font-label-mono text-[10px] ${statusColor}`}>{statusText}</span>
          <div className={`w-2 h-2 rounded-full ${statusBg} ${!isError ? 'animate-pulse' : ''}`}></div>
        </div>
      </div>

      {/* Circular Toner Bars */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="flex flex-col items-center gap-1">
          <CircularProgress pct={printer.toner_cyan} colorHex="#00dbe7" />
          <span className="font-label-mono text-[9px] text-secondary-container">CYAN</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CircularProgress pct={printer.toner_magenta} colorHex="#ffb4ab" />
          <span className="font-label-mono text-[9px] text-error">MAG</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CircularProgress pct={printer.toner_yellow} colorHex="#ffdbcd" />
          <span className="font-label-mono text-[9px] text-tertiary">YEL</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CircularProgress pct={printer.toner_black} colorHex="#e3e2e6" />
          <span className="font-label-mono text-[9px] text-on-surface">BLK</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-glass-border flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-label-mono text-[9px] text-on-surface-variant uppercase">Lifetime Pages</span>
          <span className="font-label-mono text-[11px] text-primary-fixed">{printer.page_count?.toLocaleString() || 0}</span>
        </div>
        <Link to={`/printers/${printer.id}`} className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[10px] font-label-mono font-bold px-3 py-1.5 rounded transition-colors">
          DETAILS
        </Link>
      </div>

    </div>
  );
};

export default PrinterCard;
