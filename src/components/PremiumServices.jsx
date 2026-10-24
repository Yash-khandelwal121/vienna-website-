import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function PremiumServices() {
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      number: "01",
      icon: "✈",
      title: "Airport Transfers",
      description:
        "Stress-free Vienna airport transfers with professional chauffeurs, flight tracking and luggage assistance.",
      image: "/images/airport-transfer.webp",
      link: "/airport-transfer-vienna/",
    },
    {
      number: "02",
      icon: "♙",
      title: "Hourly Chauffeur",
      description:
        "Enjoy a professional chauffeur and luxury Mercedes for business meetings, shopping and special occasions.",
      image: "/images/hourly-chauffeur.webp",
      link: "/hourly-chauffeur-service/",
    },
    {
      number: "03",
      icon: "♜",
      title: "Private Day Trips",
      description:
        "Discover beautiful European destinations with personalized private tours and comfortable luxury transportation.",
      image: "/images/private-day-trips.webp",
      link: "/day-trips/",
    },
    {
      number: "04",
      icon: "♢",
      title: "Secure Transportation",
      description:
        "Discreet, comfortable and professionally managed transportation for executives and private clients.",
      image: "/images/secure-transportation.webp?v=fitted1",
      link: "/secure-transportation/",
    },
  ];

  return (
    <>
      <style>{`
        .vdt-premium-services {
          width: 100%;
          background: #faf8f4;
          padding: 55px 0 45px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .vdt-premium-services *,
        .vdt-premium-services *::before,
        .vdt-premium-services *::after {
          box-sizing: border-box;
        }

        .vdt-services-container {
          max-width: 1320px;
          margin: auto;
          padding: 0 35px;
          display: grid;
          grid-template-columns: minmax(0, 52fr) minmax(0, 48fr);
          gap: 35px;
          align-items: center;
        }

        .vdt-services-left {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .vdt-services-eyebrow {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
        }

        .vdt-services-eyebrow span {
          color: #bc9149;
          font-family: "Lora", Georgia, serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3.5px;
          text-transform: uppercase;
        }

        .vdt-services-eyebrow::after {
          content: "";
          width: 80px;
          height: 1px;
          background: #c69c50;
          opacity: 0.8;
        }

        .vdt-services-heading {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 44px;
          line-height: 1.15;
          font-weight: 600;
          letter-spacing: -0.5px;
          color: #17191c;
          margin: 0 0 12px;
        }

        .vdt-services-heading span {
          color: #b88b3c;
        }

        .vdt-services-description {
          max-width: 560px;
          font-family: "Lora", Georgia, serif;
          color: #62666d;
          font-size: 15px;
          line-height: 1.7;
          margin: 0 0 20px;
        }

        .vdt-services-list {
          display: flex;
          flex-direction: column;
        }

        .vdt-service-row {
          display: grid;
          grid-template-columns: 36px 46px minmax(0, 1fr) 40px;
          gap: 12px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #e6d8c3;
          transition: background-color 0.25s ease, padding-left 0.25s ease;
          cursor: pointer;
          border-radius: 6px;
        }

        .vdt-service-row:last-child {
          border-bottom: none;
        }

        .vdt-service-row.active {
          background-color: rgba(198, 156, 80, 0.05);
          padding-left: 8px;
        }

        .vdt-service-number {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 32px;
          font-weight: 400;
          color: #c69c50;
          line-height: 1;
        }

        .vdt-service-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #f3ece0;
          color: #b88b3c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: background-color 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }

        .vdt-service-row.active .vdt-service-icon {
          background: #eedfc8;
          color: #9f752a;
          transform: scale(1.04);
        }

        .vdt-service-text {
          min-width: 0;
          padding-right: 6px;
        }

        .vdt-service-text h3 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 21px;
          font-weight: 600;
          line-height: 1.25;
          color: #17191c;
          margin: 0 0 3px;
          transition: color 0.2s ease;
        }

        .vdt-service-row.active .vdt-service-text h3 {
          color: #b88b3c;
        }

        .vdt-service-text p {
          font-family: "Lora", Georgia, serif;
          font-size: 12px;
          line-height: 1.55;
          color: #62666d;
          margin: 0;
        }

        .vdt-service-arrow {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #c69c50;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          text-decoration: none;
          transition: background-color 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }

        .vdt-service-arrow:hover,
        .vdt-service-arrow:focus-visible {
          background: #17191c;
          transform: translateX(3px);
        }

        .vdt-services-right {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vdt-services-arch {
          position: relative;
          width: 100%;
          max-height: 540px;
          aspect-ratio: 1024 / 886;
          overflow: hidden;
          border: 1px solid #c69c50;
          border-radius: 50% 50% 0 0;
          background: #faf8f4;
          box-shadow: 0 12px 35px rgba(23, 25, 28, 0.05);
          transition: border-color 0.3s ease;
        }

        /* Service 04 already has a luxury gold arch frame in the artwork.
           We avoid drawing a second outer arch border so exactly one gold arch outline is visible. */
        .vdt-services-arch.service-has-frame {
          border-color: transparent;
          box-shadow: none;
        }

        .vdt-services-arch img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          padding: 0;
          opacity: 0;
          z-index: 1;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .vdt-services-arch img.active {
          opacity: 1;
          z-index: 2;
          pointer-events: auto;
        }

        /* Specific fit for the framed secure transportation image */
        .vdt-services-arch img.has-own-frame {
          object-fit: contain;
          object-position: center center;
        }

        .vdt-services-bottom {
          max-width: 850px;
          margin: 35px auto 0;
          padding: 0 25px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .vdt-services-bottom::before,
        .vdt-services-bottom::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #c69c50;
          opacity: 0.6;
        }

        .vdt-services-bottom span {
          font-family: "Lora", Georgia, serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #b88b3c;
          text-align: center;
          text-transform: uppercase;
        }

        /* =========================================================================
           RESPONSIVE OVERRIDES
           ========================================================================= */
        @media (max-width: 1024px) {
          .vdt-services-container {
            padding: 0 20px;
            gap: 20px;
          }

          .vdt-services-heading {
            font-size: 36px;
          }

          .vdt-service-row {
            grid-template-columns: 30px 40px minmax(0, 1fr) 36px;
            gap: 10px;
            padding: 12px 0;
          }

          .vdt-service-number {
            font-size: 26px;
          }

          .vdt-service-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .vdt-service-arrow {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }

          .vdt-service-text h3 {
            font-size: 18px;
          }

          .vdt-services-right {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .vdt-services-arch {
            max-height: 420px;
          }
        }

        @media (max-width: 767px) {
          .vdt-premium-services {
            padding: 40px 0 30px;
          }

          .vdt-services-container {
            grid-template-columns: 1fr;
            gap: 25px;
            padding: 0 16px;
          }

          .vdt-services-heading {
            font-size: 30px;
            margin-bottom: 8px;
          }

          .vdt-services-description {
            font-size: 14px;
            margin-bottom: 18px;
          }

          .vdt-service-row {
            grid-template-columns: 28px 38px minmax(0, 1fr) 34px;
            gap: 8px;
            padding: 11px 0;
          }

          .vdt-service-number {
            font-size: 24px;
          }

          .vdt-service-icon {
            width: 38px;
            height: 38px;
            font-size: 17px;
          }

          .vdt-service-text h3 {
            font-size: 17px;
          }

          .vdt-service-text p {
            font-size: 11px;
            line-height: 1.5;
          }

          .vdt-service-arrow {
            width: 34px;
            height: 34px;
            font-size: 16px;
          }

          /* Mobile Order: Heading & Services first, then Image */
          .vdt-services-left {
            order: 1;
          }

          .vdt-services-right {
            order: 2;
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .vdt-services-arch {
            width: 100%;
            aspect-ratio: 1024 / 886;
            max-height: none;
          }

          .vdt-services-arch img {
            padding: 0;
          }

          .vdt-services-bottom {
            margin-top: 25px;
            gap: 12px;
          }

          .vdt-services-bottom span {
            font-size: 8px;
            letter-spacing: 2px;
          }
        }

        @media (max-width: 380px) {
          .vdt-services-container {
            padding: 0 10px;
          }
          .vdt-service-row {
            grid-template-columns: 24px 34px minmax(0, 1fr) 30px;
            gap: 6px;
          }
          .vdt-service-number {
            font-size: 20px;
          }
          .vdt-service-icon {
            width: 34px;
            height: 34px;
            font-size: 15px;
          }
          .vdt-service-arrow {
            width: 30px;
            height: 30px;
            font-size: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vdt-services-arch img,
          .vdt-service-arrow,
          .vdt-service-icon,
          .vdt-service-row {
            transition: none !important;
          }
        }
      `}</style>

      <section className="vdt-premium-services">
        <div className="vdt-services-container">
          {/* LEFT SIDE: Heading, Description, Four Compact Services */}
          <div className="vdt-services-left">
            <div className="vdt-services-eyebrow">
              <span>OUR EXPERTISE</span>
            </div>

            <h2 className="vdt-services-heading">
              The Art of
              <br />
              <span>Exceptional Travel</span>
            </h2>

            <p className="vdt-services-description">
              From airport transfers to bespoke day trips, we provide
              professional chauffeur services designed around your comfort,
              privacy and peace of mind.
            </p>

            <div className="vdt-services-list">
              {services.map((service, index) => (
                <div
                  key={service.number}
                  className={`vdt-service-row ${
                    activeService === index ? "active" : ""
                  }`}
                  onMouseEnter={() => setActiveService(index)}
                  onFocus={() => setActiveService(index)}
                  onClick={() => setActiveService(index)}
                >
                  <span className="vdt-service-number">
                    {service.number}
                  </span>

                  <div className="vdt-service-icon">
                    {service.icon}
                  </div>

                  <div className="vdt-service-text">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>

                  <Link
                    to={service.link}
                    className="vdt-service-arrow"
                    aria-label={`Explore ${service.title}`}
                  >
                    →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Elegant Arch Image Frame */}
          <div className="vdt-services-right">
            <div
              className={`vdt-services-arch ${
                activeService === 3 ? "service-has-frame" : ""
              }`}
            >
              {services.map((service, index) => (
                <img
                  key={service.number}
                  src={service.image}
                  alt={service.title}
                  className={`${activeService === index ? "active" : ""} ${
                    index === 3 ? "has-own-frame" : ""
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="vdt-services-bottom">
          <span>TRUSTED FOR JOURNEYS ACROSS EUROPE</span>
        </div>
      </section>
    </>
  );
}
