import React, { useEffect, useState } from 'react';
import { getPrinters, refreshPrinter, scanAndSavePrinters, addPrinterByIp, deletePrinterByIp, deletePrinter } from '../services/api';
import { Search, RefreshCw, AlertCircle, Download, Radar, Bell, Plus, Star, Filter, SortDesc, Clock, Pause, Play } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

import PrinterCard from '../components/PrinterCard';
import PrinterTable from '../components/PrinterTable';
import AddPrinterModal from '../components/AddPrinterModal';
import NotificationModal from '../components/NotificationModal';

const Printers = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(null);
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const [network, setNetwork] = useState(localStorage.getItem('printerNetwork') || '10.119.34,10.119.35,10.119.43');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // New Features State
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'favorites'
  const [supplyFilter, setSupplyFilter] = useState('all'); // 'all', 'low_toner', 'low_drum'
  const [sortBy, setSortBy] = useState('ip_asc'); // 'ip_asc', 'ip_desc', 'toner_asc', 'drum_asc'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [viewMode, setViewMode] = useState(localStorage.getItem('printerViewMode') || 'table'); // 'table' | 'cards'

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
            return 60;
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
      setCountdown(30); // Reset countdown on manual refresh
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
    if (!window.confirm(`ลบเครื่องพิมพ์ ${ip} ออกจากระบบ?`)) return;
    setDeleting(id);
    try {
      await deletePrinter(id);
      await fetchPrinters();
    } catch (error) {
      console.error('Failed to delete printer:', error);
      alert('ลบไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setDeleting(null);
    }
  };

  const handleRefreshOne = async (id) => {
    setRefreshing(id);
    try {
      await refreshPrinter(id);
      await fetchPrinters();
    } finally {
      setRefreshing(null);
    }
  };

  const handleScan = async () => {
    // รองรับหลายวงคั่นด้วย , เช่น "10.119.34,10.119.35,10.119.43"
    const prefixes = network.split(',').map(n => n.trim()).filter(Boolean);
    const isValid = prefixes.length > 0 && prefixes.every(p => /^\d{1,3}(?:\.\d{1,3}){2}$/.test(p));
    if (!isValid) {
      setScanMessage('กรุณาระบุเครือข่าย เช่น 10.119.35 หรือหลายวงคั่นด้วย , เช่น 10.119.34,10.119.35');
      return;
    }
    const joined = prefixes.join(',');
    setScanning(true);
    setScanMessage(`กำลังค้นหาเครื่องพิมพ์ใน ${prefixes.length} เครือข่าย…`);
    try {
      const found = await scanAndSavePrinters(joined);
      localStorage.setItem('printerNetwork', joined);
      await fetchPrinters();
      setScanMessage(`ค้นหาเสร็จแล้ว: พบเครื่องพิมพ์ ${found.length} เครื่อง จาก ${prefixes.length} วง`);
    } catch (error) {
      setScanMessage(error.response?.data?.detail || 'ค้นหาไม่สำเร็จ กรุณาตรวจสอบเครือข่ายและ SNMP');
    } finally {
      setScanning(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Status', 'Network', 'IP Address', 'Hostname', 'Model', 'Serial Number', 'Black (%)', 'Cyan (%)', 'Magenta (%)', 'Yellow (%)', 'Page Count', 'Last Seen'];
    const rows = filteredPrinters.map(p => [
      p.id,
      p.online ? 'Online' : 'Offline',
      p.network || '',
      p.ip_address,
      p.hostname || '',
      p.model || '',
      p.serial_number || '',
      p.toner_black || 0,
      p.toner_cyan || 0,
      p.toner_magenta || 0,
      p.toner_yellow || 0,
      p.page_count || 0,
      p.last_seen || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `printers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPrinters = printers.filter(p => {
    // Tab Filter
    if (activeTab === 'favorites' && !isFavorite(p.ip_address)) return false;

    // Network Filter
    if (networkFilter !== 'all' && p.network !== networkFilter) return false;

    // Supply Filter
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
    } else if (supplyFilter.startsWith('drum_')) {
      const threshold = parseInt(supplyFilter.split('_')[1]);
      if (p.drum_unit === null || p.drum_unit > threshold) return false;
    }
    
    // Text Search
    if (search) {
      const s = search.toLowerCase();
      const matches = (
        p.ip_address?.toLowerCase().includes(s) || 
        p.model?.toLowerCase().includes(s) ||
        p.hostname?.toLowerCase().includes(s) ||
        p.location?.toLowerCase().includes(s) ||
        p.department?.toLowerCase().includes(s) ||
        p.network?.toLowerCase().includes(s) ||
        p.serial_number?.toLowerCase().includes(s) ||
        p.printer_status?.toLowerCase().includes(s)
      );
      if (!matches) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'ip_asc') return a.ip_address.localeCompare(b.ip_address, undefined, {numeric: true});
    if (sortBy === 'ip_desc') return b.ip_address.localeCompare(a.ip_address, undefined, {numeric: true});
    if (sortBy === 'toner_asc') return (a.toner_black ?? 100) - (b.toner_black ?? 100);
    if (sortBy === 'toner_desc') return (b.toner_black ?? 100) - (a.toner_black ?? 100);
    if (sortBy === 'drum_asc') return (a.drum_unit ?? 100) - (b.drum_unit ?? 100);
    if (sortBy === 'drum_desc') return (b.drum_unit ?? 100) - (a.drum_unit ?? 100);
    if (sortBy === 'hostname_asc') return (a.hostname || '').localeCompare(b.hostname || '');
    if (sortBy === 'hostname_desc') return (b.hostname || '').localeCompare(a.hostname || '');
    if (sortBy === 'model_asc') return (a.model || '').localeCompare(b.model || '');
    if (sortBy === 'model_desc') return (b.model || '').localeCompare(a.model || '');
    if (sortBy === 'network_asc') return (a.network || '').localeCompare(b.network || '');
    if (sortBy === 'network_desc') return (b.network || '').localeCompare(a.network || '');
    if (sortBy === 'location_asc') return (a.location || '').localeCompare(b.location || '');
    if (sortBy === 'location_desc') return (b.location || '').localeCompare(a.location || '');
    if (sortBy === 'page_asc') return (a.page_count ?? 0) - (b.page_count ?? 0);
    if (sortBy === 'page_desc') return (b.page_count ?? 0) - (a.page_count ?? 0);
    if (sortBy === 'status_asc') return (a.online === b.online) ? 0 : (a.online ? 1 : -1);
    if (sortBy === 'status_desc') return (a.online === b.online) ? 0 : (a.online ? -1 : 1);
    return 0;
  });

  const alertCount = printers.filter(p => {
    const isMonochrome = p.is_color === false || (p.is_color === undefined && !p.toner_cyan && !p.toner_magenta && !p.toner_yellow);
    const isWarning = (p.toner_black !== null && p.toner_black < 20) || (!isMonochrome && (p.toner_cyan < 20 || p.toner_magenta < 20 || p.toner_yellow < 20));
    // Exclude offline from alerts as requested
    return isWarning || (p.printer_status && p.printer_status !== 'Ready' && p.printer_status !== 'Online');
  }).length;

  return (
    <div style={{ display: 'flex', position: 'relative', minHeight: 'calc(100vh - 100px)' }}>
      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div className="page-header animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">All Printers</h1>
              <p className="page-subtitle">Detailed view and management of discovered printers.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'nowrap' }}>
              <input
                type="text"
                className="search-input"
                placeholder="เช่น 10.119.34,10.119.35,10.119.43"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                disabled={scanning}
                title="ระบุได้หลายวง คั่นด้วยเครื่องหมายจุลภาค (,)"
                style={{ width: '260px' }}
              />
              <button className="btn btn-primary" onClick={handleScan} disabled={scanning} style={{ whiteSpace: 'nowrap' }}>
                <Radar size={18} className={scanning ? 'spin' : ''} />
                {scanning ? 'กำลังค้นหา…' : 'ค้นหาเครือข่าย'}
              </button>
            </div>
          </div>

          {/* New Control Bar: Tabs + Filters + Search + Actions */}
          <div className="floating-glass-bar animate-fade-in-up" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', animationDelay: '0.2s',
            position: 'sticky', top: '10px', zIndex: 10
          }}>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setActiveTab('all')}
                style={{ padding: '0.4rem 1rem' }}
              >
                ทั้งหมด ({printers.length})
              </button>
              <button 
                className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => setActiveTab('favorites')}
                style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Star size={16} /> รายการโปรด ({favorites.length})
              </button>

              <div style={{ width: '1px', background: 'var(--card-border)', margin: '0 0.25rem' }} />

              <button
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setViewMode('table'); localStorage.setItem('printerViewMode', 'table'); }}
                style={{ padding: '0.4rem 1rem' }}
                title="มุมมองตาราง (แบบ BRAdmin4)"
              >
                ตาราง
              </button>
              <button
                className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setViewMode('cards'); localStorage.setItem('printerViewMode', 'cards'); }}
                style={{ padding: '0.4rem 1rem' }}
                title="มุมมองการ์ด"
              >
                การ์ด
              </button>
            </div>

            {/* Filters & Sorting */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <select 
                  className="search-input" 
                  value={supplyFilter} 
                  onChange={(e) => setSupplyFilter(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', width: 'auto', background: 'var(--bg-card)' }}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="toner_10">Toner ≤ 10%</option>
                  <option value="toner_20">Toner ≤ 20%</option>
                  <option value="toner_30">Toner ≤ 30%</option>
                  <option value="drum_10">Drum ≤ 10%</option>
                  <option value="drum_20">Drum ≤ 20%</option>
                  <option value="drum_30">Drum ≤ 30%</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <select
                  className="search-input"
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', width: 'auto', background: 'var(--bg-card)' }}
                >
                  <option value="all">ทุกวงเครือข่าย</option>
                  {[...new Set(printers.map(p => p.network).filter(Boolean))]
                    .sort()
                    .map(net => (
                      <option key={net} value={net}>{net} ({printers.filter(p => p.network === net).length})</option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SortDesc size={16} style={{ color: 'var(--text-muted)' }} />
                <select 
                  className="search-input" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', width: 'auto', background: 'var(--bg-card)' }}
                >
                  <option value="ip_asc">IP (น้อย ➔ มาก)</option>
                  <option value="ip_desc">IP (มาก ➔ น้อย)</option>
                  <option value="toner_asc">Toner (น้อย ➔ มาก)</option>
                  <option value="toner_desc">Toner (มาก ➔ น้อย)</option>
                  <option value="drum_asc">Drum (น้อย ➔ มาก)</option>
                  <option value="drum_desc">Drum (มาก ➔ น้อย)</option>
                </select>
              </div>

              <div className="search-wrapper" style={{ marginBottom: 0 }}>
                <Search className="search-icon" size={16} style={{ top: '50%' }} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="ค้นหา IP, ชื่อ, สถานที่..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ minWidth: '220px', padding: '0.4rem 1rem 0.4rem 2rem' }}
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setIsNotificationModalOpen(true)}
                title="การแจ้งเตือน (Alerts)"
              >
                <Bell size={16} />
                {alertCount > 0 && <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{alertCount}</span>}
              </button>

              <button 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={handleGlobalRefresh}
                disabled={globalRefreshing}
                title="Refresh All"
              >
                <RefreshCw size={16} className={globalRefreshing ? 'spin' : ''} />
              </button>

              <button 
                className="btn btn-secondary"
                style={{ 
                  padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px',
                  color: autoRefresh ? '#10B981' : 'var(--text-muted)'
                }}
                onClick={() => {
                  setAutoRefresh(!autoRefresh);
                  if (!autoRefresh) setCountdown(30);
                }}
                title={autoRefresh ? "ปิดอัปเดตอัตโนมัติ" : "เปิดอัปเดตอัตโนมัติ (ทุก 30 วิ)"}
              >
                {autoRefresh ? <Clock size={16} /> : <Pause size={16} />}
                {autoRefresh && <span style={{ fontSize: '0.75rem' }}>{countdown}s</span>}
              </button>

              <button 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setIsModalOpen(true)}
                title="Add or Remove Printer by IP"
              >
                <Plus size={16} /> Add IP
              </button>
              
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={exportCSV}
                title="Export to CSV"
              >
                <Download size={16} /> Export
              </button>
            </div>
          </div>
        </div>

        {scanMessage && <p className="scan-message" style={{ marginBottom: '1rem' }}>{scanMessage}</p>}

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading printers...</div>
        ) : filteredPrinters.length > 0 ? (
          viewMode === 'table' ? (
            <PrinterTable
              printers={filteredPrinters}
              sortBy={sortBy}
              onSort={setSortBy}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onRefresh={handleRefreshOne}
              onDelete={(p) => handleCardDelete(p.id, p.ip_address)}
              refreshing={refreshing}
              deleting={deleting}
            />
          ) : (
          <div className="printers-grid">
            {filteredPrinters.map((printer, index) => {
              const delay = 0.3 + (index * 0.05); // Staggered animation
              return (
                <div key={printer.id} className="animate-fade-in-up" style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}>
                  <PrinterCard 
                    printer={printer}
                    handleRefresh={() => handleRefreshOne(printer.id)}
                    handleDelete={handleCardDelete}
                    refreshing={refreshing}
                    deleting={deleting}
                    isFavorite={isFavorite(printer.ip_address)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              );
            })}
          </div>
          )
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', maxWidth: '450px', margin: '4rem auto' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1.5rem', display: 'block', opacity: 0.5, color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No printers found</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>ลองเปลี่ยนคำค้นหา หรือใช้ตัวกรองอื่นดูครับ</p>
          </div>
        )}
      </div>

      <AddPrinterModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPrinterByIp}
        onDelete={handleDeletePrinterByIp}
      />
      
      <NotificationModal 
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        printers={printers}
      />
    </div>
  );
};

export default Printers;
