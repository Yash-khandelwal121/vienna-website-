import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  ArrowRight,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock3,
  ShieldCheck,
  Gem,
  Users,
  Headphones,
  Globe2,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Star,
} from "lucide-react";
import { siteConfig } from "../data/site";
import "./ViennaFooter.css";

const quickLinks = [
  { label: "Home", url: "/" },
  { label: "About Us", url: "/about" },
  { label: "Booking", url: "/booking" },
  { label: "Luxury Fleet", url: "/fleet" },
  { label: "Day Trips", url: "/day-trips" },
  { label: "Blog", url: "/blog" },
  { label: "Contact Us", url: "/contact" },
];

const services = [
  { label: "Airport Transfers", url: "/services" },
  { label: "Hourly Chauffeur", url: "/services" },
  { label: "Private Day Trips", url: "/day-trips" },
  { label: "B2B Solutions", url: "/services" },
  { label: "Corporate Travel", url: "/services" },
  { label: "Event Transportation", url: "/services" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Safe & Reliable",
    subtitle: "Travel",
  },
  {
    icon: Gem,
    title: "Luxury Fleet",
    subtitle: "Mercedes-Benz",
  },
  {
    icon: Users,
    title: "Professional",
    subtitle: "Chauffeurs",
  },
  {
    icon: Headphones,
    title: "24/7",
    subtitle: "Customer Support",
  },
  {
    icon: Globe2,
    title: "Custom European",
    subtitle: "Itineraries",
  },
];

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    url: siteConfig.socials?.instagram || "https://www.instagram.com/viennadaytrip",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: siteConfig.socials?.facebook || "https://www.facebook.com/viennadaytrip",
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: siteConfig.socials?.youtube || "https://www.youtube.com/@viennadaytrip",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: siteConfig.socials?.linkedin || "https://www.linkedin.com/in/vienna-day-trip-vdt-0b8890437/",
  },
];

