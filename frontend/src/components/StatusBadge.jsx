import React from 'react';

const StatusBadge = ({ label, value }) => {
  // Determine color based on rules:
  // <= 20: Red
  // 21 - 50: Yellow
  // > 50: Green
  
  let color = '#10B981'; // Green
  let bgColor = 'rgba(16, 185, 129, 0.15)';
  
  if (value == null || isNaN(value)) {
    color = '#64748B'; // Gray
    bgColor = 'rgba(100, 116, 139, 0.15)';
    value = 'N/A';
  } else if (value <= 20) {
    color = '#EF4444'; // Red
    bgColor = 'rgba(239, 68, 68, 0.15)';
  } else if (value <= 50) {
    color = '#F59E0B'; // Yellow
    bgColor = 'rgba(245, 158, 11, 0.15)';
  }

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        backgroundColor: bgColor,
        border: `1px solid ${color}40`,
        minWidth: '70px',
        justifyContent: 'center'
      }}
      title={`${label}: ${value}${typeof value === 'number' ? '%' : ''}`}
    >
      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: color }}>
        {value}{typeof value === 'number' ? '%' : ''}
      </span>
    </div>
  );
};

export default StatusBadge;
