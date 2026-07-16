import React, { useEffect, useState } from 'react';
import { getPrinters, refreshPrinter, scanAndSavePrinters, addPrinterByIp, deletePrinterByIp, deletePrinter } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import PrinterCard from '../components/PrinterCard';
import AddPrinterModal from '../components/AddPrinterModal';
import NotificationModal from '../components/NotificationModal';

const Printers = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(null);
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const [network, setNetwork] = useState(localStorage.getItem('printerNetwork') || '10.119.35');
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState('all');
  const [supplyFilter, setSupplyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ip_asc');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    fetchPrinters();
  }, []);

  useEffect(() => {
    let timer;
    if (autoRefresh) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchPrinters();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(30);
    }
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const fetchPrinters = async () => {
    try {
      const data = await getPrinters();
      setPrinters(data);
    } catch (error) {
      console.error('Failed to fetch printers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalRefresh = async () => {
    setGlobalRefreshing(true);
    try {
      await fetchPrinters();
      setCountdown(30);
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalRefreshing(false);
    }
  }

  const handleAddPrinterByIp = async (ips) => {
    const result = await addPrinterByIp(ips);
    await fetchPrinters();
    return result;
  };

  const handleDeletePrinterByIp = async (ip) => {
    await deletePrinterByIp(ip);
    await fetchPrinters();
  };
  
  const handleCardDelete = async (id, ip) => {
    if (!window.confirm(`Delete printer ${ip}?`)) return;
    setDeleting(id);
    try {
      await deletePrinter(id);
      await fetchPrinters();
    } catch (error) {
      console.error('Failed to delete printer:', error);
      alert('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleScan = async () => {
    const prefix = network.trim();
    if (!/^\d{1,3}(?:\.\d{1,3}){2}$/.test(prefix)) {
      setScanMessage('Invalid format (e.g. 10.119.35)');
      return;
    }
    setScanning(true);
    setScanMessage('Scanning network...');
    try {
      const found = await scanAndSavePrinters(prefix, 1, 254);
      localStorage.setItem('printerNetwork', prefix);
      await fetchPrinters();
      setScanMessage(`Scan complete: found ${found.length} printers`);
    } catch (error) {
      setScanMessage('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const filteredPrinters = printers.filter(p => {
    if (activeTab === 'favorites' && !isFavorite(p.ip_address)) return false;
    if (supplyFilter.startsWith('toner_')) {
      const threshold = parseInt(supplyFilter.split('_')[1]);
      const isMonochrome = p.is_color === false || (p.is_color === undefined && !p.toner_cyan && !p.toner_magenta && !p.toner_yellow);
      const lowBlack = p.toner_black !== null && p.toner_black <= threshold;
      const lowColor = !isMonochrome && (
        (p.toner_cyan !== null && p.toner_cyan <= threshold) || 
        (p.toner_magenta !== null && p.toner_magenta <= threshold) || 
        (p.toner_yellow !== null && p.toner_yellow <= threshold)
      );
      if (!lowBlack && !lowColor) return false;
    }
    
    if (search) {
      const s = search.toLowerCase();
      const matches = (
        p.ip_address?.toLowerCase().includes(s) || 
        p.model?.toLowerCase().includes(s) ||
        p.hostname?.toLowerCase().includes(s) ||
        p.location?.toLowerCase().includes(s)
      );
      if (!matches) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'ip_asc') return a.ip_address.localeCompare(b.ip_address, undefined, {numeric: true});
    if (sortBy === 'ip_desc') return b.ip_address.localeCompare(a.ip_address, undefined, {numeric: true});
    if (sortBy === 'toner_asc') return (a.toner_black ?? 100) - (b.toner_black ?? 100);
    return 0;
  });

  const alertCount = printers.filter(p => {
    const isMonochrome = p.is_color === false || (p.is_color === undefined && !p.toner_cyan && !p.toner_magenta && !p.toner_yellow);
    const isWarning = (p.toner_black !== null && p.toner_black < 20) || (!isMonochrome && (p.toner_cyan < 20 || p.toner_magenta < 20 || p.toner_yellow < 20));
    return isWarning || (p.printer_status && p.printer_status !== 'Ready' && p.printer_status !== 'Online');
  }).length;

  return (
    <div className="flex-col gap-lg pb-md relative z-10 space-y-lg">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-md">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">Fleet Registry</h1>
          <p className="font-label-micro text-label-micro text-on-surface-variant uppercase tracking-widest mt-1">Full Database Access</p>
        </div>
        
        <div className="flex gap-sm items-center flex-wrap">
          <input
            type="text"
            className="bg-surface-container/50 border border-glass-border rounded-lg py-2 px-4 text-body-base font-body-base focus:ring-1 focus:ring-primary w-48 transition-all"
            placeholder="Network (e.g. 10.119.35)"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            disabled={scanning}
          />
          <button 
            className="bg-primary text-on-primary font-label-mono text-xs px-4 py-2.5 rounded-lg font-bold hover:bg-primary-fixed transition-colors flex items-center gap-2"
            onClick={handleScan} 
            disabled={scanning}
          >
            <span className={`material-symbols-outlined text-[16px] ${scanning ? 'spin' : ''}`}>radar</span>
            {scanning ? 'SCANNING...' : 'SCAN NETWORK'}
          </button>
        </div>
      </div>

      {/* Floating Control Bar */}
      <div className="glass-panel p-md rounded-xl flex justify-between items-center flex-wrap gap-md sticky top-0 z-20">
        <div className="flex gap-sm">
          <button 
            className={`font-label-mono text-[11px] px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'all' ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(216,227,255,0.3)]' : 'bg-surface-container/50 text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('all')}
          >
            ALL ({printers.length})
          </button>
          <button 
            className={`font-label-mono text-[11px] px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1 ${activeTab === 'favorites' ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(216,227,255,0.3)]' : 'bg-surface-container/50 text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('favorites')}
          >
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: activeTab === 'favorites' ? "'FILL' 1" : "'FILL' 0" }}>star</span>
            PINNED ({favorites.length})
          </button>
        </div>

        <div className="flex gap-md items-center flex-wrap">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">filter_list</span>
            <select 
              className="bg-surface-container/50 border border-glass-border rounded-lg py-1.5 px-3 text-label-mono font-label-mono text-on-surface focus:ring-1 focus:ring-primary transition-all appearance-none"
              value={supplyFilter} 
              onChange={(e) => setSupplyFilter(e.target.value)}
            >
              <option value="all">ALL SUPPLIES</option>
              <option value="toner_10">TONER ≤ 10%</option>
              <option value="toner_20">TONER ≤ 20%</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">sort</span>
            <select 
              className="bg-surface-container/50 border border-glass-border rounded-lg py-1.5 px-3 text-label-mono font-label-mono text-on-surface focus:ring-1 focus:ring-primary transition-all appearance-none"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="ip_asc">IP (ASC)</option>
              <option value="ip_desc">IP (DESC)</option>
              <option value="toner_asc">TONER (LOWEST)</option>
            </select>
          </div>

          <div className="relative group">
            <input 
              type="text" 
              className="bg-surface-container/50 border border-glass-border rounded-lg py-1.5 pl-9 pr-4 text-label-mono font-label-mono focus:ring-1 focus:ring-primary transition-all w-56"
              placeholder="Filter specific..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">search</span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button 
            className="w-8 h-8 rounded-lg bg-surface-container/50 border border-glass-border flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative"
            onClick={() => setIsNotificationModalOpen(true)}
            title="Alerts"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            {alertCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-background"></span>}
          </button>
          <button 
            className="w-8 h-8 rounded-lg bg-surface-container/50 border border-glass-border flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            onClick={handleGlobalRefresh} 
            disabled={globalRefreshing} 
            title="Refresh All"
          >
            <span className={`material-symbols-outlined text-[18px] ${globalRefreshing ? 'spin' : ''}`}>sync</span>
          </button>
          <button 
            className="w-auto px-2 h-8 rounded-lg bg-surface-container/50 border border-glass-border flex items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => setAutoRefresh(!autoRefresh)} 
            title="Auto Refresh"
          >
            <span className="material-symbols-outlined text-[18px]">
              {autoRefresh ? 'timer' : 'timer_off'}
            </span>
            {autoRefresh && <span className="font-label-mono text-[10px]">{countdown}s</span>}
          </button>
          <button 
            className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors ml-2"
            onClick={() => setIsModalOpen(true)} 
            title="Add/Remove by IP"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
      </div>

      {scanMessage && <p className="font-label-mono text-secondary-container text-xs">{scanMessage}</p>}

      {loading ? (
        <div className="text-center text-on-surface-variant font-label-mono mt-xl py-12">CONNECTING TO FLEET...</div>
      ) : filteredPrinters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
          {filteredPrinters.map((printer) => (
            <PrinterCard 
              key={printer.id}
              printer={printer}
              handleRefresh={async () => {
                setRefreshing(printer.id);
                await refreshPrinter(printer.id);
                await fetchPrinters();
                setRefreshing(null);
              }}
              handleDelete={handleCardDelete}
              refreshing={refreshing}
              deleting={deleting}
              isFavorite={isFavorite(printer.ip_address)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel text-center p-xl rounded-xl border-dashed">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-4 block">search_off</span>
          <h3 className="font-headline-md text-lg font-semibold text-on-surface mb-1">No matches found</h3>
          <p className="font-label-mono text-xs text-on-surface-variant uppercase">Adjust filters or run network scan</p>
        </div>
      )}

      <AddPrinterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddPrinterByIp} onDelete={handleDeletePrinterByIp} />
      <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} printers={printers} />
    </div>
  );
};

export default Printers;
