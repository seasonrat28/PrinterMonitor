import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getPrinters } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavorites();

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, printersData] = await Promise.all([getDashboardSummary(), getPrinters()]);
      setSummary(summaryData);
      setPrinters(printersData || []);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000); // 30s
    return () => clearInterval(timer);
  }, []);

  const lowToner = summary?.low_toner_printers || [];
  const recentPrinters = summary?.recent_printers || [];
  
  // Averages for Toner Utilization Decay
  const avgBlack = Math.round(printers.reduce((acc, p) => acc + (p.toner_black ?? 100), 0) / (printers.length || 1));
  const avgCyan = Math.round(printers.reduce((acc, p) => acc + (p.toner_cyan ?? 100), 0) / (printers.length || 1));
  const avgMagenta = Math.round(printers.reduce((acc, p) => acc + (p.toner_magenta ?? 100), 0) / (printers.length || 1));
  const avgYellow = Math.round(printers.reduce((acc, p) => acc + (p.toner_yellow ?? 100), 0) / (printers.length || 1));
  const overallAvg = Math.round((avgBlack + avgCyan + avgMagenta + avgYellow) / 4);

  // Priority Watchlist
  let priorityList = printers.filter(p => favorites.includes(p.ip_address));
  if (priorityList.length === 0) {
    priorityList = printers.slice(0, 4); // Fallback to first 4
  } else {
    priorityList = priorityList.slice(0, 4);
  }

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '-';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading && !summary) {
    return <div className="text-center text-on-surface-variant font-label-mono mt-xl">INITIALIZING PRINTERMONITOR...</div>;
  }

  return (
    <div className="space-y-lg">
      
      {/* 1. Top-Level Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        
        {/* Total Printers */}
        <div className="glass-panel p-lg rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary-container p-2 bg-primary/10 rounded-lg">print</span>
            <span className="font-label-micro text-label-micro bg-primary/10 text-primary-fixed px-2 py-1 rounded">FLEET</span>
          </div>
          <div>
            <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest mb-1">Total Printers</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-4xl font-bold font-display-lg text-primary">{summary?.total ?? 0}</span>
              <span className="font-label-mono text-label-mono text-on-surface-variant">units</span>
            </div>
          </div>
        </div>
        
        {/* Online Now */}
        <div className="glass-panel p-lg rounded-xl flex flex-col justify-between scanline-effect relative">
          <div className="flex justify-between items-start mb-4 relative z-20">
            <span className="material-symbols-outlined text-secondary-container p-2 bg-secondary/10 rounded-lg">router</span>
            <div className="flex items-center gap-1 text-secondary-container">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </div>
          </div>
          <div className="relative z-20">
            <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest mb-1">Online Now</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-4xl font-bold font-display-lg text-secondary-container">{summary?.online ?? 0}</span>
              <span className="font-label-mono text-label-mono text-secondary-container/60">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Offline Units */}
        <div className="glass-panel p-lg rounded-xl flex flex-col justify-between neon-glow-error border-error/20">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-error p-2 bg-error/10 rounded-lg">warning</span>
            <span className="font-label-micro text-label-micro bg-error/20 text-error px-2 py-1 rounded">ALERT</span>
          </div>
          <div>
            <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest mb-1">Offline Units</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-4xl font-bold font-display-lg text-error">{summary?.offline ?? 0}</span>
              <span className="font-label-mono text-label-mono text-error/60">CRITICAL</span>
            </div>
          </div>
        </div>

        {/* Low Toner */}
        <div className="glass-panel p-lg rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-tertiary-container p-2 bg-tertiary/10 rounded-lg">format_color_fill</span>
            <span className="font-label-micro text-label-micro bg-tertiary/10 text-tertiary px-2 py-1 rounded">SUPPLIES</span>
          </div>
          <div>
            <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest mb-1">Low Toner Alerts</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-4xl font-bold font-display-lg text-tertiary">{summary?.low_toner ?? 0}</span>
              <span className="font-label-mono text-label-mono text-tertiary/60">REFILL</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Central Analytical Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
        {/* Page Count Trend */}
        <div className="glass-panel rounded-xl p-lg flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline-md text-[18px] text-on-surface font-semibold flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">insights</span>
                Page Count Trend
              </h3>
              <p className="text-label-micro text-on-surface-variant uppercase tracking-widest">System-wide Print Volume</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-label-mono text-label-micro bg-primary/10 text-primary-fixed rounded">7D</button>
              <button className="px-3 py-1 text-label-mono text-label-micro hover:bg-surface-container-highest rounded transition-colors">30D</button>
            </div>
          </div>
          <div className="flex-1 w-full chart-grid relative rounded-lg border border-glass-border flex items-end p-4 gap-4 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0 80 Q 50 70, 100 85 T 200 40 T 300 60 T 400 20" fill="none" stroke="#adc7ff" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(173,199,255,0.4)]"></path>
              <path d="M0 80 Q 50 70, 100 85 T 200 40 T 300 60 T 400 20 L 400 100 L 0 100 Z" fill="url(#grad1)" opacity="0.1"></path>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#adc7ff', stopOpacity: 1 }}></stop>
                  <stop offset="100%" style={{ stopColor: '#adc7ff', stopOpacity: 0 }}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-label-micro text-on-surface-variant/40 font-label-mono">
              <span>DAY 1</span><span>DAY 3</span><span>DAY 5</span><span>TODAY</span>
            </div>
          </div>
        </div>

        {/* Toner Utilization Decay */}
        <div className="glass-panel rounded-xl p-lg flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline-md text-[18px] text-on-surface font-semibold flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary-container">bar_chart_4_bars</span>
                Toner Utilization Decay
              </h3>
              <p className="text-label-micro text-on-surface-variant uppercase tracking-widest">Aggregate Consumable Lifecycle</p>
            </div>
            <span className="text-label-mono text-label-micro text-secondary-container bg-secondary-container/10 px-2 py-1 rounded">
              AVG {overallAvg}%
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-between chart-grid p-4 border border-glass-border rounded-lg">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-label-mono text-label-micro uppercase">
                  <span className="text-on-surface">Black (K)</span>
                  <span className="text-on-surface-variant">{avgBlack}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-on-surface" style={{ width: `${avgBlack}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-label-mono text-label-micro uppercase">
                  <span className="text-secondary-container">Cyan (C)</span>
                  <span className="text-on-surface-variant">{avgCyan}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container" style={{ width: `${avgCyan}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-label-mono text-label-micro uppercase">
                  <span className="text-error">Magenta (M)</span>
                  <span className="text-on-surface-variant">{avgMagenta}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-error" style={{ width: `${avgMagenta}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-label-mono text-label-micro uppercase">
                  <span className="text-tertiary">Yellow (Y)</span>
                  <span className="text-on-surface-variant">{avgYellow}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary" style={{ width: `${avgYellow}%` }}></div>
                </div>
              </div>
            </div>
            <p className="text-label-micro text-on-surface-variant italic mt-4">Real-time depletion estimate across all active units.</p>
          </div>
        </div>
      </div>

      {/* 3. Summary Section (Recent Logs & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Recent Scanned Devices */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="px-lg py-md border-b border-glass-border flex items-center justify-between">
            <h3 className="font-headline-md text-[18px] text-on-surface font-semibold flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">history</span>
              Recent Scan Activity
            </h3>
            <Link to="/printers" className="text-label-mono font-label-mono text-primary-container text-label-micro hover:underline transition-all">ALL LOGS</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-glass-border">
                {recentPrinters.length > 0 ? recentPrinters.map(p => (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors cursor-pointer">
                    <td className="px-lg py-4 font-body-base text-on-surface font-medium text-sm truncate max-w-[150px]">
                      {p.model || p.hostname || 'Unknown Device'}
                    </td>
                    <td className="px-lg py-4 font-label-mono text-label-micro text-on-surface-variant">
                      {p.ip_address}
                    </td>
                    <td className="px-lg py-4">
                      {p.online ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container text-label-micro font-label-micro uppercase">Online</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error/20 text-error text-label-micro font-label-micro uppercase">Offline</span>
                      )}
                    </td>
                    <td className="px-lg py-4 font-label-mono text-label-micro text-on-surface-variant text-right">
                      {getTimeAgo(p.last_update)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-lg py-8 text-center text-on-surface-variant font-label-mono">No recent activity detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Supply Alerts */}
        <div className="glass-panel rounded-xl flex flex-col">
          <div className="px-lg py-md border-b border-glass-border">
            <h3 className="font-headline-md text-[18px] text-on-surface font-semibold flex items-center gap-sm">
              <span className="material-symbols-outlined text-error">notification_important</span>
              Urgent Supplies
            </h3>
          </div>
          <div className="p-lg space-y-4 max-h-[300px] overflow-y-auto">
            {lowToner.length > 0 ? lowToner.slice(0, 4).map(p => {
              const colors = [
                { name: 'Black (K)', val: p.toner_black ?? 100, class: 'text-on-surface' },
                { name: 'Cyan (C)', val: p.toner_cyan ?? 100, class: 'text-secondary-container' },
                { name: 'Magenta (M)', val: p.toner_magenta ?? 100, class: 'text-error' },
                { name: 'Yellow (Y)', val: p.toner_yellow ?? 100, class: 'text-tertiary' }
              ];
              const lowest = colors.reduce((prev, curr) => curr.val < prev.val ? curr : prev, colors[0]);
              
              return (
                <div key={p.id} className="bg-surface-container/30 border border-glass-border rounded-lg p-md flex items-center gap-md">
                  <div className="flex-1">
                    <p className="font-body-base text-on-surface font-bold text-sm truncate w-[140px]">{p.model || p.hostname}</p>
                    <p className={`font-label-mono text-[10px] uppercase ${lowest.class}`}>{lowest.name} @ {lowest.val}%</p>
                  </div>
                  <button className="bg-primary text-on-primary font-label-mono text-[10px] px-3 py-2 rounded font-bold hover:bg-primary-fixed transition-colors">ORDER</button>
                </div>
              );
            }) : (
              <div className="text-center text-on-surface-variant font-label-mono py-8">All supplies are optimal.</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Priority Watchlist */}
      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-[18px] text-on-surface font-semibold">Priority Watchlist</h3>
          <span className="font-label-mono text-label-micro text-on-surface-variant">{priorityList.length} DEVICES PINNED</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {priorityList.map(p => {
            const isError = !p.online || (p.printer_status && p.printer_status.toLowerCase().includes('error'));
            return (
              <div key={p.id} className={`glass-panel p-md rounded-xl hover:translate-y-[-4px] transition-all cursor-pointer ${isError ? 'border-error/20' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`material-symbols-outlined text-[20px] ${isError ? 'text-error' : 'text-primary'}`}>
                    {isError ? 'report' : 'print'}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${isError ? 'bg-error' : 'bg-secondary-container'} ${isError ? '' : 'animate-pulse'}`}></div>
                </div>
                <p className="text-on-surface font-bold text-sm truncate">{p.model || p.hostname || 'Unknown'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-label-mono text-on-surface-variant">{p.ip_address}</span>
                  <span className={`text-[10px] font-label-mono ${isError ? 'text-error' : 'text-secondary-container'}`}>
                    {isError ? 'ERROR' : 'READY'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
