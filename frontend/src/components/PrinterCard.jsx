import React, { useState } from 'react';
import { RefreshCw, Trash2, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Printer, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { getPrinterHistory } from '../services/api';
import { Link } from 'react-router-dom';

const CircularProgress = ({ pct, label, colorHex }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ position: 'relative', width: '70px', height: '70px' }}>
        <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="6"
          />
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke={colorHex}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="circular-progress-circle"
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: colorHex
        }}>
          {pct}%
        </div>
      </div>
    </div>
  );
};

const AdvancedBar = ({ pct, label, colorHex, icon: Icon }) => {
  const isLow = pct < 20 && pct > 0;
  const actualColor = isLow ? '#EF4444' : colorHex;

  return (
    <div style={{ marginBottom: '0.8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
          {Icon && <Icon size={12} />} {label}
        </span>
        <span style={{ color: actualColor }}>{pct}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${pct}%`, 
            background: actualColor, 
            borderRadius: '4px',
            transition: 'width 1s ease-in-out'
          }}
        />
      </div>
    </div>
  );
}

const PrinterCard = ({ printer, handleRefresh, handleDelete, refreshing, deleting, isFavorite, onToggleFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const toggleHistory = async (e) => {
    e.stopPropagation();
    if (!isExpanded) {
      setIsExpanded(true);
      setLoadingHistory(true);
      try {
        const data = await getPrinterHistory(printer.id);
        setHistory(data.reverse()); // Show newest first
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoadingHistory(false);
      }
    } else {
      setIsExpanded(false);
    }
  };
  // Use is_color from DB (set by SNMP detection); fallback to checking if any color toner is non-null
  const isMonochrome = printer.is_color === false || (printer.toner_cyan == null && printer.toner_magenta == null && printer.toner_yellow == null);
  const isWarning = (printer.toner_black != null && printer.toner_black < 20) ||
    (!isMonochrome && (
      (printer.toner_cyan != null && printer.toner_cyan < 20) ||
      (printer.toner_magenta != null && printer.toner_magenta < 20) ||
      (printer.toner_yellow != null && printer.toner_yellow < 20)
    ));
  
  let borderColor = printer.online ? (isWarning ? '#F59E0B' : '#10B981') : '#EF4444';
  let statusBg = printer.online ? (isWarning ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)') : 'rgba(239,68,68,0.15)';
  let statusText = printer.online ? (isWarning ? 'Warning: Low Toner' : 'Ready') : 'Offline';
  
  if (printer.printer_status && printer.printer_status !== "Ready" && printer.printer_status !== "Online" && printer.printer_status !== "Unknown") {
      statusText = printer.printer_status;
      borderColor = '#F59E0B';
      statusBg = 'rgba(245,158,11,0.15)';
  }

  return (
    <div 
      className="glass-card printer-card" 
      style={{ 
        borderTop: `4px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.25rem'
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Printer size={16} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', textTransform: 'uppercase' }}>{printer.hostname || printer.model || 'Unknown Device'}</h3>
            {onToggleFavorite && (
              <button 
                className="btn" 
                style={{ padding: 0, background: 'transparent', border: 'none', color: isFavorite ? '#FCD34D' : 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(printer.ip_address); }}
                title={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มเข้ารายการโปรด"}
              >
                {isFavorite ? '⭐' : '☆'}
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px' }}>
            <span style={{ fontWeight: 600 }}>IP:</span> <span>{printer.ip_address}</span>
            <span style={{ fontWeight: 600 }}>Location:</span> <span>{printer.location || '-'}</span>
            <span style={{ fontWeight: 600 }}>Serial No:</span> <span>{printer.serial_number || '-'}</span>
          </div>
        </div>
        
        {printer.online ? (
          <span className="badge badge-success">
            <span className="pulse-dot" style={{ backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }}></span> ONLINE
          </span>
        ) : (
          <span className="badge badge-danger">
            <span className="pulse-dot danger"></span> OFFLINE
          </span>
        )}
      </div>

      {/* Status Banner */}
      <div style={{ 
        background: statusBg, 
        border: `1px solid ${borderColor}`, 
        padding: '0.5rem 0.8rem', 
        borderRadius: '8px',
        color: borderColor,
        fontSize: '0.85rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {statusText === 'Ready' ? <CheckCircle2 size={16} /> : (statusText === 'Offline' ? <span className="pulse-dot danger"></span> : <span className="pulse-dot warning"></span>)}
        <span>Status: {statusText}</span>
      </div>

      {/* Primary Metrics (Toner & Drum) */}
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '0.5rem 0' }}>
        <CircularProgress pct={printer.toner_black ?? 0} label="TONER (K)" colorHex="#94A3B8" />
        {printer.drum_unit != null && printer.drum_unit > 0 && (
          <CircularProgress pct={printer.drum_unit} label="DRUM" colorHex="#10B981" />
        )}
      </div>

      {/* Color Toners (If applicable) */}
      {!isMonochrome && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1 }}><AdvancedBar pct={printer.toner_cyan} label="Cyan" colorHex="#06B6D4" /></div>
            <div style={{ flex: 1 }}><AdvancedBar pct={printer.toner_magenta} label="Magenta" colorHex="#EC4899" /></div>
            <div style={{ flex: 1 }}><AdvancedBar pct={printer.toner_yellow} label="Yellow" colorHex="#EAB308" /></div>
        </div>
      )}

      {/* Advanced Components (If applicable) */}
      {(printer.fuser_unit > 0 || printer.laser_unit > 0 || printer.pf_kit_mp > 0) && (
        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
          {printer.fuser_unit > 0 && <AdvancedBar pct={printer.fuser_unit} label="Fuser Unit" colorHex="#8B5CF6" icon={Wrench} />}
          {printer.laser_unit > 0 && <AdvancedBar pct={printer.laser_unit} label="Laser Unit" colorHex="#3B82F6" icon={Wrench} />}
          {printer.pf_kit_mp > 0 && <AdvancedBar pct={printer.pf_kit_mp} label="PF Kit MP" colorHex="#6366F1" icon={Wrench} />}
          {printer.pf_kit_1 > 0 && <AdvancedBar pct={printer.pf_kit_1} label="PF Kit 1" colorHex="#14B8A6" icon={Wrench} />}
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <div><span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{printer.page_count?.toLocaleString() || 0}</span> pages</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            อัปเดตล่าสุด: {printer.last_update ? new Date(printer.last_update).toLocaleTimeString('th-TH') : 'ไม่เคยอัปเดต'}
          </div>
        </div>
        
        <div className="printer-card-actions" style={{ gap: '0.5rem', display: 'flex' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
            onClick={toggleHistory}
          >
            📊 {isExpanded ? 'ซ่อนประวัติ' : 'ดูประวัติ'} {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <Link 
            to={`/printers/${printer.id}`}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', borderRadius: '6px' }}
            title="Full Details"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Inline History section */}
      <div className={`history-dropdown ${isExpanded ? 'expanded' : ''}`} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: isExpanded ? '1rem' : '0', marginTop: isExpanded ? '0.5rem' : '0', fontSize: '0.8rem' }}>
        {loadingHistory ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>📭 ยังไม่มีประวัติ</div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {history.map((entry, idx) => {
                const prev = history[idx + 1];
                let tonerDiff = 0;
                let drumDiff = 0;
                
                if (prev && entry.toner_black !== null && prev.toner_black !== null) {
                  tonerDiff = entry.toner_black - prev.toner_black;
                }
                if (prev && entry.drum_unit !== null && prev.drum_unit !== null) {
                  drumDiff = entry.drum_unit - prev.drum_unit;
                }

                return (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🖊 {entry.toner_black ?? '?'}% 
                        {tonerDiff !== 0 && (
                          <span style={{ color: tonerDiff > 0 ? '#10B981' : '#EF4444', fontSize: '0.7rem' }}>
                            {tonerDiff > 0 ? '+' : ''}{tonerDiff}%
                          </span>
                        )}
                      </span>
                      {entry.drum_unit !== null && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🔧 {entry.drum_unit}%
                          {drumDiff !== 0 && (
                            <span style={{ color: drumDiff > 0 ? '#10B981' : '#EF4444', fontSize: '0.7rem' }}>
                              {drumDiff > 0 ? '+' : ''}{drumDiff}%
                            </span>
                          )}
                        </span>
                      )}
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

export default PrinterCard;
