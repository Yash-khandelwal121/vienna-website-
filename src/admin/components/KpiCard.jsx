import React from 'react';

export default function KpiCard({ title, value, subtitle, icon: Icon, color = '#C69C50' }) {
  return (
    <div className="vdt-kpi-card">
      <div className="vdt-kpi-header">
        <span className="vdt-kpi-title">{title}</span>
        {Icon && (
          <div className="vdt-kpi-icon-frame" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="vdt-kpi-value">{value}</div>
      {subtitle && <div className="vdt-kpi-subtitle">{subtitle}</div>}
    </div>
  );
}
