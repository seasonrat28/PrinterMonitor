import React from 'react';

const Reports = () => {
  return (
    <div className="flex-col gap-lg pb-md relative z-10" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Page Header */}
      <div className="flex-row gap-sm mb-md">
        <h2 className="text-h2 text-accent">System Telemetry</h2>
      </div>

      {/* Analytics Header */}
      <div className="grid grid-cols-4 gap-lg">
        <div className="glass-panel p-lg flex-col gap-xs" style={{ boxShadow: '0 0 20px rgba(79, 134, 247, 0.15)' }}>
          <p className="text-mono text-micro text-muted">Total Events</p>
          <p className="text-display text-accent">0</p>
          <p className="text-micro flex-row gap-xs" style={{ color: 'var(--accent-secondary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_flat</span> 0% from yesterday
          </p>
        </div>
        <div className="glass-panel p-lg flex-col gap-xs" style={{ boxShadow: '0 0 20px rgba(255, 61, 0, 0.15)' }}>
          <p className="text-mono text-micro text-muted">Critical Alerts</p>
          <p className="text-display text-error">0</p>
          <p className="text-micro flex-row gap-xs text-muted">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span> No action required
          </p>
        </div>
        <div className="glass-panel p-lg flex-col gap-xs" style={{ boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)' }}>
          <p className="text-mono text-micro text-muted">Network Load</p>
          <p className="text-display" style={{ color: 'var(--accent-secondary)' }}>0%</p>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ background: 'var(--accent-secondary)', height: '100%', width: '0%' }}></div>
          </div>
        </div>
        <div className="glass-panel p-lg flex-col gap-xs">
          <p className="text-mono text-micro text-muted">Uptime</p>
          <p className="text-display">-</p>
          <p className="text-micro flex-row gap-xs text-muted">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>hourglass_empty</span> Waiting for data
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-md flex-between flex-wrap gap-md mt-md">
        <div className="flex-row flex-wrap gap-md">
          <div className="flex-row gap-sm cursor-pointer transition-normal" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>calendar_today</span>
            <span className="text-mono text-small">Last 24 Hours</span>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>expand_more</span>
          </div>
          <div className="flex-row gap-sm cursor-pointer transition-normal" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>filter_list</span>
            <span className="text-mono text-small">All Sources</span>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>expand_more</span>
          </div>
          <div className="flex-row gap-sm cursor-pointer transition-normal" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>error_outline</span>
            <span className="text-mono text-small">All Severities</span>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '16px' }}>expand_more</span>
          </div>
        </div>
        <button className="btn btn-primary text-mono">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
          Export Log
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-panel flex-col" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Source</th>
                <th style={{ width: '100%' }}>Event Message</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-center" style={{ padding: '3rem 1rem' }}>
                  <div className="flex-col flex-center gap-sm opacity-70">
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>inventory_2</span>
                    <p className="text-body" style={{ color: 'var(--text-secondary)' }}>No system logs available.</p>
                    <p className="text-micro text-muted" style={{ textTransform: 'none' }}>Real data will be displayed here when devices are scanned and added.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-md flex-between" style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-mono text-micro text-muted">Showing 0 events</span>
          <div className="flex-row gap-sm">
            <button className="btn-icon" style={{ width: '32px', height: '32px', opacity: 0.5, cursor: 'not-allowed' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
            <button className="btn-icon" style={{ width: '32px', height: '32px', opacity: 0.5, cursor: 'not-allowed' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Assets Section */}
      <div className="grid grid-cols-2 gap-lg" style={{ marginTop: '1rem' }}>
        <div className="glass-panel relative overflow-hidden flex-col group" style={{ height: '250px', justifyContent: 'flex-end', padding: '1.5rem' }}>
          <div className="absolute z-0" style={{ inset: 0 }}>
            <img 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, transition: 'transform 0.7s ease' }}
              className="group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqsqdf8FnYg_v-mAy9t-55dHCP419nBkaQK93Ftj4fCRWVrhKX-w0DG-mbqR2GLzEHkjUb2HHPqp4T_VtfcTCB4C0lYYctqtXvKhdpHEOTZ1nBeZCZa1RGRR26jDQ7lC_hXbhoRxxESFt2tRh0NE_aOPKPQ1YMSMGMBtisUYoSMW_9F_cmUCEgxwjVIUk9Nyu_t6ub3EJlK-mhtCmce4ct2uXaw18m_npIqFmzqmBsr8vKdskFEXju" 
              alt="Network Map"
            />
            <div className="absolute" style={{ inset: 0, background: 'linear-gradient(to top, var(--bg-secondary) 0%, rgba(19, 20, 28, 0.4) 50%, transparent 100%)' }}></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-h3" style={{ fontWeight: '700', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Network Map Overview</h3>
            <p className="text-body text-secondary" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Real-time node connectivity visualization across local clusters.</p>
          </div>
        </div>
        
        <div className="glass-panel relative overflow-hidden flex-col group" style={{ height: '250px', justifyContent: 'flex-end', padding: '1.5rem' }}>
          <div className="absolute z-0" style={{ inset: 0 }}>
            <img 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, transition: 'transform 0.7s ease' }}
              className="group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ2ZJk2vq__SAEwqNDML1o825HdABW9B_QYwv-s5Qu9xzSjJpUyBcEIfodS6EuDeTqDG_8fZGk5JLwTbRFD-DOYjkJ7vTA1vVdChdlsJDM94QZaOUVy5YPlp7QWM46pe5Q8x3zE7Wg_JVmGiUf3dS9RUpFp4qaSmUSX7bh8yqztapJlUrjtSZEt7cjLHkGXceSofAmcTUolyWvVbrFEC51egMdW9Hw0xl05quTylzlKLiao4OVAxef" 
              alt="Throughput Analysis"
            />
            <div className="absolute" style={{ inset: 0, background: 'linear-gradient(to top, var(--bg-secondary) 0%, rgba(19, 20, 28, 0.4) 50%, transparent 100%)' }}></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-h3" style={{ fontWeight: '700', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Throughput Analysis</h3>
            <p className="text-body text-secondary" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Monitoring data packet distribution and latency spikes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
