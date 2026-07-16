import React from 'react';

const Reports = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-lg relative z-10 pb-md">
      {/* Page Header */}
      <div className="flex items-center gap-sm mb-lg">
        <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">System Telemetry</h2>
      </div>

      {/* Analytics Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="glass-panel rounded-xl p-lg space-y-xs neon-glow-indigo">
          <p className="font-label-mono text-label-mono text-outline uppercase">Total Events</p>
          <p className="font-display-lg text-display-lg text-primary">0</p>
          <p className="text-secondary-container text-label-micro flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">trending_flat</span> 0% from yesterday
          </p>
        </div>
        <div className="glass-panel rounded-xl p-lg space-y-xs neon-glow-error">
          <p className="font-label-mono text-label-mono text-outline uppercase">Critical Alerts</p>
          <p className="font-display-lg text-display-lg text-error">0</p>
          <p className="text-outline text-label-micro flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">check_circle</span> No action required
          </p>
        </div>
        <div className="glass-panel rounded-xl p-lg space-y-xs neon-glow-cyan">
          <p className="font-label-mono text-label-mono text-outline uppercase">Network Load</p>
          <p className="font-display-lg text-display-lg text-secondary-container">0%</p>
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-secondary-container h-full w-[0%]"></div>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-lg space-y-xs">
          <p className="font-label-mono text-label-mono text-outline uppercase">Uptime</p>
          <p className="font-display-lg text-display-lg text-on-surface">-</p>
          <p className="text-outline text-label-micro flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">hourglass_empty</span> Waiting for data
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md glass-panel p-md rounded-xl">
        <div className="flex flex-wrap items-center gap-md">
          <div className="flex items-center gap-sm bg-surface-container-high/50 px-md py-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
            <span className="text-label-mono text-on-surface">Last 24 Hours</span>
            <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
          </div>
          <div className="flex items-center gap-sm bg-surface-container-high/50 px-md py-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-sm text-outline">filter_list</span>
            <span className="text-label-mono text-on-surface">All Sources</span>
            <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
          </div>
          <div className="flex items-center gap-sm bg-surface-container-high/50 px-md py-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-sm text-outline">error_outline</span>
            <span className="text-label-mono text-on-surface">All Severities</span>
            <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
          </div>
        </div>
        <button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-label-mono text-label-mono flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(173,199,255,0.2)]">
          <span className="material-symbols-outlined">download</span>
          Export Log
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-glass-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container-highest/30 border-b border-glass-border">
                <th className="px-lg py-md font-label-mono text-label-mono text-outline uppercase">Timestamp</th>
                <th className="px-lg py-md font-label-mono text-label-mono text-outline uppercase">Severity</th>
                <th className="px-lg py-md font-label-mono text-label-mono text-outline uppercase">Source</th>
                <th className="px-lg py-md font-label-mono text-label-mono text-outline uppercase w-full">Event Message</th>
                <th className="px-lg py-md font-label-mono text-label-mono text-outline uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border font-label-mono text-body-base">
              {/* Data will be populated from real scan results */}
              <tr>
                <td colSpan="5" className="px-lg py-xl text-center text-on-surface-variant opacity-70">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                    <p>No system logs available.</p>
                    <p className="text-label-micro">Real data will be displayed here when devices are scanned and added.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-lg flex items-center justify-between border-t border-glass-border bg-surface-container-high/20">
          <span className="text-label-mono text-outline">Showing 0 events</span>
          <div className="flex items-center gap-sm">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white/5 text-outline hover:text-on-surface active:scale-95 transition-all opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-white/5 text-outline hover:text-on-surface active:scale-95 transition-all opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Assets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-panel rounded-xl p-lg h-64 relative overflow-hidden flex flex-col justify-end group">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqsqdf8FnYg_v-mAy9t-55dHCP419nBkaQK93Ftj4fCRWVrhKX-w0DG-mbqR2GLzEHkjUb2HHPqp4T_VtfcTCB4C0lYYctqtXvKhdpHEOTZ1nBeZCZa1RGRR26jDQ7lC_hXbhoRxxESFt2tRh0NE_aOPKPQ1YMSMGMBtisUYoSMW_9F_cmUCEgxwjVIUk9Nyu_t6ub3EJlK-mhtCmce4ct2uXaw18m_npIqFmzqmBsr8vKdskFEXju" 
              alt="Network Map"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-on-surface font-bold drop-shadow-md">Network Map Overview</h3>
            <p className="text-on-surface-variant font-body-base drop-shadow-md">Real-time node connectivity visualization across local clusters.</p>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-lg h-64 relative overflow-hidden flex flex-col justify-end group">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ2ZJk2vq__SAEwqNDML1o825HdABW9B_QYwv-s5Qu9xzSjJpUyBcEIfodS6EuDeTqDG_8fZGk5JLwTbRFD-DOYjkJ7vTA1vVdChdlsJDM94QZaOUVy5YPlp7QWM46pe5Q8x3zE7Wg_JVmGiUf3dS9RUpFp4qaSmUSX7bh8yqztapJlUrjtSZEt7cjLHkGXceSofAmcTUolyWvVbrFEC51egMdW9Hw0xl05quTylzlKLiao4OVAxef" 
              alt="Throughput Analysis"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-on-surface font-bold drop-shadow-md">Throughput Analysis</h3>
            <p className="text-on-surface-variant font-body-base drop-shadow-md">Monitoring data packet distribution and latency spikes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
