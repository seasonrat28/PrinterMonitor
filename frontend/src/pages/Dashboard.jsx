import React, { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/api';
import { Server, CheckCircle, XCircle, AlertTriangle, Droplets, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

const TonerMini = ({ level, color }) => {
  const colors = { k: '#64748B', c: '#06B6D4', m: '#EC4899', y: '#EAB308' };
  const bg = colors[color] || '#64748B';
  const pct = Math.max(0, Math.min(100, level ?? 0));
  const isLow = pct < 20;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 22 }}>
      <span style={{ fontSize: '0.6rem', color: isLow ? '#F87171' : 'var(--text-muted)', fontWeight: 600 }}>{pct}%</span>
      <span style={{
        width: 12, height: 36, borderRadius: 4, background: 'rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'flex-end', overflow: 'hidden'
      }}>
        <span style={{
          width: '100%', height: `${pct}%`, background: isLow ? '#EF4444' : bg,
          transition: 'height 0.4s', borderRadius: 4
        }} />
      </span>
      <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{color}</span>
    </span>
  );
};

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total: 0, online: 0, offline: 0, apeos4620: 0,
    low_toner: 0, recent_printers: [], low_toner_printers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
    const timer = setInterval(fetchSummary, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Printers', value: summary.total, icon: <Server size={22} />, color: 'var(--info)' },
    { label: 'Online', value: summary.online, icon: <CheckCircle size={22} />, color: 'var(--success)' },
    { label: 'Offline', value: summary.offline, icon: <XCircle size={22} />, color: 'var(--danger)' },
    { label: 'Toner Warning', value: summary.low_toner, icon: <Droplets size={22} />, color: '#F59E0B' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of all printers in the network — auto-refreshes every 15 seconds.</p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="stats-grid">
            {statCards.map(card => (
              <div className="glass-card stat-card" key={card.label}>
                <div className="stat-header">
                  <span>{card.label}</span>
                  <div className="stat-icon" style={{ color: card.color }}>{card.icon}</div>
                </div>
                <div className="stat-value" style={{ color: card.value > 0 && card.label === 'Toner Warning' ? '#F59E0B' : undefined }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>

            {/* ── Recent Online Printers ── */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Wifi size={18} style={{ color: 'var(--success)' }} />
                <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Recent Online Printers</h3>
              </div>

              {summary.recent_printers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No printers online yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['IP Address', 'Model', 'Pages', 'Toner'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid var(--card-border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recent_printers.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500, fontSize: '0.85rem' }}>
                          <Link to={`/printers/${p.id}`} style={{ color: 'var(--info)', textDecoration: 'none' }}>{p.ip_address}</Link>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.model}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}>{(p.page_count ?? 0).toLocaleString()}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                            <TonerMini level={p.toner_black} color="k" />
                            <TonerMini level={p.toner_cyan} color="c" />
                            <TonerMini level={p.toner_magenta} color="m" />
                            <TonerMini level={p.toner_yellow} color="y" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Toner Alerts ── */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
                <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Toner Alerts <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>(below 20%)</span></h3>
              </div>

              {summary.low_toner_printers.length === 0 ? (
                <p style={{ color: 'var(--success)', textAlign: 'center', padding: '1.5rem 0', fontWeight: 500 }}>✓ All toner levels are OK</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {summary.low_toner_printers.map(p => {
                    const alerts = [
                      p.toner_black < 20 && { label: 'Black', val: p.toner_black, color: '#64748B' },
                      p.toner_cyan < 20 && { label: 'Cyan', val: p.toner_cyan, color: '#06B6D4' },
                      p.toner_magenta < 20 && { label: 'Magenta', val: p.toner_magenta, color: '#EC4899' },
                      p.toner_yellow < 20 && { label: 'Yellow', val: p.toner_yellow, color: '#EAB308' },
                    ].filter(Boolean);
                    return (
                      <div key={p.id} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <Link to={`/printers/${p.id}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: 'none' }}>{p.ip_address}</Link>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.model}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {alerts.map(a => (
                            <span key={a.label} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#F87171' }}>
                              {a.label}: {a.val}%
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
