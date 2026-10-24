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

      <style>{`
        .vdt-kpi-card {
          background: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 12px;
          padding: 1.25rem 1.4rem;
          box-shadow: 0 4px 15px rgba(23, 25, 28, 0.03);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .vdt-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(198, 156, 80, 0.12);
          border-color: #C69C50;
        }

        .vdt-kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vdt-kpi-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #707070;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .vdt-kpi-icon-frame {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vdt-kpi-value {
          font-size: 1.85rem;
          font-weight: 700;
          color: #17191C;
          line-height: 1.2;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .vdt-kpi-subtitle {
          font-size: 0.78rem;
          color: #948E84;
        }
      `}</style>
    </div>
  );
}
