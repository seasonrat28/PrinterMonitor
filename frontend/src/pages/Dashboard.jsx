import React, { useEffect, useState } from 'react';
import { AlertTriangle, Printer, RefreshCw, TrendingUp, AlertCircle, Droplets } from 'lucide-react';
import { deletePrinter, getDashboardSummary, getPrinters, refreshPrinter } from '../services/api';
import NotificationModal from '../components/NotificationModal';
import PrinterCard from '../components/PrinterCard';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);

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
  }, []);

  const handleRefresh = async (id) => {
    try {
      setRefreshingId(id);
      await refreshPrinter(id);
      await loadData();
    } catch (error) {
      console.error('Failed to refresh printer', error);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ลบเครื่องพิมพ์นี้ออกจากระบบ?')) return;
    try {
      await deletePrinter(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete printer', error);
    }
  };

  const lowToner = summary?.low_toner_printers || [];
  const issues = summary?.error_printers || [];

  if (loading) {
    return <div className="page-loading">กำลังโหลดแดชบอร์ด...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Dashboard</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>ภาพรวมเครื่องพิมพ์และสถานะล่าสุดจากเครือข่าย</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowAlerts(true)}>
            <AlertTriangle size={16} /> แจ้งเตือน
          </button>
          <button className="btn" onClick={loadData}>
            <RefreshCw size={16} /> รีเฟรช
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-title">รวมทั้งหมด</div>
          <div className="stat-value">{summary?.total ?? 0}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-title">Online</div>
          <div className="stat-value">{summary?.online ?? 0}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-title">Offline</div>
          <div className="stat-value">{summary?.offline ?? 0}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-title">Low Toner</div>
          <div className="stat-value">{summary?.low_toner ?? 0}</div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="glass-card summary-panel">
          <div className="section-title">
            <AlertCircle size={16} /> สถานะที่ต้องดูแล
          </div>
          {issues.length === 0 ? (
            <div className="empty-state">ไม่มีปัญหาในตอนนี้</div>
          ) : (
            issues.slice(0, 5).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.ip_address}</strong>
                  <div className="muted">{item.last_error || 'มีสถานะผิดปกติ'}</div>
                </div>
                <span className="chip warning">{item.paper_jam_count || 0} jam</span>
              </div>
            ))
          )}
        </div>

        <div className="glass-card summary-panel">
          <div className="section-title">
            <Droplets size={16} /> หมึกต่ำ
          </div>
          {lowToner.length === 0 ? (
            <div className="empty-state">ยังไม่มีเครื่องที่หมึกต่ำ</div>
          ) : (
            lowToner.slice(0, 5).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.ip_address}</strong>
                  <div className="muted">{item.model || 'Unknown'}</div>
                </div>
                <span className="chip">K {item.toner_black ?? '-' }%</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>เครื่องพิมพ์ที่ตรวจพบ</h3>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <TrendingUp size={16} style={{ marginRight: '0.35rem' }} />
            อัปเดตล่าสุดจาก SNMP/Network
          </div>
        </div>

        <div className="printers-grid">
          {printers.length === 0 ? (
            <div className="empty-state">ยังไม่มีเครื่องพิมพ์ในระบบ กรุณาเริ่มสแกนเครือข่าย</div>
          ) : (
            printers.map((printer) => (
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
      </div>

      <NotificationModal isOpen={showAlerts} onClose={() => setShowAlerts(false)} printers={printers} />
    </div>
  );
};

export default Dashboard;
