import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  RotateCw,
  Play,
  Pause,
  RotateCcw,
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Maximize2
} from 'lucide-react';

/**
 * Premium Luxury Vehicle Showcase Modal
 * - Palette: #FAF8F4 background, #C69C50 champagne gold, #17191C charcoal, #E6D8C3 border
 * - Fonts: Playfair Display (headings), Lora (body)
 * - Modal border-radius: 24px
 * - Interactive 360° Studio Turntable Stage with realistic floor lighting and drag interaction
 * - Respects prefers-reduced-motion, keyboard accessible (ESC, Enter), body scroll lock
 */
export default function VehicleModal({
  isOpen,
  onClose,
  vehicle,
  vehicles,
  currentCarIdx,
  onSelectCar,
  onBookVehicle
}) {
  const [isRotating, setIsRotating] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const modalRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus modal container on open for keyboard accessibility
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Smooth continuous rotation loop (20 seconds for full 360° = 18 deg/sec)
  const animate = useCallback(
    (time) => {
      if (lastTimeRef.current !== null && isRotating && !isDragging && !prefersReducedMotion) {
        const delta = (time - lastTimeRef.current) / 1000;
        setRotationAngle((prev) => (prev + delta * 18) % 360);
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(animate);
    },
    [isRotating, isDragging, prefersReducedMotion]
  );

  useEffect(() => {
    if (isOpen) {
      lastTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, animate]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartAngle(rotationAngle);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    // 1px drag = 0.5 degrees
    const newAngle = (dragStartAngle + deltaX * 0.5) % 360;
    setRotationAngle(newAngle < 0 ? newAngle + 360 : newAngle);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      setDragStartAngle(rotationAngle);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    const newAngle = (dragStartAngle + deltaX * 0.5) % 360;
    setRotationAngle(newAngle < 0 ? newAngle + 360 : newAngle);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setRotationAngle(0);
    setIsRotating(false);
  };

  const toggleRotation = () => {
    setIsRotating((prev) => !prev);
  };

  if (!isOpen || !vehicle) return null;

  // Calculate subtle perspective swivel based on rotationAngle (restricted to realistic studio angle +-14deg)
  const swivelX = Math.sin((rotationAngle * Math.PI) / 180) * 12; // tilt horizontal
  const spotlightAngle = rotationAngle % 360;

  return (
    <div
      className="vdt-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-vehicle-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="vdt-modal-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="vdt-modal-close-btn"
          aria-label="Close vehicle showcase"
        >
          <X size={20} />
        </button>

        {/* Modal Layout: Two Columns on Desktop */}
        <div className="vdt-modal-grid">
          {/* =========================================================
              LEFT COLUMN: REALISTIC 360° STUDIO TURNTABLE SHOWCASE
              ========================================================= */}
          <div className="vdt-modal-viewer-col">
            {/* Fleet Switcher Tabs inside Modal */}
            <div className="vdt-modal-fleet-nav" role="tablist" aria-label="Select Mercedes-Benz model">
              {vehicles.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentCarIdx}
                  onClick={() => onSelectCar(idx)}
                  className={`vdt-modal-tab-pill ${idx === currentCarIdx ? 'active' : ''}`}
                >
                  {v.name.replace('Mercedes-Benz ', '')}
                </button>
              ))}
            </div>

            {/* Interactive Turntable Studio Stage */}
            <div
              className={`vdt-studio-stage ${isDragging ? 'grabbing' : 'grab'}`}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              title="Click and drag to rotate the showroom turntable"
            >
              {/* Studio Spotlight Glow */}
              <div
                className="vdt-studio-spotlight"
                style={{
                  background: `radial-gradient(ellipse 65% 55% at ${50 + Math.cos((spotlightAngle * Math.PI) / 180) * 15}% 45%, rgba(212, 175, 55, 0.16) 0%, rgba(198, 156, 80, 0.04) 50%, transparent 75%)`
                }}
              />

              {/* Turntable Floor Platform */}
              <div
                className="vdt-turntable-platform"
                style={{
                  transform: `rotateX(68deg) rotateZ(${rotationAngle}deg)`
                }}
              >
                <div className="vdt-turntable-disc">
                  <div className="vdt-turntable-ring-outer" />
                  <div className="vdt-turntable-ring-inner" />
                  <div className="vdt-turntable-marker" />
                </div>
              </div>

              {/* Realistic Ground Shadow */}
              <div className="vdt-studio-shadow" />

              {/* Centered Mercedes Vehicle */}
              <div
                className="vdt-studio-car-anchor"
                style={{
                  transform: `perspective(900px) rotateY(${swivelX}deg)`
                }}
              >
                <picture>
                  <source srcSet={vehicle.image} type="image/webp" />
                  <img
                    src={vehicle.fallback || vehicle.image}
                    alt={vehicle.alt || vehicle.name}
                    className="vdt-studio-car-img"
                    draggable="false"
                  />
                </picture>
              </div>

              {/* Interactive Drag Hint */}
              <div className="vdt-drag-hint">
                <RotateCw size={13} className={isRotating ? 'spin-slow' : ''} />
                <span>Drag to inspect turntable • 360° Showroom</span>
              </div>
            </div>

            {/* Viewer Controls Bar */}
            <div className="vdt-viewer-controls-bar">
              <button
                type="button"
                onClick={toggleRotation}
                className="vdt-viewer-ctrl-btn"
                title={isRotating ? 'Pause rotation' : 'Start automatic rotation'}
                aria-label={isRotating ? 'Pause rotation' : 'Start automatic rotation'}
              >
                {isRotating ? <Pause size={14} /> : <Play size={14} />}
                <span>{isRotating ? 'Pause Rotation' : 'Auto Rotate'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetView}
                className="vdt-viewer-ctrl-btn"
                title="Reset turntable to center"
                aria-label="Reset turntable view"
              >
                <RotateCcw size={14} />
                <span>Reset View</span>
              </button>

              <div className="vdt-speed-tag">
                <span>20s 360° Turn</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: VEHICLE INFORMATION & BOOKING ACTION
              ========================================================= */}
          <div className="vdt-modal-info-col">
            {/* Category Eyebrow */}
            <div className="vdt-modal-eyebrow">
              <span className="vdt-modal-category-text">{vehicle.category}</span>
              <span className="vdt-modal-eyebrow-dot">•</span>
              <span className="vdt-modal-badge-text">{vehicle.badge}</span>
            </div>

            {/* Model Name */}
            <h2 id="modal-vehicle-title" className="vdt-modal-title">
              {vehicle.name}
            </h2>

            {/* Tagline */}
            {vehicle.tagline && (
              <p className="vdt-modal-tagline">"{vehicle.tagline}"</p>
            )}

            {/* Capacity & Ride Badges */}
            <div className="vdt-modal-specs-grid">
              <div className="vdt-spec-pill">
                <div className="vdt-spec-icon-box">
                  <Users size={16} />
                </div>
                <div>
                  <span className="vdt-spec-label">PASSENGERS</span>
                  <span className="vdt-spec-val">{vehicle.passengers}</span>
                </div>
              </div>

              <div className="vdt-spec-pill">
                <div className="vdt-spec-icon-box">
                  <Briefcase size={16} />
                </div>
                <div>
                  <span className="vdt-spec-label">LUGGAGE CAPACITY</span>
                  <span className="vdt-spec-val">{vehicle.luggage}</span>
                </div>
              </div>

              {vehicle.ride && (
                <div className="vdt-spec-pill">
                  <div className="vdt-spec-icon-box">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="vdt-spec-label">CHASSIS & RIDE</span>
                    <span className="vdt-spec-val">{vehicle.ride}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Short Premium Description */}
            <div className="vdt-modal-desc-box">
              <p className="vdt-modal-desc-text">{vehicle.description}</p>
            </div>

            {/* Feature Highlights */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="vdt-modal-features-list">
                <h4 className="vdt-features-title">First-Class Amenities:</h4>
                <div className="vdt-features-grid">
                  {vehicle.features.map((feat, i) => (
                    <div key={i} className="vdt-feature-row">
                      <CheckCircle2 size={14} className="vdt-check-icon" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking CTA Button */}
            <div className="vdt-modal-actions">
              <button
                type="button"
                onClick={() => onBookVehicle(vehicle)}
                className="vdt-modal-book-btn"
                id="modal-book-vehicle-btn"
              >
                <span>BOOK THIS {vehicle.name.toUpperCase()}</span>
                <ArrowRight size={16} />
              </button>

              <p className="vdt-modal-guarantee">
                Direct booking confirmation via WhatsApp • Fixed transparent rates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped CSS Styles for Vehicle Details Modal */}
      <style>{`
        /* Modal Backdrop: Opacity transition 0 -> 1 */
        .vdt-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(17, 19, 23, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: vdtFadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes vdtFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Modal Card: Scale 0.96 -> 1, Opacity 0 -> 1, Duration 350ms */
        .vdt-modal-container {
          background-color: #FAF8F4;
          border: 1px solid #E6D8C3;
          border-radius: 24px;
          width: 100%;
          max-width: 1060px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 28px 70px -15px rgba(23, 25, 28, 0.35),
                      0 10px 25px -10px rgba(198, 156, 80, 0.12);
          animation: vdtScaleIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          outline: none;
        }

        @keyframes vdtScaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Close Button */
        .vdt-modal-close-btn {
          position: absolute;
          top: 18px;
          right: 20px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #E6D8C3;
          background: #FAF8F4;
          color: #17191C;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          transition: all 0.2s ease;
        }

        .vdt-modal-close-btn:hover {
          background: #17191C;
          color: #FAF8F4;
          border-color: #17191C;
          transform: rotate(90deg);
        }

        /* Two-Column Grid Layout */
        .vdt-modal-grid {
          display: grid;
          grid-template-columns: 52% 48%;
          min-height: 540px;
        }

        /* =========================================================
           LEFT COLUMN: STUDIO TURNTABLE VIEWER
           ========================================================= */
        .vdt-modal-viewer-col {
          background: #F4EFE6;
          border-right: 1px solid #E6D8C3;
          padding: 24px 22px 20px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .vdt-modal-fleet-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 5;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .vdt-modal-tab-pill {
          background: #FAF8F4;
          border: 1px solid #E6D8C3;
          color: #555962;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vdt-modal-tab-pill:hover {
          border-color: #C69C50;
          color: #17191C;
        }

        .vdt-modal-tab-pill.active {
          background: #C69C50;
          color: #FFFFFF;
          border-color: #C69C50;
          box-shadow: 0 3px 10px rgba(198, 156, 80, 0.28);
        }

        /* Studio Stage */
        .vdt-studio-stage {
          position: relative;
          flex: 1;
          min-height: 340px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
          user-select: none;
          cursor: grab;
        }

        .vdt-studio-stage.grabbing {
          cursor: grabbing;
        }

        .vdt-studio-spotlight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition: background 0.15s ease-out;
        }

        /* 3D Turntable Platform Floor */
        .vdt-turntable-platform {
          position: absolute;
          bottom: 42px;
          width: 320px;
          height: 320px;
          transform-style: preserve-3d;
          pointer-events: none;
        }

        .vdt-turntable-disc {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, #FAF8F4 30%, #E9E1D3 80%, #DFD5C4 100%);
          box-shadow: 0 16px 36px rgba(23, 25, 28, 0.18),
                      inset 0 0 0 2px #E6D8C3;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vdt-turntable-ring-outer {
          position: absolute;
          inset: 12px;
          border-radius: 50%;
          border: 1px dashed rgba(198, 156, 80, 0.45);
        }

        .vdt-turntable-ring-inner {
          position: absolute;
          inset: 38px;
          border-radius: 50%;
          border: 1px solid rgba(198, 156, 80, 0.25);
        }

        .vdt-turntable-marker {
          position: absolute;
          top: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C69C50;
          box-shadow: 0 0 8px #C69C50;
        }

        /* Realistic Drop Shadow */
        .vdt-studio-shadow {
          position: absolute;
          bottom: 50px;
          width: 70%;
          height: 32px;
          background: radial-gradient(ellipse at center, rgba(23, 25, 28, 0.35) 0%, rgba(23, 25, 28, 0.08) 55%, transparent 75%);
          pointer-events: none;
        }

        /* Car Anchor */
        .vdt-studio-car-anchor {
          position: relative;
          z-index: 3;
          width: 90%;
          max-width: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.12s ease-out;
          pointer-events: none;
        }

        .vdt-studio-car-img {
          width: 100%;
          height: auto;
          max-height: 240px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 14px 24px rgba(23, 25, 28, 0.22));
        }

        /* Drag Hint */
        .vdt-drag-hint {
          position: absolute;
          bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8C8476;
          background: rgba(250, 248, 244, 0.85);
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid #E6D8C3;
          pointer-events: none;
        }

        .spin-slow {
          animation: vdtSpin 4s linear infinite;
        }

        @keyframes vdtSpin {
          100% {
            transform: rotate(360deg);
          }
        }

        /* Controls Bar */
        .vdt-viewer-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(230, 216, 195, 0.7);
          z-index: 5;
        }

        .vdt-viewer-ctrl-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FAF8F4;
          border: 1px solid #E6D8C3;
          color: #17191C;
          border-radius: 18px;
          padding: 5px 12px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vdt-viewer-ctrl-btn:hover {
          background: #C69C50;
          color: #FFFFFF;
          border-color: #C69C50;
        }

        .vdt-speed-tag {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.72rem;
          font-style: italic;
          color: #8C8476;
        }

        /* =========================================================
           RIGHT COLUMN: VEHICLE INFORMATION
           ========================================================= */
        .vdt-modal-info-col {
          padding: 32px 30px 28px 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #FAF8F4;
        }

        .vdt-modal-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .vdt-modal-category-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #C69C50;
        }

        .vdt-modal-eyebrow-dot {
          color: #C69C50;
          font-size: 0.8rem;
        }

        .vdt-modal-badge-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.76rem;
          color: #6B707B;
          font-style: italic;
        }

        .vdt-modal-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.85rem;
          line-height: 1.15;
          font-weight: 700;
          color: #17191C;
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }

        .vdt-modal-tagline {
          font-family: 'Lora', Georgia, serif;
          font-style: italic;
          font-size: 0.88rem;
          color: #727680;
          margin: 0 0 16px 0;
        }

        /* Specs Grid */
        .vdt-modal-specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .vdt-spec-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .vdt-spec-icon-box {
          color: #C69C50;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .vdt-spec-label {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #8C8476;
          text-transform: uppercase;
        }

        .vdt-spec-val {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #17191C;
        }

        /* Description */
        .vdt-modal-desc-box {
          background: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .vdt-modal-desc-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 0.88rem;
          line-height: 1.6;
          color: #3C4048;
          margin: 0;
        }

        /* Features List */
        .vdt-modal-features-list {
          margin-bottom: 20px;
        }

        .vdt-features-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #17191C;
          margin: 0 0 8px 0;
        }

        .vdt-features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .vdt-feature-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Lora', Georgia, serif;
          font-size: 0.82rem;
          color: #4A4E57;
        }

        .vdt-check-icon {
          color: #C69C50;
          flex-shrink: 0;
        }

        /* Actions */
        .vdt-modal-actions {
          margin-top: auto;
        }

        .vdt-modal-book-btn {
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #C69C50;
          color: #FFFFFF;
          border: none;
          border-radius: 28px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(198, 156, 80, 0.35);
          transition: all 0.25s ease;
        }

        .vdt-modal-book-btn:hover {
          background: #B58B3F;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(198, 156, 80, 0.45);
        }

        .vdt-modal-book-btn:active {
          transform: translateY(0);
        }

        .vdt-modal-guarantee {
          text-align: center;
          font-family: 'Lora', Georgia, serif;
          font-size: 0.72rem;
          font-style: italic;
          color: #8C8476;
          margin: 8px 0 0 0;
        }

        /* =========================================================
           RESPONSIVE BREAKPOINTS: Mobile & Tablet
           ========================================================= */
        @media (max-width: 860px) {
          .vdt-modal-grid {
            grid-template-columns: 1fr;
          }
          .vdt-modal-viewer-col {
            border-right: none;
            border-bottom: 1px solid #E6D8C3;
            padding: 20px 16px;
          }
          .vdt-studio-stage {
            min-height: 240px;
          }
          .vdt-turntable-platform {
            width: 240px;
            height: 240px;
            bottom: 30px;
          }
          .vdt-studio-car-img {
            max-height: 180px;
          }
          .vdt-modal-info-col {
            padding: 22px 18px 20px 18px;
          }
          .vdt-modal-title {
            font-size: 1.55rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vdt-modal-backdrop,
          .vdt-modal-container {
            animation: none !important;
          }
          .spin-slow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
