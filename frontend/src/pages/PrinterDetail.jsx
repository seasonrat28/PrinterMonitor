import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getPrinterById, refreshPrinter } from '../services/api';

const PrinterDetail = () => {
  const { id } = useParams();
  const [printer, setPrinter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPrinter = async () => {
    try {
      setLoading(true);
      const data = await getPrinterById(id);
      setPrinter(data);
    } catch (error) {
      console.error('Failed to load printer detail', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinter();
  }, [id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshPrinter(id);
      await loadPrinter();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading printer details...</div>;
  }

  if (!printer) {
    return <div className="page-loading">Printer not found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/printers" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to printers
        </Link>
        <button className="btn btn-primary" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-main)' }}>{printer.hostname || printer.model || 'Unknown Printer'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', color: 'var(--text-muted)' }}>
          <div><strong>IP:</strong> {printer.ip_address}</div>
          <div><strong>Brand:</strong> {printer.brand || '-'}</div>
          <div><strong>Model:</strong> {printer.model || '-'}</div>
          <div><strong>Serial:</strong> {printer.serial_number || '-'}</div>
          <div><strong>Status:</strong> {printer.status || '-'}</div>
          <div><strong>Printer Status:</strong> {printer.printer_status || '-'}</div>
          <div><strong>Location:</strong> {printer.location || '-'}</div>
          <div><strong>Page Count:</strong> {printer.page_count ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default PrinterDetail;
