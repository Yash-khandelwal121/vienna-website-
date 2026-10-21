import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowRight, ChevronRight } from 'lucide-react';
import { legalData } from '../data/pages';

export default function Legal({ type = 'privacy' }) {
  if (type === 'imprint') {
    const imp = legalData.imprint;
    return (
      <div style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '5rem', backgroundColor: 'var(--bg-main)' }}>
        <div className="container-narrow">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--accent)' }}>Imprint (Impressum)</span>
          </div>

          <div className="eyebrow">LEGAL DISCLOSURE</div>
          <h1 className="heading-xl" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            {imp.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '3rem' }}>
            {imp.lead}
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2rem, 4vw, 3rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: '1.8'
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Diensteanbieter & Medieninhaber:</strong>
              <div>{imp.operator}</div>
              <div>UID-Nummer: {imp.vatId}</div>
              <div>{imp.address}</div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Kontakt:</strong>
              <div>Tel.: {imp.phone}</div>
              <div>E-Mail: {imp.email}</div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Gewerbe & Registrierung:</strong>
              <div>Unternehmensgegenstand: {imp.businessPurpose}</div>
              <div>GLN (Global Location Number): {imp.gln}</div>
              <div>GISA-Zahl (Gewerbeinformationssystem Austria): {imp.gisa}</div>
              <div>Mitglied bei: {imp.chamber}</div>
              <div>Berufsrecht: {imp.regulations}</div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Aufsichtsbehörde:</strong>
              <div>{imp.supervisoryAuthority}</div>
              <div>Berufsbezeichnung: {imp.profession}</div>
              <div>Verleihungsstaat: {imp.awardingState}</div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Datenschutzverantwortlicher:</strong>
              <div>{imp.dpo}</div>
              <div>Vertretungsberechtigter: {imp.operator}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCancellation = type === 'cancellation';
  const data = isCancellation ? legalData.cancellation : legalData.privacy;

  return (
    <div style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '5rem', backgroundColor: 'var(--bg-main)' }}>
      <div className="container-narrow">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--accent)' }}>{data.title}</span>
        </div>

        <div className="eyebrow">{isCancellation ? 'TERMS & POLICIES' : 'DATA PROTECTION & GDPR'}</div>
        <h1 className="heading-xl" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {data.title}
        </h1>
        <div style={{ color: 'var(--accent)', fontSize: '0.88rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', marginBottom: '3rem' }}>
          {isCancellation ? `EFFECTIVE DATE: ${data.effectiveDate}` : `LAST UPDATED: ${data.lastUpdated}`}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(2rem, 5vw, 3.5rem)'
          }}
        >
          {data.sections.map((sec, i) => (
            <div key={i}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '0.04em',
                  marginBottom: '0.85rem'
                }}
              >
                {sec.heading}
              </h2>
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.96rem',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-line'
                }}
              >
                {sec.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
