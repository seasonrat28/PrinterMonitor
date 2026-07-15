import React, { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Trash2 } from 'lucide-react';
import AddPrinterModal from '../components/AddPrinterModal';
import PrinterCard from '../components/PrinterCard';
import { addPrinterByIp, deletePrinterByIp, getPrinters, refreshPrinter, scanAndSavePrinters, deletePrinter } from '../services/api';

const Printers = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [scanning, setScanning] = useState(false);

  const loadPrinters = async () => {
    try {
      setLoading(true);
      const data = await getPrinters();
      setPrinters(data || []);
    } catch (err) {
      console.error('Failed to load printers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  const handleRefresh = async (id) => {
    try {
      setRefreshingId(id);
      await refreshPrinter(id);
      await loadPrinters();
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ลบเครื่องพิมพ์นี้ออกจากระบบ?')) return;
    try {
      await deletePrinter(id);
      await loadPrinters();
    } catch (error) {
      console.error('Failed to delete printer', error);
    }
  };

  const handleAddByIp = async (ips) => {
    return addPrinterByIp(ips);
  };

  const handleDeleteByIp = async (ip) => {
    return deletePrinterByIp(ip);
  };

  const handleScan = async () => {
    const network = window.prompt('กรอก Network Prefix เช่น 10.119.35', '10.119.35');
    if (!network) return;
    try {
      setScanning(true);
      await scanAndSavePrinters(network, 1, 254);
      await loadPrinters();
    } catch (err) {
      console.error('Scan failed', err);
      window.alert(err.message || 'สแกนไม่สำเร็จ');
    } finally {
      setScanning(false);
    }
  };

  const filtered = printers.filter((printer) => {
    const q = search.toLowerCase();
    return !q || [printer.hostname, printer.model, printer.ip_address, printer.location].filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>All Printers</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>จัดการเครื่องพิมพ์และเริ่มสแกนเครือข่าย</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleScan} disabled={scanning}>
            {scanning ? <RefreshCw size={16} className="spin" /> : <Search size={16} />} สแกนเครือข่าย
          </button>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> เพิ่ม/ลบ เครื่อง
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0.9rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา IP / Model / Location"
          />
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading printers...</div>
      ) : (
        <div className="printers-grid">
          {filtered.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>ไม่พบเครื่องพิมพ์ที่ตรงกับคำค้น</div>
          ) : (
            filtered.map((printer) => (
              <PrinterCard
                key={printer.id}
                printer={printer}
                handleRefresh={handleRefresh}
                handleDelete={handleDelete}
                refreshing={refreshingId === printer.id}
                deleting={false}
                isFavorite={false}
                onToggleFavorite={() => {}}
              />
            ))
          )}
        </div>
      )}

      <AddPrinterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddByIp}
        onDelete={handleDeleteByIp}
      />
    </div>
  );
};

export default Printers;
