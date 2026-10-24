import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Star,
  Clock,
  Car,
  Check,
  ArrowRight,
  MessageSquare,
  Phone,
  Calendar,
  Compass,
  Users
} from 'lucide-react';
import { aboutData } from '../data/pages';
import { siteConfig } from '../data/site';
import FaqAccordion from '../components/FaqAccordion';

export default function About() {
  return (
    <div className="about-page-wrapper">
      {/* =========================================================================
          PART 1 — ABOUT US HERO & STORY SECTION (Two-Column Layout)
          - Max Container Width: 1440px
          - Desktop Split: Left 52% / Right 48%, Gap 40px, Padding: 65px 50px
          - Exact Colors: #FAF8F4, #17191C, #C69C50, #707070, #E6D8C3
          - Exact Fonts: Playfair Display (Headings), Lora (Body)
          ========================================================================= */}
      <section className="about-hero-section">
        <div className="about-hero-container">
          {/* LEFT COLUMN (52%) */}
          <div className="about-left-col">
            {/* Small Heading / Eyebrow */}
            <div className="about-eyebrow">
              <span className="about-eyebrow-symbol">✦</span>
              <span>LICENSED CHAUFFEUR COMPANY SINCE 2019</span>
            </div>

            {/* Main Heading: "About" in black, "Vienna Day Trip" in champagne gold (52px desktop) */}
            <h1 className="about-main-heading">
              About <span className="gold-text">Vienna Day Trip</span>
            </h1>

            {/* Description */}
            <p className="about-lead-description">
              Vienna Day Trip is a licensed private chauffeur service based in Vienna, Austria, offering airport transfers, hourly chauffeur hire, and private day trips to Hallstatt, Salzburg, Budapest, Prague, Bratislava, and the Wachau Valley.
            </p>

            <div className="about-divider" />

            {/* Second Heading */}
            <div className="about-story-eyebrow">
              THE VIENNA DAY TRIP STORY
            </div>

            {/* Statement */}
            <h2 className="about-story-statement">
              BUILT ON PRECISION, ELEGANCE & AUTHENTIC HOSPITALITY.
            </h2>

            {/* Story Paragraphs */}
            <div className="about-story-paragraphs">
              {aboutData.story.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Stats Grid Strip */}
            <div className="about-stats-grid">
              {aboutData.stats.map((st) => (
                <div key={st.label} className="about-stat-card">
                  <div className="about-stat-value">{st.value}</div>
                  <div className="about-stat-label">{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN (48%) — Luxury Arch-Shaped Image Frame */}
          <div className="about-right-col">
            <div className="about-arch-frame">
              <img
                src="/images/about-vclass-chauffeur.webp"
                alt="Black Mercedes-Benz V-Class chauffeur service with luxury passenger at Hofburg Palace in Vienna"
                className="about-arch-img"
                loading="eager"
                decoding="async"
              />
              <div className="about-arch-overlay" />
            </div>

            {/* Luxury Accreditation Pill */}
            <div className="about-image-badge">
              <ShieldCheck size={18} className="badge-gold-icon" />
              <div>
                <span className="badge-title">Official Austrian Chauffeur License</span>
                <span className="badge-sub">GISA-Reg: 9110025257769 • WKO Member</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: OUR CORE VALUES
          ========================================================================= */}
      <section className="about-values-section">
        <div className="about-values-container">
          <div className="about-section-header">
            <div className="about-eyebrow" style={{ justifyContent: 'center' }}>
              <span className="about-eyebrow-symbol">✦</span>
              <span>OUR CORE VALUES</span>
            </div>
            <h2 className="about-section-title">THE PRINCIPLES GUIDING EVERY MILE.</h2>
            <p className="about-section-subtitle">
              Every route, every chauffeur assignment, and every private transfer is executed with uncompromising precision.
            </p>
          </div>

          <div className="about-values-grid">
            {aboutData.coreValues.map((val, idx) => (
              <div key={val.title} className="about-value-card">
                <div className="about-value-number">0{idx + 1}</div>
                <h3 className="about-value-title">{val.title}</h3>
                <p className="about-value-text">{val.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: LEGAL COMPLIANCE & DIPLOMATIC PARTNERSHIPS
          ========================================================================= */}
      <section className="about-trust-section">
        <div className="about-trust-container">
          <div className="about-trust-grid">
            {/* Legal Compliance */}
            <div className="about-trust-card">
              <div className="about-eyebrow">
                <span className="about-eyebrow-symbol">✦</span>
                <span>LEGAL COMPLIANCE</span>
              </div>
              <h3 className="about-trust-card-title">{aboutData.licensing.title}</h3>
              <p className="about-trust-card-text">{aboutData.licensing.text}</p>
              <div className="about-compliance-list">
                <div className="compliance-item">
                  <Check size={16} className="gold-check" />
                  <span>Austrian Commercial Passenger Carriage License</span>
                </div>
                <div className="compliance-item">
                  <Check size={16} className="gold-check" />
                  <span>Full Commercial Fleet & Passenger Liability Insurance</span>
                </div>
                <div className="compliance-item">
                  <Check size={16} className="gold-check" />
                  <span>Background-Checked, Multilingual Professional Chauffeurs</span>
                </div>
              </div>
            </div>

            {/* Diplomacy & Partnerships */}
            <div className="about-trust-card">
              <div className="about-eyebrow">
                <span className="about-eyebrow-symbol">✦</span>
                <span>DIPLOMACY & PARTNERS</span>
              </div>
              <h3 className="about-trust-card-title">{aboutData.partnerships.title}</h3>
              <p className="about-trust-card-text">{aboutData.partnerships.text}</p>
              <div className="about-partners-strip">
                <div className="partner-tag">Foreign Embassies</div>
                <div className="partner-tag">5-Star Luxury Hotels</div>
                <div className="partner-tag">Danube River Cruise Lines</div>
                <div className="partner-tag">Private Aviation Terminals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section className="about-faq-section">
        <div className="about-faq-container">
          <div className="about-section-header">
            <div className="about-eyebrow" style={{ justifyContent: 'center' }}>
              <span className="about-eyebrow-symbol">✦</span>
              <span>ABOUT US FAQ</span>
            </div>
            <h2 className="about-section-title">COMMON QUESTIONS ABOUT OUR COMPANY.</h2>
          </div>
          <FaqAccordion faqs={aboutData.faqs} />
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LUXURY BOOKING & CONCIERGE CTA STRIP
          ========================================================================= */}
      <section className="about-cta-section">
        <div className="about-cta-container">
          <div className="about-cta-box">
            <div className="about-eyebrow" style={{ justifyContent: 'center' }}>
              <span className="about-eyebrow-symbol">✦</span>
              <span>EXPERIENCE VIENNA IN UNPARALLELED COMFORT</span>
            </div>
            <h2 className="about-cta-title">Ready for Your Next European Journey?</h2>
            <p className="about-cta-text">
              Reserve your private Mercedes-Benz transfer or bespoke day trip today. Our dedicated concierge team is available 24/7.
            </p>
            <div className="about-cta-actions">
              <Link to="/#hero-booking-card" className="btn btn-primary about-cta-btn">
                <Calendar size={18} />
                <span>BOOK YOUR PRIVATE CHAUFFEUR</span>
              </Link>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary about-cta-btn whatsapp-cta"
              >
                <MessageSquare size={18} style={{ color: '#25D366' }} />
                <span>WHATSAPP CONCIERGE (24/7)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCOPED STYLES FOR ABOUT US PAGE
          Matching exact requirements:
          - Colours: #FAF8F4, #17191C, #C69C50, #707070, #E6D8C3
          - Fonts: Playfair Display, Lora
          - Two-column hero: 52% left / 48% right, 40px gap, 1440px max width, 50px horiz, 65px top/bottom
          - Arch frame: 100% width, max-height 520px, thin champagne-gold border (1px solid #C69C50), rounded arch top, straight bottom
          - Complete mobile responsiveness across 320px, 375px, 430px, 768px, 1024px, 1440px, 1920px
          ========================================================================= */}
      <style>{`
        .about-page-wrapper {
          background-color: #FAF8F4;
          color: #17191C;
          font-family: 'Lora', Georgia, serif;
          overflow-x: hidden;
          width: 100%;
        }

        /* Hero Section */
        .about-hero-section {
          background-color: #FAF8F4;
          padding-top: 65px;
          padding-bottom: 65px;
          border-bottom: 1px solid #E6D8C3;
        }

        .about-hero-container {
          max-width: 1440px;
          margin: 0 auto;
          padding-left: 50px;
          padding-right: 50px;
          display: grid;
          grid-template-columns: 52% 48%;
          gap: 40px;
          align-items: flex-start;
        }

        /* Left Column Content */
        .about-left-col {
          display: flex;
          flex-direction: column;
        }

        .about-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C69C50;
          margin-bottom: 16px;
        }

        .about-eyebrow-symbol {
          font-size: 11px;
          color: #C69C50;
        }

        .about-main-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 52px;
          font-weight: 700;
          line-height: 1.15;
          color: #17191C;
          margin: 0 0 22px 0;
          letter-spacing: -0.01em;
        }

        .about-main-heading .gold-text {
          color: #C69C50;
        }

        .about-lead-description {
          font-family: 'Lora', Georgia, serif;
          font-size: 16px;
          line-height: 1.75;
          color: #707070;
          margin: 0 0 32px 0;
        }

        .about-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, #E6D8C3 0%, rgba(230, 216, 195, 0.4) 100%);
          margin-bottom: 30px;
        }

        .about-story-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C69C50;
          margin-bottom: 10px;
        }

        .about-story-statement {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.35;
          color: #17191C;
          letter-spacing: 0.02em;
          margin: 0 0 20px 0;
        }

        .about-story-paragraphs {
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: 'Lora', Georgia, serif;
          font-size: 15px;
          line-height: 1.8;
          color: #707070;
          margin-bottom: 36px;
        }

        .about-story-paragraphs p {
          margin: 0;
        }

        /* Stats Grid */
        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .about-stat-card {
          background-color: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 12px;
          padding: 20px 22px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }

        .about-stat-card:hover {
          transform: translateY(-2px);
          border-color: #C69C50;
        }

        .about-stat-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          font-weight: 800;
          color: #C69C50;
          line-height: 1.1;
          margin-bottom: 6px;
        }

        .about-stat-label {
          font-family: 'Lora', Georgia, serif;
          font-size: 13.5px;
          color: #707070;
          line-height: 1.4;
        }

        /* Right Column & Arch Frame */
        .about-right-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .about-arch-frame {
          width: 100%;
          max-height: 520px;
          height: 520px;
          border: 1px solid #C69C50;
          border-top-left-radius: 260px;
          border-top-right-radius: 260px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          overflow: hidden;
          background-color: #FAF8F4;
          box-shadow: 0 16px 36px rgba(23, 25, 28, 0.06);
          position: relative;
        }

        .about-arch-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-arch-frame:hover .about-arch-img {
          transform: scale(1.02);
        }

        .about-arch-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(250, 248, 244, 0) 60%, rgba(23, 25, 28, 0.18) 100%);
          pointer-events: none;
        }

        .about-image-badge {
          margin-top: 18px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 12px;
          padding: 12px 18px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
        }

        .badge-gold-icon {
          color: #C69C50;
          flex-shrink: 0;
        }

        .badge-title {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13.5px;
          font-weight: 700;
          color: #17191C;
        }

        .badge-sub {
          display: block;
          font-size: 12px;
          color: #707070;
        }

        /* Values Section */
        .about-values-section {
          padding: 80px 0;
          background-color: #FAF8F4;
          border-bottom: 1px solid #E6D8C3;
        }

        .about-values-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 50px;
        }

        .about-section-header {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 50px auto;
        }

        .about-section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px, 3.2vw, 36px);
          font-weight: 700;
          color: #17191C;
          margin: 10px 0 14px 0;
          letter-spacing: 0.02em;
        }

        .about-section-subtitle {
          font-family: 'Lora', Georgia, serif;
          font-size: 15.5px;
          color: #707070;
          line-height: 1.7;
          margin: 0;
        }

        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .about-value-card {
          background-color: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 16px;
          padding: 32px 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .about-value-card:hover {
          transform: translateY(-4px);
          border-color: #C69C50;
          box-shadow: 0 16px 36px rgba(198, 156, 80, 0.12);
        }

        .about-value-number {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 800;
          color: #C69C50;
          margin-bottom: 16px;
        }

        .about-value-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #17191C;
          margin: 0 0 12px 0;
        }

        .about-value-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 14.5px;
          line-height: 1.7;
          color: #707070;
          margin: 0;
        }

        /* Trust & Compliance Section */
        .about-trust-section {
          padding: 80px 0;
          background-color: #FAF8F4;
          border-bottom: 1px solid #E6D8C3;
        }

        .about-trust-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 50px;
        }

        .about-trust-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .about-trust-card {
          background-color: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 18px;
          padding: 36px 32px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
        }

        .about-trust-card-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #17191C;
          margin: 0 0 16px 0;
        }

        .about-trust-card-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 15px;
          line-height: 1.75;
          color: #707070;
          margin: 0 0 24px 0;
        }

        .about-compliance-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .compliance-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #17191C;
          font-weight: 500;
        }

        .gold-check {
          color: #C69C50;
          flex-shrink: 0;
        }

        .about-partners-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .partner-tag {
          background-color: #FAF8F4;
          border: 1px solid #E6D8C3;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #17191C;
          font-family: 'Playfair Display', Georgia, serif;
        }

        /* FAQ Section */
        .about-faq-section {
          padding: 80px 0;
          background-color: #FAF8F4;
          border-bottom: 1px solid #E6D8C3;
        }

        .about-faq-container {
          max-width: 920px;
          margin: 0 auto;
          padding: 0 30px;
        }

        /* CTA Section */
        .about-cta-section {
          padding: 70px 0 90px 0;
          background-color: #FAF8F4;
        }

        .about-cta-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 30px;
        }

        .about-cta-box {
          background: linear-gradient(135deg, #FFFFFF 0%, #FAF8F4 100%);
          border: 1px solid #C69C50;
          border-radius: 24px;
          padding: 50px 40px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(198, 156, 80, 0.12);
        }

        .about-cta-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px, 3.4vw, 38px);
          font-weight: 700;
          color: #17191C;
          margin: 12px 0 16px 0;
        }

        .about-cta-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 16px;
          color: #707070;
          max-width: 680px;
          margin: 0 auto 32px auto;
          line-height: 1.7;
        }

        .about-cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .about-cta-btn {
          min-width: 250px;
          height: 52px;
          border-radius: 30px;
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .about-hero-container {
            padding-left: 35px;
            padding-right: 35px;
            gap: 30px;
          }
          .about-main-heading {
            font-size: 44px;
          }
          .about-values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .about-hero-section {
            padding-top: 45px;
            padding-bottom: 50px;
          }
          .about-hero-container {
            grid-template-columns: 1fr;
            gap: 40px;
            padding-left: 30px;
            padding-right: 30px;
          }
          .about-right-col {
            order: 2;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }
          .about-arch-frame {
            height: clamp(380px, 60vw, 480px);
            border-top-left-radius: 200px;
            border-top-right-radius: 200px;
          }
          .about-values-container,
          .about-trust-container {
            padding: 0 30px;
          }
          .about-trust-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .about-hero-section {
            padding-top: 35px;
            padding-bottom: 40px;
          }
          .about-hero-container {
            padding-left: 20px;
            padding-right: 20px;
            gap: 32px;
          }
          .about-main-heading {
            font-size: 34px;
            margin-bottom: 16px;
          }
          .about-story-statement {
            font-size: 20px;
          }
          .about-story-paragraphs {
            font-size: 14.5px;
            margin-bottom: 28px;
          }
          .about-arch-frame {
            height: clamp(300px, 75vw, 380px);
            border-top-left-radius: 160px;
            border-top-right-radius: 160px;
          }
          .about-values-section,
          .about-trust-section,
          .about-faq-section {
            padding: 50px 0;
          }
          .about-values-container,
          .about-trust-container,
          .about-faq-container,
          .about-cta-container {
            padding: 0 18px;
          }
          .about-values-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .about-cta-box {
            padding: 36px 20px;
            border-radius: 18px;
          }
          .about-cta-btn {
            width: 100%;
            min-width: unset;
          }
        }

        @media (max-width: 430px) {
          .about-hero-container {
            padding-left: 16px;
            padding-right: 16px;
          }
          .about-main-heading {
            font-size: 29px;
          }
          .about-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .about-stat-card {
            padding: 16px 18px;
          }
          .about-stat-value {
            font-size: 28px;
          }
          .about-arch-frame {
            height: 280px;
            border-top-left-radius: 140px;
            border-top-right-radius: 140px;
          }
        }
      `}</style>
    </div>
  );
}
