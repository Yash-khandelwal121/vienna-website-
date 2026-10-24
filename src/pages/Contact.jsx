import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../data/site';
import { submitContactEnquiry } from '../services/api';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Airport Transfer');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }
    setError('');
    setSubmitted(true);

    let enqRef = '';
    try {
      const res = await submitContactEnquiry({
        name,
        email,
        phone,
        subject: service,
        message
      });
      if (res && res.success && res.reference) {
        enqRef = res.reference;
      }
    } catch (err) {
      // offline fallback
    }

    const refLine = enqRef ? `\n• Reference: ${enqRef}` : '';
    const fullMsg = `Hello Vienna Day Trip!${refLine}
New Contact Inquiry:
• Name: ${name}
• Email: ${email}
• Phone: ${phone || 'Not provided'}
• Interested Service: ${service}
• Message: ${message || 'No additional notes'}`;

    const encoded = encodeURIComponent(fullMsg);
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send/?phone=436642035445&text=${encoded}`, '_blank');
      setSubmitted(false);
    }, 800);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Contact Hero */}
      <section
        style={{
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          paddingTop: '8rem',
          paddingBottom: '3.5rem',
          backgroundColor: 'var(--bg-main)',
          overflow: 'hidden'
        }}
      >
        <div className="container-wide" style={{ position: 'relative', zIndex: 10 }}>
          <div className="eyebrow">24/7 CHAUFFEUR CONCIERGE</div>
          <h1 className="heading-xl" style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            CONNECT WITH OUR TEAM.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '680px', lineHeight: '1.65' }}>
            We are available 24/7 to assist you with airport pickups, bespoke itineraries, diplomatic security, and private day tours across Europe.
          </p>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="section section-dark">
        <div className="container-wide">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 'clamp(2rem, 4vw, 4rem)',
              alignItems: 'flex-start',
              marginBottom: '5rem'
            }}
          >
            {/* Contact Information & Channels */}
            <div>
              <div className="eyebrow">DIRECT CONTACT CHANNELS</div>
              <h2 className="heading-lg" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                ALWAYS AT YOUR DISPOSAL.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.75', marginBottom: '2.5rem' }}>
                Whether you prefer an instant WhatsApp chat, a phone call with our dispatch manager, or sending a detailed itinerary specification, our team confirms reservations immediately.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Channel 1: WhatsApp */}
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-strada"
                  style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>INSTANT MESSAGING (24/7)</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      WhatsApp Priority Dispatch
                    </div>
                  </div>
                </a>

                {/* Channel 2: Telephone */}
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="card-strada"
                  style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DIRECT TELEPHONE</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {siteConfig.phoneDisplay}
                    </div>
                  </div>
                </a>

                {/* Channel 3: Email */}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="card-strada"
                  style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FORMAL INQUIRIES & INVOICING</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {siteConfig.email}
                    </div>
                  </div>
                </a>

                {/* Channel 4: Address */}
                <div className="card-strada" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OFFICE ADDRESS</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {siteConfig.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Working Premium Inquiry Form */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'clamp(2rem, 4vw, 3.5rem)'
              }}
            >
              <div className="eyebrow">RESERVATION INQUIRY FORM</div>
              <h3 className="heading-md" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                SEND US YOUR ITINERARY DETAILS
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem' }}>
                Fill out the form below. We will calculate distance, vehicle assignment, and provide a fixed transparent quote.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {error && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</div>
                )}

                <div>
                  <label className="label-strada">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="input-strada"
                  />
                </div>

                <div>
                  <label className="label-strada">E-mail Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-strada"
                  />
                </div>

                <div>
                  <label className="label-strada">Phone / WhatsApp Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+43 664..."
                    className="input-strada"
                  />
                </div>

                <div>
                  <label className="label-strada">Interested Service</label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="input-strada"
                  >
                    <option value="Airport Transfer">Vienna Airport Transfer</option>
                    <option value="Hourly Chauffeur">Hourly Chauffeur Service</option>
                    <option value="Hallstatt Day Trip">Hallstatt Day Trip</option>
                    <option value="Salzburg Day Trip">Salzburg Day Trip</option>
                    <option value="Budapest Day Trip">Budapest Day Trip</option>
                    <option value="Prague Day Trip">Prague Day Trip</option>
                    <option value="Bratislava Day Trip">Bratislava Day Trip</option>
                    <option value="Wachau Valley Trip">Wachau Valley Trip</option>
                    <option value="Vienna Sightseeing">Vienna Sightseeing</option>
                    <option value="Secure Transportation">Secure Transportation</option>
                    <option value="Custom European Tour">Custom European Tour</option>
                  </select>
                </div>

                <div>
                  <label className="label-strada">Message / Details</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please specify travel dates, number of passengers, flight numbers, or special stops..."
                    className="input-strada"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1.1rem' }}
                  disabled={submitted}
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>CONNECTING TO CONCIERGE...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND INQUIRY VIA WHATSAPP</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Map Block */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="eyebrow">HEADQUARTERS LOCATION</div>
                <h3 className="heading-md" style={{ color: 'var(--text-primary)' }}>LECHNERSTRASSE 2, 1030 VIENNA</h3>
              </div>
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>OPEN IN GOOGLE MAPS</span>
                <MapPin size={14} style={{ color: 'var(--accent)' }} />
              </a>
            </div>

            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                height: '340px',
                border: '1px solid var(--border)',
                position: 'relative'
              }}
            >
              <iframe
                title="Vienna Day Trip Location"
                src="https://maps.google.com/maps?q=Lechnerstra%C3%9Fe%202,%201030%20Wien&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.2)' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
