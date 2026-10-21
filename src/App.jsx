import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Fleet from './pages/Fleet';
import B2B from './pages/B2B';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import TourPage from './pages/TourPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 1. Homepage */}
        <Route index element={<Home />} />

        {/* 2. About Us */}
        <Route path="about-vienna-day-trip/" element={<About />} />
        <Route path="about-vienna-day-trip" element={<About />} />

        {/* 3. Our Services Overview */}
        <Route path="our-services/" element={<Services />} />
        <Route path="our-services" element={<Services />} />

        {/* 4. Airport Transfer */}
        <Route path="airport-transfer-vienna/" element={<TourPage tourKey="airport-transfer-vienna" />} />
        <Route path="airport-transfer-vienna" element={<TourPage tourKey="airport-transfer-vienna" />} />
        {/* Alias */}
        <Route path="airport-pick-drop-off/" element={<TourPage tourKey="airport-transfer-vienna" />} />
        <Route path="airport-pick-drop-off" element={<TourPage tourKey="airport-transfer-vienna" />} />
        <Route path="airport-transfer/" element={<TourPage tourKey="airport-transfer-vienna" />} />
        <Route path="airport-transfer" element={<TourPage tourKey="airport-transfer-vienna" />} />

        {/* 5. Hourly Chauffeur */}
        <Route path="hourly-chauffeur-service/" element={<TourPage tourKey="hourly-chauffeur-service" />} />
        <Route path="hourly-chauffeur-service" element={<TourPage tourKey="hourly-chauffeur-service" />} />
        <Route path="hourly-chauffeur/" element={<TourPage tourKey="hourly-chauffeur-service" />} />
        <Route path="hourly-chauffeur" element={<TourPage tourKey="hourly-chauffeur-service" />} />

        {/* 6. Vienna Sightseeing */}
        <Route path="vienna-sightseeing-tour/" element={<TourPage tourKey="vienna-sightseeing-tour" />} />
        <Route path="vienna-sightseeing-tour" element={<TourPage tourKey="vienna-sightseeing-tour" />} />

        {/* 7. Wachau Valley */}
        <Route path="wachau-valley-trip/" element={<TourPage tourKey="wachau-valley-trip" />} />
        <Route path="wachau-valley-trip" element={<TourPage tourKey="wachau-valley-trip" />} />

        {/* 8. Hallstatt Day Trip */}
        <Route path="hallstatt-day-trip-from-vienna/" element={<TourPage tourKey="hallstatt-day-trip-from-vienna" />} />
        <Route path="hallstatt-day-trip-from-vienna" element={<TourPage tourKey="hallstatt-day-trip-from-vienna" />} />
        {/* Alias */}
        <Route path="hallstatt-tour/" element={<TourPage tourKey="hallstatt-day-trip-from-vienna" />} />
        <Route path="hallstatt-tour" element={<TourPage tourKey="hallstatt-day-trip-from-vienna" />} />

        {/* 9. Salzburg Day Trip */}
        <Route path="salzburg-day-trip/" element={<TourPage tourKey="salzburg-day-trip" />} />
        <Route path="salzburg-day-trip" element={<TourPage tourKey="salzburg-day-trip" />} />

        {/* 10. Budapest Day Trip */}
        <Route path="budapest-day-trip/" element={<TourPage tourKey="budapest-day-trip" />} />
        <Route path="budapest-day-trip" element={<TourPage tourKey="budapest-day-trip" />} />

        {/* 11. Prague Day Trip */}
        <Route path="prague-day-trip/" element={<TourPage tourKey="prague-day-trip" />} />
        <Route path="prague-day-trip" element={<TourPage tourKey="prague-day-trip" />} />

        {/* 12. Bratislava Day Trip */}
        <Route path="bratislava-day-trip/" element={<TourPage tourKey="bratislava-day-trip" />} />
        <Route path="bratislava-day-trip" element={<TourPage tourKey="bratislava-day-trip" />} />

        {/* 13. Customized Day Trips */}
        <Route path="customized-day-trips/" element={<TourPage tourKey="customized-day-trips" />} />
        <Route path="customized-day-trips" element={<TourPage tourKey="customized-day-trips" />} />
        <Route path="day-trips/" element={<TourPage tourKey="customized-day-trips" />} />
        <Route path="day-trips" element={<TourPage tourKey="customized-day-trips" />} />

        {/* 14. Secure Transportation */}
        <Route path="secure-transportation/" element={<TourPage tourKey="secure-transportation" />} />
        <Route path="secure-transportation" element={<TourPage tourKey="secure-transportation" />} />

        {/* 15. Luxury Fleet */}
        <Route path="our-fleet/" element={<Fleet />} />
        <Route path="our-fleet" element={<Fleet />} />
        <Route path="luxury-fleet/" element={<Fleet />} />
        <Route path="luxury-fleet" element={<Fleet />} />

        {/* 16. B2B Solutions */}
        <Route path="b2b-solutions/" element={<B2B />} />
        <Route path="b2b-solutions" element={<B2B />} />

        {/* 17. Tours & Pricing */}
        <Route path="tour-pricing/" element={<Pricing />} />
        <Route path="tour-pricing" element={<Pricing />} />

        {/* 18. Blog */}
        <Route path="blog" element={<Blog />} />
        <Route path="blog/" element={<Blog />} />

        {/* 19. Contact Us */}
        <Route path="contact-us-i/" element={<Contact />} />
        <Route path="contact-us-i" element={<Contact />} />
        <Route path="contact-us/" element={<Contact />} />
        <Route path="contact-us" element={<Contact />} />

        {/* 20. Privacy Policy */}
        <Route path="privacy-policy/" element={<Legal type="privacy" />} />
        <Route path="privacy-policy" element={<Legal type="privacy" />} />

        {/* 21. Cancellation & Refund Policy */}
        <Route path="cancellation-refund-policy/" element={<Legal type="cancellation" />} />
        <Route path="cancellation-refund-policy" element={<Legal type="cancellation" />} />

        {/* 22. Imprint */}
        <Route path="imprint/" element={<Legal type="imprint" />} />
        <Route path="imprint" element={<Legal type="imprint" />} />
        <Route path="impressum/" element={<Legal type="imprint" />} />
        <Route path="impressum" element={<Legal type="imprint" />} />

        {/* Booking shortcut */}
        <Route path="booking/" element={<Navigate to="/" replace />} />
        <Route path="booking" element={<Navigate to="/" replace />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
