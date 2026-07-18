import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getSettings, getPrinterList, getBlacklist, getLogs } from '../services/remoteApi';
import { useFavorites } from '../hooks/useFavorites';
import { AlertCircle, Server } from 'lucide-react';

import SearchBar from '../components/SearchBar';
import PrinterCard from '../components/PrinterCard';
import PrinterTable from '../components/PrinterTable';

const Dashboard = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Settings
  const [refreshInterval, setRefreshInterval] = useState(60);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState(localStorage.getItem('dashboardViewMode') || 'cards');
  const [supplyFilter, setSupplyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ip_asc');
  
  // Hooks
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  const abortControllerRef = useRef(null);

  const fetchData = async () => {
    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setError(null);
      
      const [settingsRes, ipListRes, blacklistRes, logsRes] = await Promise.all([
        getSettings(signal),
        getPrinterList(signal),
        getBlacklist(signal),
        getLogs(signal)
      ]);

      if (settingsRes && settingsRes.refresh_interval) {
        setRefreshInterval(settingsRes.refresh_interval);
      }

      const activeIPs = (ipListRes || []).filter(ip => !(blacklistRes || []).includes(ip));
      
      const merged = activeIPs.map(ip => ({
        ip,
        data: (logsRes && logsRes[ip]) || { name: 'Unknown', logs: [] }
      }));

      setPrinters(merged);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('Failed to fetch data from remote server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    // Setup interval
    const timer = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  // Apply filters and sorting
  const filteredPrinters = printers.filter(p => {
    // Tab Filter
    if (activeTab === 'favorites' && !isFavorite(p.ip)) return false;

    // Text Search
    if (search) {
      const s = search.toLowerCase();
      const name = (p.data?.name || '').toLowerCase();
      if (!p.ip.includes(s) && !name.includes(s)) return false;
    }

    // Supply Filter
    const latest = p.data?.logs?.[0];
    if (supplyFilter !== 'all') {
      const isLowToner20 = latest?.toner != null && latest.toner <= 20;
      const isLowToner50 = latest?.toner != null && latest.toner <= 50;
      const isLowDrum20 = latest?.drum != null && latest.drum <= 20;
      const isLowDrum50 = latest?.drum != null && latest.drum <= 50;
      
      if (supplyFilter === 'toner_20' && !isLowToner20) return false;
      if (supplyFilter === 'toner_50' && !isLowToner50) return false;
      if (supplyFilter === 'drum_20' && !isLowDrum20) return false;
      if (supplyFilter === 'drum_50' && !isLowDrum50) return false;
    }

    return true;
  }).sort((a, b) => {
    const tonerA = a.data?.logs?.[0]?.toner ?? 100;
    const tonerB = b.data?.logs?.[0]?.toner ?? 100;
    const drumA = a.data?.logs?.[0]?.drum ?? 100;
    const drumB = b.data?.logs?.[0]?.drum ?? 100;
    const nameA = a.data?.name || '';
    const nameB = b.data?.name || '';

    if (sortBy === 'ip_asc') return a.ip.localeCompare(b.ip, undefined, {numeric: true});
    if (sortBy === 'ip_desc') return b.ip.localeCompare(a.ip, undefined, {numeric: true});
    if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
    if (sortBy === 'name_desc') return nameB.localeCompare(nameA);
    if (sortBy === 'toner_asc') return tonerA - tonerB;
    if (sortBy === 'toner_desc') return tonerB - tonerA;
    if (sortBy === 'drum_asc') return drumA - drumB;
    if (sortBy === 'drum_desc') return drumB - drumA;

    return 0;
  });

  return (
    <div style={{ display: 'flex', position: 'relative', minHeight: 'calc(100vh - 100px)' }}>
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div className="page-header animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animationDelay: '0.1s' }}>
          <div>
            <h1 className="page-title">Remote Printer Dashboard</h1>
            <p className="page-subtitle">Monitoring all network printers across branches (Auto-refreshes every {refreshInterval}s)</p>
          </div>
          
          <SearchBar 
            search={search} setSearch={setSearch}
            activeTab={activeTab} setActiveTab={setActiveTab}
            viewMode={viewMode} setViewMode={setViewMode}
            supplyFilter={supplyFilter} setSupplyFilter={setSupplyFilter}
            sortBy={sortBy} setSortBy={setSortBy}
            favoritesCount={favorites.length}
            totalCount={printers.length}
          />
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '8px', marginBottom: '1rem' }}>
            <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            <span style={{ verticalAlign: 'middle' }}>{error}</span>
          </div>
        )}

        {loading && printers.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
            <Server size={32} className="spin" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <div>Loading printer data from remote API...</div>
          </div>
        ) : filteredPrinters.length > 0 ? (
          viewMode === 'table' ? (
            <PrinterTable 
              printers={filteredPrinters}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              sortBy={sortBy}
              onSort={setSortBy}
            />
          ) : (
            <div className="printers-grid">
              {filteredPrinters.map((printer, idx) => (
                <div key={printer.ip} className="animate-fade-in-up" style={{ animationDelay: `${0.1 + (idx * 0.05)}s`, animationFillMode: 'both' }}>
                  <PrinterCard 
                    ip={printer.ip}
                    data={printer.data}
                    isFavorite={isFavorite(printer.ip)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
           <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', maxWidth: '450px', margin: '4rem auto' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1.5rem', display: 'block', opacity: 0.5, color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No printers found</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Try adjusting your search or filters.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
