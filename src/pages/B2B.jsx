import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building, ShieldCheck, ArrowRight, CheckCircle2, MessageSquare, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { b2bData } from '../data/pages';
import { siteConfig } from '../data/site';
import FaqAccordion from '../components/FaqAccordion';

export default function B2B() {
  const [partnerType, setPartnerType] = useState('Hotel Concierge');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    const text = `Hello Vienna Day Trip B2B Desk!
New Partnership Inquiry:
• Category: ${partnerType}
• Contact Name: ${name}
• Company / Organization: ${company}
• Email: ${email}
• Phone: ${phone}
• Message: ${message}`;

    const encoded = encodeURIComponent(text);
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send/?phone=436642035445&text=${encoded}`, '_blank');
      setSent(false);
    }, 800);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Corporate Hero */}
      <section
        style={{
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '4rem',
          backgroundColor: 'var(--bg-main)'
        }}
      >
        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow">{b2bData.eyebrow}</div>
          <h1 className="heading-xl" style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            {b2bData.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '740px', lineHeight: '1.65', marginBottom: '2.5rem' }}>
            {b2bData.lead}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            {b2bData.stats.map((st) => (
              <div key={st.label} style={{ padding: '1rem 1.75rem', backgroundColor: '#FFFFFF', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-gold)' }}>
                  {st.value}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="section section-dark">
        <div className="container-wide">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>PARTNERSHIP ADVANTAGES</div>
            <h2 className="heading-lg">WHY LEADING ORGANIZATIONS CHOOSE US.</h2>
          </div>

          <div className="grid-3" style={{ marginBottom: '5rem' }}>
            {b2bData.reasons.map((r) => (
              <div key={r.title} className="card-strada">
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.75rem' }}>
                  {r.title}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.65' }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>

          {/* B2B Services & Benefits Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', marginBottom: '5rem', alignItems: 'flex-start' }}>
            {/* Services for Partners */}
            <div className="card-strada">
              <div className="eyebrow">DEDICATED SERVICES</div>
              <h3 className="heading-md" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                SERVICES FOR CORPORATE PARTNERS
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {b2bData.partnerServices.map((srv) => (
                  <Link
                    key={srv.name}
                    to={srv.link}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.25rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-border)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <span>{srv.name}</span>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Exclusive Partner Benefits */}
            <div className="card-strada">
              <div className="eyebrow">PROGRAM PERKS</div>
              <h3 className="heading-md" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                EXCLUSIVE B2B BENEFITS
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {b2bData.benefits.map((b, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                  DIRECT PARTNERSHIP INQUIRIES
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                  Contact our corporate relations team directly via email or telephone.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <a href={`mailto:${siteConfig.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                    {siteConfig.email}
                  </a>
                  <a href={`tel:${siteConfig.phone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                    {siteConfig.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Request Form */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2rem, 5vw, 4rem)',
              marginBottom: '5rem'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>BECOME A PARTNER</div>
              <h2 className="heading-lg">REQUEST B2B PARTNERSHIP TERMS.</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Looking for a dependable luxury transport partner for your guests or diplomatic delegations in Vienna? Fill in your details below.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="label-strada">Partner Type</label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="input-strada"
                  >
                    <option value="Hotel Concierge / Front Office">5-Star Hotel Concierge</option>
                    <option value="Travel Agency / Tour Operator">Travel Agency / Tour Operator</option>
                    <option value="Embassy / Diplomatic Mission">Embassy / Diplomatic Mission</option>
                    <option value="Corporate Enterprise">Corporate Enterprise</option>
                    <option value="Event / Conference Planner">Event / Conference Planner</option>
                    <option value="River Cruise Operator">River Cruise Operator</option>
                  </select>
                </div>

                <div>
                  <label className="label-strada">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="input-strada"
                  />
                </div>

                <div>
                  <label className="label-strada">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Hotel Imperial, Embassy of..."
                    className="input-strada"
                  />
                </div>

                <div>
                  <label className="label-strada">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input-strada"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label-strada">Direct Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+43 664..."
                  className="input-strada"
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="label-strada">Partnership Requirements / Anticipated Volume</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your guests, destinations, fleet preferences, or billing requirements..."
                  className="input-strada"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.1rem' }}>
                {sent ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>TRANSMITTING INQUIRY...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT PARTNERSHIP APPLICATION</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQs */}
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>B2B FAQ</div>
              <h2 className="heading-lg">FREQUENT PARTNER INQUIRIES.</h2>
            </div>
            <FaqAccordion faqs={b2bData.faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}