export default function ViennaFooter() {
  const googleReviewsUrl =
    siteConfig.googleMapsUrl ||
    "https://www.google.com/maps/place/Vienna+Day+Trip+%7C+Private+Chauffeur+%26+Limousines+%7C+Airport+Transfers/@48.1972001,16.4100588,17z/data=!4m8!3m7!1s0x8a448010b2701db5:0x8837fa7ac4dd2722!8m2!3d48.1983157!4d16.4075483!9m1!1b1!16s%2Fg%2F11zj40_mr5!18m1!1e1?entry=ttu";

  // Animation Refs & State
  const ctaRef = useRef(null);
  const btnRef = useRef(null);
  const arrowWrapRef = useRef(null);
  const textRef = useRef(null);
  const planeRef = useRef(null);
  const trailSvgRef = useRef(null);
  const trailPathRef = useRef(null);
  const maskPathRef = useRef(null);
  const spacerRef = useRef(null);

  const [animStage, setAnimStage] = useState("initial"); // 'initial' | 'flying' | 'landed' | 'resetting'
  const [btnGlow, setBtnGlow] = useState(false);
  const isIntersectingRef = useRef(false);
  const animFrameIdRef = useRef(null);

  // Compute curved flight coordinates dynamically based on actual element geometry
  const computeGeometry = () => {
    if (!ctaRef.current || !btnRef.current) return null;
    const ctaRect = ctaRef.current.getBoundingClientRect();
    const btnRect = btnRef.current.getBoundingClientRect();
    const arrowRect = arrowWrapRef.current
      ? arrowWrapRef.current.getBoundingClientRect()
      : null;
    const textRect = textRef.current ? textRef.current.getBoundingClientRect() : null;
    const isMobile = ctaRect.width < 760;

    let x0, y0, x1, y1, cp1x, cp1y, cp2x, cp2y;

    if (!isMobile) {
      // Desktop: Start on the left, arch gracefully over heading without touching text,
      // land gently right beside the button's arrow icon
      x0 = 62;
      y0 = ctaRect.height * 0.5;

      // Target position: right beside the button's arrow icon
      if (arrowRect) {
        x1 = arrowRect.left - ctaRect.left - 16;
        y1 = arrowRect.top - ctaRect.top + arrowRect.height * 0.5 - 2;
      } else {
        x1 = btnRect.right - ctaRect.left - 38;
        y1 = btnRect.top - ctaRect.top + btnRect.height * 0.5 - 2;
      }

      // Arch peak strictly above heading text (safe upper margin)
      const textTop = textRect ? textRect.top - ctaRect.top : 32;
      const peakY = Math.max(8, textTop - 26);

      cp1x = x0 + (x1 - x0) * 0.26;
      cp1y = peakY;
      cp2x = x0 + (x1 - x0) * 0.74;
      cp2y = peakY + 4;
    } else {
      // Mobile: Start top-left, gentle swoop, land beside arrow inside full-width button
      x0 = 36;
      y0 = 34;

      if (arrowRect) {
        x1 = arrowRect.left - ctaRect.left - 14;
        y1 = arrowRect.top - ctaRect.top + arrowRect.height * 0.5 - 1;
      } else {
        x1 = btnRect.right - ctaRect.left - 34;
        y1 = btnRect.top - ctaRect.top + btnRect.height * 0.5 - 1;
      }

      cp1x = x0 + (x1 - x0) * 0.28;
      cp1y = Math.max(6, y0 - 18);
      cp2x = x1 + 6;
      cp2y = y0 + (y1 - y0) * 0.42;
    }

    const d = `M ${x0} ${y0} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x1} ${y1}`;
    return { d, x0, y0, x1, y1 };
  };

  useEffect(() => {
    let geom = computeGeometry();

    // Reduced motion preference check
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setupInitialPosition = () => {
      geom = computeGeometry();
      if (!geom) return;

      if (trailPathRef.current) trailPathRef.current.setAttribute("d", geom.d);
      if (maskPathRef.current) {
        maskPathRef.current.setAttribute("d", geom.d);
        const len = maskPathRef.current.getTotalLength();
        maskPathRef.current.style.strokeDasharray = `${len}`;
        maskPathRef.current.style.strokeDashoffset = `${len}`;
      }
      if (planeRef.current) {
        planeRef.current.style.transform = `translate3d(${geom.x0}px, ${geom.y0}px, 0) translate(-50%, -50%) rotate(35deg)`;
        planeRef.current.style.opacity = "1";
      }
      if (trailSvgRef.current) {
        trailSvgRef.current.style.opacity = "1";
      }
    };

    setupInitialPosition();

    // If user requests reduced motion, keep plane static at start
    if (prefersReduced) {
      return;
    }

    // Animation Cycle Timing (Total: 5.5s = 5500ms)
    const CYCLE_DURATION = 5500;
    const FLIGHT_DURATION = 2600;
    const LANDED_PAUSE = 1000;
    const FADE_OUT_DURATION = 500;
    const RESET_TIME = 4200;
    const FADE_IN_START = 4600;

    let cycleStartTime = null;

    const animateLoop = (timestamp) => {
      if (!isIntersectingRef.current) {
        animFrameIdRef.current = null;
        return;
      }

      if (!cycleStartTime) cycleStartTime = timestamp;
      const elapsed = (timestamp - cycleStartTime) % CYCLE_DURATION;

      // Recompute path length if needed
      const maskEl = maskPathRef.current;
      const planeEl = planeRef.current;
      const svgEl = trailSvgRef.current;
      const totalLen = maskEl ? maskEl.getTotalLength() : 800;

      if (elapsed < FLIGHT_DURATION) {
        // --- PHASE 1: FLIGHT TOWARDS GET A QUOTE BUTTON (0 to 2600ms) ---
        const progress = elapsed / FLIGHT_DURATION;
        // Cubic ease-in-out for graceful aerodynamic feel
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (planeEl) {
          planeEl.style.opacity = "1";
          planeEl.classList.remove("is-landed");
        }
        if (svgEl) {
          svgEl.style.opacity = "1";
        }

        if (maskEl) {
          const currentDist = eased * totalLen;
          const pt = maskEl.getPointAtLength(currentDist);
          const ptNext = maskEl.getPointAtLength(Math.min(currentDist + 2, totalLen));

          const angleRad = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x);
          const angleDeg = angleRad * (180 / Math.PI);
          const iconRotation = angleDeg - 45; // Lucide plane naturally points 45deg

          if (planeEl) {
            planeEl.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%) rotate(${iconRotation}deg)`;
          }
          maskEl.style.strokeDashoffset = `${totalLen * (1 - eased)}`;
        }
      } else if (elapsed < FLIGHT_DURATION + LANDED_PAUSE) {
        // --- PHASE 2: LANDED BESIDE ARROW & BUTTON GLOW (2600ms to 3600ms) ---
        if (geom && planeEl) {
          planeEl.style.transform = `translate3d(${geom.x1}px, ${geom.y1}px, 0) translate(-50%, -50%) rotate(-12deg)`;
          planeEl.classList.add("is-landed");
          planeEl.style.opacity = "1";
        }
        if (maskEl) {
          maskEl.style.strokeDashoffset = "0";
        }
        if (svgEl) {
          svgEl.style.opacity = "1";
        }

        // Trigger button glow for first 600ms of touchdown
        const landedElapsed = elapsed - FLIGHT_DURATION;
        if (landedElapsed < 600) {
          setBtnGlow(true);
        } else {
          setBtnGlow(false);
        }
      } else if (elapsed < RESET_TIME) {
        // --- PHASE 3: SMOOTH FADE OUT BEFORE RESET (3600ms to 4200ms) ---
        setBtnGlow(false);
        const fadeProgress = (elapsed - (FLIGHT_DURATION + LANDED_PAUSE)) / FADE_OUT_DURATION;
        const opacityVal = Math.max(0, 1 - fadeProgress);

        if (planeEl) {
          planeEl.style.opacity = `${opacityVal}`;
        }
        if (svgEl) {
          svgEl.style.opacity = `${opacityVal}`;
        }
      } else if (elapsed < FADE_IN_START) {
        // --- PHASE 4: INVISIBLE REPOSITION BACK TO ORIGIN (4200ms to 4600ms) ---
        if (planeEl && geom) {
          planeEl.style.opacity = "0";
          planeEl.classList.remove("is-landed");
          planeEl.style.transform = `translate3d(${geom.x0}px, ${geom.y0}px, 0) translate(-50%, -50%) rotate(35deg)`;
        }
        if (maskEl) {
          maskEl.style.strokeDashoffset = `${totalLen}`;
        }
        if (svgEl) {
          svgEl.style.opacity = "0";
        }
      } else {
        // --- PHASE 5: FADE IN AT ORIGIN & SHORT REST BEFORE NEXT TAKEOFF (4600ms to 5500ms) ---
        const inProgress = Math.min((elapsed - FADE_IN_START) / 600, 1);
        if (planeEl && geom) {
          planeEl.style.opacity = `${inProgress}`;
          planeEl.style.transform = `translate3d(${geom.x0}px, ${geom.y0}px, 0) translate(-50%, -50%) rotate(35deg)`;
        }
        if (svgEl) {
          svgEl.style.opacity = "0";
        }
      }

      animFrameIdRef.current = requestAnimationFrame(animateLoop);
    };

    // Handle viewport resize dynamically
    const handleResize = () => {
      geom = computeGeometry();
      if (!geom) return;
      if (trailPathRef.current) trailPathRef.current.setAttribute("d", geom.d);
      if (maskPathRef.current) {
        maskPathRef.current.setAttribute("d", geom.d);
        const len = maskPathRef.current.getTotalLength();
        maskPathRef.current.style.strokeDasharray = `${len}`;
      }
    };

    window.addEventListener("resize", handleResize);

    // IntersectionObserver to run animation continuously whenever visible
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isIntersectingRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (!animFrameIdRef.current) {
            cycleStartTime = null; // Fresh cycle start on view
            animFrameIdRef.current = requestAnimationFrame(animateLoop);
          }
        } else {
          if (animFrameIdRef.current) {
            cancelAnimationFrame(animFrameIdRef.current);
            animFrameIdRef.current = null;
          }
        }
      },
      { threshold: 0.15 }
    );

    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <footer className="lux-footer">
      {/* TOP CTA WITH FLYING AIRPLANE ANIMATION */}
      <section className="lux-footer-top">
        <div className="lux-footer-cta" ref={ctaRef}>
          {/* SVG Flight Trail Stage */}
          <svg
            className="lux-flight-stage-svg"
            ref={trailSvgRef}
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <defs>
              <mask id="lux-trail-reveal-mask">
                <path
                  ref={maskPathRef}
                  d=""
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </mask>
            </defs>
            <path
              ref={trailPathRef}
              className="lux-flight-trail-path"
              d=""
              fill="none"
              stroke="#c69a4a"
              strokeWidth="2.2"
              strokeDasharray="4 6"
              strokeLinecap="round"
              mask="url(#lux-trail-reveal-mask)"
            />
          </svg>

          {/* Golden Airplane Actor */}
          <div
            className={`lux-flying-plane ${animStage === "landed" ? "is-landed" : ""}`}
            ref={planeRef}
            aria-hidden="true"
          >
            <Plane size={36} className="lux-plane-svg-icon" />
          </div>

          {/* Left Spacer so text never shifts when airplane takes off */}
          <div className="lux-plane-spacer" ref={spacerRef} aria-hidden="true" />

          {/* CTA Text */}
          <div className="lux-cta-text" ref={textRef}>
            <h2>
              Ready for your <em>next journey?</em>
            </h2>

            <p>
              Book with Vienna Day Trip for a seamless and luxurious travel experience.
            </p>
          </div>

          {/* Action Button */}
          <Link
            to="/booking"
            className={`lux-cta-btn ${btnGlow ? "lux-btn-landed-glow" : ""}`}
            ref={btnRef}
          >
            <span>GET A QUOTE</span>
            <span ref={arrowWrapRef} style={{ display: "inline-flex", alignItems: "center" }}>
              <ArrowRight size={20} />
            </span>
          </Link>
        </div>
      </section>

      {/* MAIN FOOTER */}
      <section className="lux-footer-main">
        <div className="lux-car-image" aria-hidden="true">
          <img
            src="/images/footer-mercedes.png"
            alt=""
            loading="lazy"
          />
        </div>

        <div className="lux-vienna-image" aria-hidden="true">
          <img
            src="/images/footer-vienna.jpg"
            alt=""
            loading="lazy"
          />
        </div>

        <div className="lux-footer-grid">
          {/* BRAND */}
          <div className="lux-brand">
            <Link to="/" className="lux-brand-header">
              <div className="lux-logo-frame">
                <img
                  src="/images/logo.png"
                  alt="Vienna Day Trip"
                  className="lux-logo"
                  onError={(e) => {
                    e.currentTarget.src = "/images/logo2.png";
                  }}
                />
              </div>

              <div>
                <h2>VIENNA DAY TRIP</h2>
                <span>LUXURY • COMFORT • BEYOND</span>
              </div>
            </Link>

            <p className="lux-description">
              Premium chauffeur services in Vienna, connecting you to unforgettable
              journeys across Austria and beyond.
            </p>

            <div className="lux-social">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={19} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="lux-column">
            <h3>Quick Links</h3>

            <ul>
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.url}>
                    <ChevronRight size={16} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SERVICES */}
          <div className="lux-column">
            <h3>Our Services</h3>

            <ul>
              {services.map((item) => (
                <li key={item.label}>
                  <Link to={item.url}>
                    <ChevronRight size={16} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="lux-column lux-contact">
            <h3>Contact Us</h3>

            <div className="lux-contact-item">
              <MapPin size={20} />
              <span>
                Lechnerstraße 2,<br />
                1030 Vienna, Austria
              </span>
            </div>

            <div className="lux-contact-item">
              <Phone size={20} />
              <a href={`tel:${siteConfig.phone || "+436642035445"}`}>
                {siteConfig.phoneDisplay || "+43 664 2035445"}
              </a>
            </div>

            <div className="lux-contact-item">
              <Mail size={20} />
              <a href={`mailto:${siteConfig.email || "booking@viennadaytrip.com"}`}>
                {siteConfig.email || "booking@viennadaytrip.com"}
              </a>
            </div>

            <div className="lux-contact-item">
              <Clock3 size={20} />
              <span>24 Hours / 7 Days a Week</span>
            </div>

            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lux-review-btn"
            >
              <Star size={18} fill="#e2a843" stroke="#e2a843" />
              <span>Read Google Reviews</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lux-footer-features">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div className="lux-feature" key={feature.title}>
              <Icon size={32} />

              <div>
                <strong>{feature.title}</strong>
                <span>{feature.subtitle}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* COPYRIGHT */}
      <section className="lux-footer-bottom">
        <p>
          © {new Date().getFullYear()} Vienna Day Trip. All rights reserved. | GISA: 9110025257769. Member of WKO.
        </p>

        <div className="lux-legal">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
            Sitemap
          </a>
        </div>
      </section>
    </footer>
  );
}
