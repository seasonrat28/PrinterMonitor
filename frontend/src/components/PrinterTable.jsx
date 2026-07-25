import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronUp, ChevronDown, RefreshCw, Trash2 } from 'lucide-react';

// Status → dot color + label, matching the semantics BRAdmin4 uses
// (green = ready, red = offline/error, amber = needs attention)
const STATUS_STYLE = {
  Offline: { color: '#EF4444', label: 'Offline' },
  Error: { color: '#EF4444', label: 'Error' },
  'Paper Jam': { color: '#EF4444', label: 'Paper Jam' },
  'Replace Toner': { color: '#F59E0B', label: 'Replace Toner' },
  'Replace Drum': { color: '#F59E0B', label: 'Replace Drum' },
  'Toner Low': { color: '#F59E0B', label: 'Toner Low' },
  'Cover Open': { color: '#F59E0B', label: 'Cover Open' },
  Sleep: { color: '#64748B', label: 'Sleep' },
  'Deep Sleep': { color: '#64748B', label: 'Deep Sleep' },
  'Warming Up': { color: '#3B82F6', label: 'Warming Up' },
  Printing: { color: '#3B82F6', label: 'Printing' },
  Busy: { color: '#3B82F6', label: 'Busy' },
  Ready: { color: '#10B981', label: 'Ready' },
  Online: { color: '#10B981', label: 'Online' },
};

const statusStyleFor = (printer) => {
  if (!printer.online) return STATUS_STYLE.Offline;
  return STATUS_STYLE[printer.printer_status] || STATUS_STYLE.Ready;
};

// Compact supply cell: small percentage bar + number, like BRAdmin4's toner columns
const SupplyCell = ({ pct, colorHex }) => {
  if (pct === null || pct === undefined) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>;
  }
  const isLow = pct < 20;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '64px' }}>
      <div style={{ width: '36px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: isLow ? '#EF4444' : colorHex, borderRadius: '3px' }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isLow ? '#F87171' : 'var(--text-main)' }}>{pct}%</span>
    </div>
  );
};

const SortableHeader = ({ label, field, sortBy, onSort, width }) => {
  const isAsc = sortBy === `${field}_asc`;
  const isDesc = sortBy === `${field}_desc`;
  const isActive = isAsc || isDesc;
  return (
    <th
      onClick={() => onSort(isAsc ? `${field}_desc` : `${field}_asc`)}
      style={{
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
        width,
      }}
      title="คลิกเพื่อเรียงลำดับ"
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        {label}
        {isAsc && <ChevronUp size={12} />}
        {isDesc && <ChevronDown size={12} />}
      </span>
    </th>
  );
};

const PrinterTable = ({
  printers,
  sortBy,
  onSort,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  onDelete,
  refreshing,
  deleting,
}) => {
  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="badmin-table">
          <thead>
            <tr>
              <th style={{ width: '28px' }}></th>
              <th style={{ width: '28px' }}></th>
              <SortableHeader label="สถานะ" field="status" sortBy={sortBy} onSort={onSort} width="110px" />
              <SortableHeader label="IP Address" field="ip" sortBy={sortBy} onSort={onSort} width="120px" />
              <SortableHeader label="Node Name" field="hostname" sortBy={sortBy} onSort={onSort} />
              <SortableHeader label="Model" field="model" sortBy={sortBy} onSort={onSort} />
              <SortableHeader label="วงเครือข่าย" field="network" sortBy={sortBy} onSort={onSort} width="100px" />
              <SortableHeader label="Location" field="location" sortBy={sortBy} onSort={onSort} />
              <th>Black</th>
              <th>Cyan</th>
              <th>Magenta</th>
              <th>Yellow</th>
              <SortableHeader label="Drum" field="drum" sortBy={sortBy} onSort={onSort} width="90px" />
              <SortableHeader label="Page Count" field="page" sortBy={sortBy} onSort={onSort} width="100px" />
              <th style={{ width: '90px' }}></th>
            </tr>
          </thead>
          <tbody>
            {printers.map((p) => {
              const st = statusStyleFor(p);
              const isMonochrome = p.is_color === false || (p.toner_cyan == null && p.toner_magenta == null && p.toner_yellow == null);
              return (
                <tr key={p.id}>
                  <td>
                    <button
                      onClick={() => onToggleFavorite(p.ip_address)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
                      title="รายการโปรด"
                    >
                      <Star size={14} fill={isFavorite(p.ip_address) ? '#FBBF24' : 'none'} color={isFavorite(p.ip_address) ? '#FBBF24' : 'var(--text-muted)'} />
                    </button>
                  </td>
                  <td>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
                  </td>
                  <td style={{ color: st.color, fontWeight: 600, fontSize: '0.8rem' }}>{st.label}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    <Link to={`/printers/${p.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {p.ip_address}
                    </Link>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{p.hostname || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ fontSize: '0.82rem' }}>{p.model || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ fontSize: '0.82rem' }}>{p.network || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ fontSize: '0.82rem' }}>{p.location && p.location !== 'Unknown' ? p.location : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td><SupplyCell pct={p.toner_black} colorHex="#94A3B8" /></td>
                  <td>{isMonochrome ? <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span> : <SupplyCell pct={p.toner_cyan} colorHex="#06B6D4" />}</td>
                  <td>{isMonochrome ? <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span> : <SupplyCell pct={p.toner_magenta} colorHex="#EC4899" />}</td>
                  <td>{isMonochrome ? <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span> : <SupplyCell pct={p.toner_yellow} colorHex="#EAB308" />}</td>
                  <td><SupplyCell pct={p.drum_unit} colorHex="#10B981" /></td>
                  <td style={{ fontSize: '0.82rem', textAlign: 'right' }}>{(p.page_count ?? 0).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => onRefresh(p.id)}
                        disabled={refreshing === p.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                        title="Refresh"
                      >
                        <RefreshCw size={13} className={refreshing === p.id ? 'spin' : ''} />
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        disabled={deleting === p.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrinterTable;
