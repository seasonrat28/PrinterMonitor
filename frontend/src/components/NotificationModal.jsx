import React from 'react';
import { X, Bell, AlertTriangle, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationModal = ({ isOpen, onClose, printers }) => {
  // Compute alerts
  const alerts = [];
  printers.forEach(p => {
    if (!p.online) {
      alerts.push({
        id: p.id,
        ip: p.ip_address,
        name: p.hostname || p.model || 'Unknown',
        type: 'offline',
        message: 'Printer is Offline',
        color: '#EF4444',
        icon: XCircle
      });
      return; // Skip other checks if offline
    }

    if (p.printer_status && p.printer_status !== 'Ready' && p.printer_status !== 'Unknown') {
      alerts.push({
        id: p.id,
        ip: p.ip_address,
        name: p.hostname || p.model || 'Unknown',
        type: 'status',
        message: `Status: ${p.printer_status}`,
        color: '#F59E0B',
        icon: AlertTriangle
      });
    }

    const isMonochrome = p.is_color === false || (p.is_color === undefined && !p.toner_cyan && !p.toner_magenta && !p.toner_yellow);
    
    if (p.toner_black != null && p.toner_black < 20) {
      alerts.push({ id: p.id, ip: p.ip_address, name: p.hostname || p.model || 'Unknown', type: 'toner', message: `Low Black Toner (${p.toner_black}%)`, color: '#F59E0B', icon: AlertCircle });
    }
    if (!isMonochrome) {
      if (p.toner_cyan != null && p.toner_cyan < 20) alerts.push({ id: p.id, ip: p.ip_address, name: p.hostname || p.model || 'Unknown', type: 'toner', message: `Low Cyan Toner (${p.toner_cyan}%)`, color: '#F59E0B', icon: AlertCircle });
      if (p.toner_magenta != null && p.toner_magenta < 20) alerts.push({ id: p.id, ip: p.ip_address, name: p.hostname || p.model || 'Unknown', type: 'toner', message: `Low Magenta Toner (${p.toner_magenta}%)`, color: '#F59E0B', icon: AlertCircle });
      if (p.toner_yellow != null && p.toner_yellow < 20) alerts.push({ id: p.id, ip: p.ip_address, name: p.hostname || p.model || 'Unknown', type: 'toner', message: `Low Yellow Toner (${p.toner_yellow}%)`, color: '#F59E0B', icon: AlertCircle });
    }
    
    // Drum and Components Check (e.g. less than 10%)
    if (p.drum_unit !== undefined && p.drum_unit > 0 && p.drum_unit < 10) {
      alerts.push({ id: p.id, ip: p.ip_address, name: p.hostname || p.model || 'Unknown', type: 'component', message: `Low Drum Unit (${p.drum_unit}%)`, color: '#F59E0B', icon: AlertCircle });
    }
    if (p.fuser_unit !== undefined && p.fuser_unit > 0 && p.fuser_unit < 10) {
      alerts.push({ id: p.id, ip: p.ip_address, name: p.hostname || p.model || 'Unknown', type: 'component', message: `Low Fuser Unit (${p.fuser_unit}%)`, color: '#F59E0B', icon: AlertCircle });
    }
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0, 
      right: isOpen ? '80px' : '-400px', // Slide in from right (80px to avoid overlapping sidebar)
      bottom: 0,
      width: '350px',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(10px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      transition: 'right 0.3s ease-in-out',
      boxShadow: '-5px 0 15px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        height: '100%'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Bell size={20} style={{ color: 'var(--primary)' }} />
          การแจ้งเตือน (Alerts)
        </h3>
        
        <div style={{ overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={32} style={{ color: '#10B981', margin: '0 auto 0.5rem' }} />
              ไม่มีการแจ้งเตือน<br/>เครื่องปริ้นเตอร์ทั้งหมดทำงานปกติ
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <Link 
                to={`/printers/${alert.id}`}
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '1rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${alert.color}`,
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ color: alert.color, marginTop: '2px' }}>
                  <alert.icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {alert.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({alert.ip})</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: alert.color, marginTop: '4px' }}>
                    {alert.message}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
