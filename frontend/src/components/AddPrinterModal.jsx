import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2, Printer, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const AddPrinterModal = ({ isOpen, onClose, onAdd, onDelete }) => {
  const [ipText, setIpText] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // 'add' | 'delete'
  const [results, setResults] = useState([]); // per-IP results
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parseIps = () => {
    return ipText
      .split(/[\n,;\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const handleAdd = async () => {
    const ips = parseIps();
    if (ips.length === 0) {
      setError('กรุณาระบุ IP Address อย่างน้อย 1 ตัว');
      return;
    }
    setError('');
    setResults([]);
    setLoadingAction('add');
    try {
      const data = await onAdd(ips);
      setResults(data);
      // Only close if all succeeded
      if (data.every(r => r.action !== 'failed')) {
        setTimeout(() => { setIpText(''); setResults([]); onClose(); }, 1200);
      }
    } catch (err) {
      setError(err.message || 'เพิ่มเครื่องไม่สำเร็จ กรุณาตรวจสอบ IP และ SNMP');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    const ips = parseIps();
    if (ips.length === 0) {
      setError('กรุณาระบุ IP Address อย่างน้อย 1 ตัว');
      return;
    }
    if (!window.confirm(`ลบเครื่องพิมพ์ ${ips.length} เครื่อง ออกจากระบบ?`)) return;
    setError('');
    setResults([]);
    setLoadingAction('delete');
    try {
      const deleteResults = [];
      for (const ip of ips) {
        try {
          await onDelete(ip);
          deleteResults.push({ ip, action: 'deleted' });
        } catch {
          deleteResults.push({ ip, action: 'failed', detail: 'ไม่พบเครื่องใน DB' });
        }
      }
      setResults(deleteResults);
      if (deleteResults.every(r => r.action !== 'failed')) {
        setTimeout(() => { setIpText(''); setResults([]); onClose(); }, 1200);
      }
    } catch (err) {
      setError(err.message || 'ลบไม่สำเร็จ');
    } finally {
      setLoadingAction(null);
    }
  };

  const getResultIcon = (action) => {
    if (action === 'created' || action === 'updated' || action === 'deleted') return <CheckCircle2 size={14} style={{ color: '#10B981' }} />;
    if (action === 'failed') return <XCircle size={14} style={{ color: '#EF4444' }} />;
    return <AlertTriangle size={14} style={{ color: '#F59E0B' }} />;
  };

  const getResultLabel = (action) => {
    if (action === 'created') return 'เพิ่มสำเร็จ';
    if (action === 'updated') return 'อัปเดตแล้ว';
    if (action === 'deleted') return 'ลบสำเร็จ';
    if (action === 'failed') return 'ล้มเหลว';
    return action;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '1.5rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <button
          onClick={() => { setResults([]); setError(''); onClose(); }}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={20} style={{ color: 'var(--primary)' }} />
          จัดการเครื่องปริ้นเตอร์
        </h3>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
          พิมพ์ IP Address ทีละบรรทัด หรือคั่นด้วยจุลภาค (,) เพื่อเพิ่มหลายเครื่องพร้อมกัน
        </p>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            IP Address (หลายตัวได้)
          </label>
          <textarea
            value={ipText}
            onChange={(e) => setIpText(e.target.value)}
            placeholder={'192.168.1.50\n192.168.1.51\n192.168.1.55'}
            className="search-input"
            rows={4}
            style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}
            autoFocus
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {parseIps().length > 0 && `พบ ${parseIps().length} IP Address`}
          </div>
        </div>

        {error && (
          <div style={{ fontSize: '0.8rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {/* Results per IP */}
        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                {getResultIcon(r.action)}
                <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{r.ip}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{getResultLabel(r.action)}</span>
                {r.detail && <span style={{ color: '#F87171', fontSize: '0.72rem' }}> — {r.detail}</span>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={handleAdd}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'add' ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
            เพิ่มเครื่อง
          </button>
          <button
            className="btn"
            style={{ flex: 1, background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={handleDelete}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'delete' ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
            ลบเครื่อง
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPrinterModal;
