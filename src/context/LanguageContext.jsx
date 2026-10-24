import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const translations = {
  en: {
    // Nav
    nav_home: 'Home',
    nav_services: 'Our Services',
    nav_daytrips: 'Day Trips',
    nav_fleet: 'Luxury Fleet',
    nav_about: 'About Us',
    nav_book_now: 'BOOK NOW',
    nav_airport_transfer: 'Airport Transfers',
    nav_hourly_chauffeur: 'Hourly Chauffeur',
    nav_private_transfers: 'Private Transfers',
    nav_b2b_solutions: 'B2B Solutions',
    nav_tours_pricing: 'Tours & Pricing',
    nav_blog: 'Blog',
    nav_contact: 'Contact Us',

    // Day Trips
    dt_hallstatt: 'Hallstatt Day Trip',
    dt_salzburg: 'Salzburg Day Trip',
    dt_budapest: 'Budapest Day Trip',
    dt_prague: 'Prague Day Trip',
    dt_bratislava: 'Bratislava Day Trip',
    dt_wachau: 'Wachau Valley Trip',
    dt_custom: 'Customized Day Trips',

    // Hero & Booking
    hero_eyebrow: 'AUSTRIAN LIMOUSINE & CHAUFFEUR EXCELLENCE',
    hero_title: 'Where Viennese Imperial Grandeur Meets Chauffeur Excellence.',
    hero_desc: 'Bespoke airport transfers, executive city chauffeur services, and private panoramic day trips across Central Europe in pristine Mercedes-Benz vehicles.',
    hero_hl_pricing: 'Fixed All-Inclusive Pricing',
    hero_hl_flight: 'Flight Tracking & Meet-and-Greet',
    hero_hl_concierge: 'Direct WhatsApp Concierge Dispatch',

    // Booking Tabs
    tab_airport: 'Airport Transfer',
    tab_daytrip: 'Private Day Trip',
    tab_hourly: 'Hourly Chauffeur',

    // Form labels
    lbl_pickup: 'Pickup Location',
    lbl_dropoff: 'Drop-off Location',
    lbl_date: 'Date',
    lbl_time: 'Pickup Time',
    lbl_passengers: 'Passengers',
    lbl_vehicle: 'Preferred Vehicle',
    lbl_flight: 'Flight Number (Optional)',
    lbl_hours: 'Duration (Hours)',
    lbl_destination: 'Select Destination',
    btn_get_quote: 'GET INSTANT WHATSAPP QUOTE',
    btn_calculating: 'Preparing Itinerary...',
    view_360_card: 'Click to open 360° showroom viewer & vehicle specifications',
    explore_viewer: 'Explore 360° Showroom',
    view_details: 'View Specs & 360°',

    // Fleet Page
    fleet_hero_title: 'Our Luxury Fleet',
    fleet_hero_desc: 'Travel in unmatched comfort with our premium Mercedes-Benz vehicles. Experience flawless engineering and discreet luxury on every route.',
    fleet_hl_1: 'Premium Mercedes-Benz Fleet',
    fleet_hl_2: 'Professional Chauffeurs',
    fleet_hl_3: 'For Every Journey',
    fleet_explore_heading: 'Explore Our Complete Fleet',
    fleet_explore_sub: 'From executive sedans to spacious vans, we have the perfect vehicle for every journey.',
    fleet_on_request: 'On Request',
    fleet_request_btn: 'Request This Vehicle',
    fleet_view_features_btn: 'View All Features',
    fleet_custom_cta_title: 'Need a Custom Fleet Solution?',
    fleet_custom_cta_desc: 'From special events to unique transportation requirements, contact our team for a personalized travel arrangement.',
    fleet_contact_team: 'Contact Our Team →',
    fleet_faq_title: 'Frequently Asked Questions',
    fleet_faq_sub: 'Everything you need to know about our Mercedes-Benz vehicle fleet and reservation policies.',
    specs_passengers: 'Passengers',
    specs_luggage: 'Luggage',
    specs_transmission: 'Ride Suspension',

    // Google Reviews
    reviews_heading: 'Our Guests, Our Greatest Recommendation',
    reviews_desc: 'Discover what our guests say about their private chauffeur experiences.',
    reviews_rating_badge: '5.0 / 5.0 Rating (150+ Verified Reviews)',
    reviews_read_all: 'Read All Google Reviews',
    reviews_write: 'Write a Review',
    reviews_verified: 'Google Verified',

    // Footer
    footer_quick_links: 'Quick Links',
    footer_services: 'Services',
    footer_contact: 'Contact & Dispatch',
    footer_247: '24 Hours / 7 Days a Week',
    footer_read_reviews: 'Read Google Reviews ↗',
    footer_rights: 'All rights reserved. GISA: 9110025257769. Member of WKO.',
  },
  de: {
    // Nav
    nav_home: 'Startseite',
    nav_services: 'Unsere Dienstleistungen',
    nav_daytrips: 'Tagesausflüge',
    nav_fleet: 'Luxusflotte',
    nav_about: 'Über Uns',
    nav_book_now: 'JETZT BUCHEN',
    nav_airport_transfer: 'Flughafentransfer',
    nav_hourly_chauffeur: 'Stundenweiser Chauffeur',
    nav_private_transfers: 'Private Transfers',
    nav_b2b_solutions: 'B2B-Lösungen',
    nav_tours_pricing: 'Touren & Preise',
    nav_blog: 'Blog',
    nav_contact: 'Kontakt',

    // Day Trips
    dt_hallstatt: 'Hallstatt Tagesausflug',
    dt_salzburg: 'Salzburg Tagesausflug',
    dt_budapest: 'Budapest Tagesausflug',
    dt_prague: 'Prag Tagesausflug',
    dt_bratislava: 'Bratislava Tagesausflug',
    dt_wachau: 'Wachau Tagesausflug',
    dt_custom: 'Individuelle Tagesausflüge',

    // Hero & Booking
    hero_eyebrow: 'ÖSTERREICHISCHE LIMOUSINEN- & CHAUFFEUR-EXZELLENZ',
    hero_title: 'Wo Wiener imperiale Pracht auf erstklassigen Chauffeurservice trifft.',
    hero_desc: 'Maßgeschneiderte Flughafentransfers, exklusive Chauffeurdienste und private Panoramatouren durch Mitteleuropa in makellosen Mercedes-Benz Fahrzeugen.',
    hero_hl_pricing: 'Garantierte Festpreise',
    hero_hl_flight: 'Flugüberwachung & Abholung',
    hero_hl_concierge: 'Direkter WhatsApp-Concierge',

    // Booking Tabs
    tab_airport: 'Flughafentransfer',
    tab_daytrip: 'Privater Tagesausflug',
    tab_hourly: 'Stundenweiser Chauffeur',

    // Form labels
    lbl_pickup: 'Abholort',
    lbl_dropoff: 'Zielort',
    lbl_date: 'Datum',
    lbl_time: 'Abholzeit',
    lbl_passengers: 'Passagiere',
    lbl_vehicle: 'Bevorzugtes Fahrzeug',
    lbl_flight: 'Flugnummer (Optional)',
    lbl_hours: 'Dauer (Stunden)',
    lbl_destination: 'Reiseziel wählen',
    btn_get_quote: 'SOFORTIGES WHATSAPP-ANGEBOT',
    btn_calculating: 'Route wird vorbereitet...',
    view_360_card: 'Klicken für 360°-Showroom & Fahrzeugdetails',
    explore_viewer: '360° Showroom Erkunden',
    view_details: 'Details & 360° ansehen',

    // Fleet Page
    fleet_hero_title: 'Unsere Luxusflotte',
    fleet_hero_desc: 'Reisen Sie in unübertroffenem Komfort mit unseren erstklassigen Mercedes-Benz Fahrzeugen. Erleben Sie deutsche Ingenieurskunst und diskreten Luxus.',
    fleet_hl_1: 'Premium Mercedes-Benz Flotte',
    fleet_hl_2: 'Professionelle Chauffeure',
    fleet_hl_3: 'Für Jede Reise',
    fleet_explore_heading: 'Entdecken Sie Unsere Gesamte Flotte',
    fleet_explore_sub: 'Von eleganten Business-Limousinen bis zu geräumigen VIP-Vans haben wir das ideale Fahrzeug für jede Fahrt.',
    fleet_on_request: 'Auf Anfrage',
    fleet_request_btn: 'Dieses Fahrzeug Anfragen',
    fleet_view_features_btn: 'Alle Merkmale Anzeigen',
    fleet_custom_cta_title: 'Benötigen Sie eine Individuelle Flottenlösung?',
    fleet_custom_cta_desc: 'Von Großveranstaltungen bis zu besonderen Sicherheitsanforderungen – kontaktieren Sie uns für ein persönliches Reisearrangement.',
    fleet_contact_team: 'Team Kontaktieren →',
    fleet_faq_title: 'Häufig Gestellte Fragen',
    fleet_faq_sub: 'Alles Wissenswerte über unsere Mercedes-Benz Flotte und Buchungsrichtlinien.',
    specs_passengers: 'Passagiere',
    specs_luggage: 'Gepäckstücke',
    specs_transmission: 'Fahrwerk',

    // Google Reviews
    reviews_heading: 'Unsere Gäste, Unsere Beste Empfehlung',
    reviews_desc: 'Erfahren Sie, was unsere geschätzten Gäste über ihre Chauffeur-Erlebnisse berichten.',
    reviews_rating_badge: '5.0 / 5.0 Bewertung (150+ Verifizierte Rezensionen)',
    reviews_read_all: 'Alle Google-Bewertungen Lesen',
    reviews_write: 'Bewertung Schreiben',
    reviews_verified: 'Google Verifiziert',

    // Footer
    footer_quick_links: 'Schnellzugriff',
    footer_services: 'Dienstleistungen',
    footer_contact: 'Kontakt & Disposition',
    footer_247: '24 Stunden / 7 Tage die Woche',
    footer_read_reviews: 'Google Bewertungen ansehen ↗',
    footer_rights: 'Alle Rechte vorbehalten. GISA: 9110025257769. Mitglied der WKO.',
  },
  fr: {
    // Nav
    nav_home: 'Accueil',
    nav_services: 'Nos Services',
    nav_daytrips: 'Excursions',
    nav_fleet: 'Flotte de Luxe',
    nav_about: 'À Propos',
    nav_book_now: 'RÉSERVER',
    nav_airport_transfer: 'Transferts Aéroport',
    nav_hourly_chauffeur: 'Chauffeur à l’Heure',
    nav_private_transfers: 'Transferts Privés',
    nav_b2b_solutions: 'Solutions B2B',
    nav_tours_pricing: 'Circuits & Tarifs',
    nav_blog: 'Blog',
    nav_contact: 'Contactez-Nous',

    // Day Trips
    dt_hallstatt: 'Excursion à Hallstatt',
    dt_salzburg: 'Excursion à Salzbourg',
    dt_budapest: 'Excursion à Budapest',
    dt_prague: 'Excursion à Prague',
    dt_bratislava: 'Excursion à Bratislava',
    dt_wachau: 'Excursion Vallée de la Wachau',
    dt_custom: 'Excursions Sur Mesure',

    // Hero & Booking
    hero_eyebrow: 'EXCELLENCE DU CHAUFFEUR PRIVÉ AUTRICHIEN',
    hero_title: 'Où la Grandeur Impériale Viennoise Rencontre l’Excellence du Chauffeur.',
    hero_desc: 'Transferts aéroport sur mesure, services exécutifs avec chauffeur et excursions panoramiques en Europe centrale dans des Mercedes-Benz d’exception.',
    hero_hl_pricing: 'Tarifs Fixes Tout Compris',
    hero_hl_flight: 'Suivi de Vol & Accueil Personnalisé',
    hero_hl_concierge: 'Service Concierge WhatsApp Direct',

    // Booking Tabs
    tab_airport: 'Transfert Aéroport',
    tab_daytrip: 'Excursion Privée',
    tab_hourly: 'Chauffeur à l’Heure',

    // Form labels
    lbl_pickup: 'Lieu de Prise en Charge',
    lbl_dropoff: 'Lieu de Dépose',
    lbl_date: 'Date',
    lbl_time: 'Heure de Prise en Charge',
    lbl_passengers: 'Passagers',
    lbl_vehicle: 'Véhicule Préféré',
    lbl_flight: 'Numéro de Vol (Optionnel)',
    lbl_hours: 'Durée (Heures)',
    lbl_destination: 'Choisir la Destination',
    btn_get_quote: 'DEVIS INSTANTANÉ SUR WHATSAPP',
    btn_calculating: 'Préparation de l’itinéraire...',
    view_360_card: 'Cliquez pour ouvrir la vue 360° et les caractéristiques',
    explore_viewer: 'Explorer en 360°',
    view_details: 'Voir Détails & 360°',

    // Fleet Page
    fleet_hero_title: 'Notre Flotte de Luxe',
    fleet_hero_desc: 'Voyagez dans un confort inégalé à bord de nos Mercedes-Benz haut de gamme. Vivez une expérience de transport d’exception.',
    fleet_hl_1: 'Flotte Mercedes-Benz d’Élite',
    fleet_hl_2: 'Chauffeurs Professionnels',
    fleet_hl_3: 'Pour Chaque Trajet',
    fleet_explore_heading: 'Découvrez Toute Notre Flotte',
    fleet_explore_sub: 'Des berlines exécutives aux vans VIP spacieux, nous avons le véhicule parfait pour chaque déplacement.',
    fleet_on_request: 'Sur Demande',
    fleet_request_btn: 'Demander ce Véhicule',
    fleet_view_features_btn: 'Voir Toutes les Caractéristiques',
    fleet_custom_cta_title: 'Besoin d’une Solution de Flotte Personnalisée ?',
    fleet_custom_cta_desc: 'Pour des événements diplomatiques ou des demandes uniques, contactez notre équipe pour un itinéraire personnalisé.',
    fleet_contact_team: 'Contacter Notre Équipe →',
    fleet_faq_title: 'Foire Aux Questions',
    fleet_faq_sub: 'Tout ce que vous devez savoir sur notre flotte Mercedes-Benz et nos conditions de réservation.',
    specs_passengers: 'Passagers',
    specs_luggage: 'Bagages',
    specs_transmission: 'Suspension',

    // Google Reviews
    reviews_heading: 'Nos Clients, Notre Meilleure Référence',
    reviews_desc: 'Découvrez les témoignages de nos passagers sur leurs expériences de chauffeur privé.',
    reviews_rating_badge: 'Note 5.0 / 5.0 (+150 Avis Vérifiés)',
    reviews_read_all: 'Lire Tous les Avis Google',
    reviews_write: 'Laisser un Avis',
    reviews_verified: 'Vérifié par Google',

    // Footer
    footer_quick_links: 'Liens Rapides',
    footer_services: 'Services',
    footer_contact: 'Contact & Chauffeurs',
    footer_247: '24h/24 & 7j/7',
    footer_read_reviews: 'Consulter les Avis Google ↗',
    footer_rights: 'Tous droits réservés. GISA: 9110025257769. Membre de la WKO.',
  },
  it: {
    // Nav
    nav_home: 'Home',
    nav_services: 'I Nostri Servizi',
    nav_daytrips: 'Escursioni',
    nav_fleet: 'Flotta di Lusso',
    nav_about: 'Chi Siamo',
    nav_book_now: 'PRENOTA ORA',
    nav_airport_transfer: 'Transfer Aeroporto',
    nav_hourly_chauffeur: 'Chauffeur a Ore',
    nav_private_transfers: 'Transfer Privati',
    nav_b2b_solutions: 'Soluzioni B2B',
    nav_tours_pricing: 'Tour & Tariffe',
    nav_blog: 'Blog',
    nav_contact: 'Contattaci',

    // Day Trips
    dt_hallstatt: 'Tour di Hallstatt',
    dt_salzburg: 'Tour di Salisburgo',
    dt_budapest: 'Tour di Budapest',
    dt_prague: 'Tour di Praga',
    dt_bratislava: 'Tour di Bratislava',
    dt_wachau: 'Tour Valle di Wachau',
    dt_custom: 'Tour Personalizzati',

    // Hero & Booking
    hero_eyebrow: 'ECCELLENZA AUSTRIACA DI CHAUFFEUR E LIMOUSINE',
    hero_title: 'Dove la Grandezza Imperiale Viennese Incontra l’Eccellenza del Servizio.',
    hero_desc: 'Transfer aeroportuali su misura, noleggio con conducente esclusivo ed escursioni panoramiche in tutta l’Europa Centrale con Mercedes-Benz impeccabili.',
    hero_hl_pricing: 'Tariffe Fisse Tutto Incluso',
    hero_hl_flight: 'Monitoraggio Voli & Accoglienza VIP',
    hero_hl_concierge: 'Assistenza Diretta Concierge WhatsApp',

    // Booking Tabs
    tab_airport: 'Transfer Aeroporto',
    tab_daytrip: 'Escursione Privata',
    tab_hourly: 'Chauffeur a Ore',

    // Form labels
    lbl_pickup: 'Punto di Partenza',
    lbl_dropoff: 'Destinazione',
    lbl_date: 'Data',
    lbl_time: 'Orario di Ritiro',
    lbl_passengers: 'Passeggeri',
    lbl_vehicle: 'Veicolo Preferito',
    lbl_flight: 'Numero Volo (Opzionale)',
    lbl_hours: 'Durata (Ore)',
    lbl_destination: 'Seleziona Destinazione',
    btn_get_quote: 'PREVENTIVO IMMEDIATO SU WHATSAPP',
    btn_calculating: 'Preparazione itinerario...',
    view_360_card: 'Clicca per aprire la visuale 360° e i dettagli',
    explore_viewer: 'Esplora lo Showroom 360°',
    view_details: 'Dettagli & Vista 360°',

    // Fleet Page
    fleet_hero_title: 'La Nostra Flotta di Lusso',
    fleet_hero_desc: 'Viaggia in un comfort senza eguali a bordo dei nostri prestigiosi veicoli Mercedes-Benz. Lusso e riservatezza per ogni percorso.',
    fleet_hl_1: 'Flotta Esclusiva Mercedes-Benz',
    fleet_hl_2: 'Chauffeur Professionisti',
    fleet_hl_3: 'Per Ogni Viaggio',
    fleet_explore_heading: 'Esplora Tutta la Nostra Flotta',
    fleet_explore_sub: 'Dalle berline presidenziali ai van VIP spaziosi, abbiamo il veicolo ideale per ogni tua esigenza.',
    fleet_on_request: 'Su Richiesta',
    fleet_request_btn: 'Richiedi Questo Veicolo',
    fleet_view_features_btn: 'Visualizza Tutte le Caratteristiche',
    fleet_custom_cta_title: 'Hai Bisogno di una Soluzione Personalizzata?',
    fleet_custom_cta_desc: 'Per eventi di rappresentanza o itinerari su misura, contatta il nostro team per un servizio dedicato.',
    fleet_contact_team: 'Contatta il Nostro Team →',
    fleet_faq_title: 'Domande Frequenti',
    fleet_faq_sub: 'Tutto quello che c’è da sapere sulla nostra flotta Mercedes-Benz e sui servizi di noleggio con conducente.',
    specs_passengers: 'Passeggeri',
    specs_luggage: 'Bagagli',
    specs_transmission: 'Sospensioni',

    // Google Reviews
    reviews_heading: 'I Nostri Ospiti, La Nostra Migliore Garanzia',
    reviews_desc: 'Scopri le opinioni dei nostri ospiti sulle loro esperienze con autista privato.',
    reviews_rating_badge: 'Valutazione 5.0 / 5.0 (Oltre 150 Recensioni Verificate)',
    reviews_read_all: 'Leggi Tutte le Recensioni Google',
    reviews_write: 'Scrivi una Recensione',
    reviews_verified: 'Verificato da Google',

    // Footer
    footer_quick_links: 'Link Rapidi',
    footer_services: 'Servizi',
    footer_contact: 'Contatti & Servizio Chauffeur',
    footer_247: '24 Ore su 24 / 7 Giorni su 7',
    footer_read_reviews: 'Visualizza Recensioni Google ↗',
    footer_rights: 'Tutti i diritti riservati. GISA: 9110025257769. Membro della WKO.',
  },
  es: {
    // Nav
    nav_home: 'Inicio',
    nav_services: 'Nuestros Servicios',
    nav_daytrips: 'Excursiones',
    nav_fleet: 'Flota de Lujo',
    nav_about: 'Sobre Nosotros',
    nav_book_now: 'RESERVAR',
    nav_airport_transfer: 'Traslados al Aeropuerto',
    nav_hourly_chauffeur: 'Chófer por Horas',
    nav_private_transfers: 'Traslados Privados',
    nav_b2b_solutions: 'Soluciones B2B',
    nav_tours_pricing: 'Tours & Precios',
    nav_blog: 'Blog',
    nav_contact: 'Contacto',

    // Day Trips
    dt_hallstatt: 'Excursión a Hallstatt',
    dt_salzburg: 'Excursión a Salzburgo',
    dt_budapest: 'Excursión a Budapest',
    dt_prague: 'Excursión a Praga',
    dt_bratislava: 'Excursión a Bratislava',
    dt_wachau: 'Excursión al Valle de Wachau',
    dt_custom: 'Excursiones Personalizadas',

    // Hero & Booking
    hero_eyebrow: 'EXCELENCIA EN CHÓFER PRIVADO Y LIMUSINAS DE AUSTRIA',
    hero_title: 'Donde la Grandeza Imperial de Viena se Une a la Excelencia del Chófer.',
    hero_desc: 'Traslados privados al aeropuerto, servicio ejecutivo por horas y excursiones panorámicas por Europa Central en impecables vehículos Mercedes-Benz.',
    hero_hl_pricing: 'Precios Fijos con Todo Incluido',
    hero_hl_flight: 'Monitoreo de Vuelos y Bienvenida VIP',
    hero_hl_concierge: 'Conserjería Directa por WhatsApp',

    // Booking Tabs
    tab_airport: 'Traslado al Aeropuerto',
    tab_daytrip: 'Excursión Privada',
    tab_hourly: 'Chófer por Horas',

    // Form labels
    lbl_pickup: 'Lugar de Recogida',
    lbl_dropoff: 'Lugar de Destino',
    lbl_date: 'Fecha',
    lbl_time: 'Hora de Recogida',
    lbl_passengers: 'Pasajeros',
    lbl_vehicle: 'Vehículo Preferido',
    lbl_flight: 'Número de Vuelo (Opcional)',
    lbl_hours: 'Duración (Horas)',
    lbl_destination: 'Seleccionar Destino',
    btn_get_quote: 'OBTENER COTIZACIÓN INMEDIATA POR WHATSAPP',
    btn_calculating: 'Preparando itinerario...',
    view_360_card: 'Haz clic para abrir el visor 360° y especificaciones',
    explore_viewer: 'Explorar Showroom 360°',
    view_details: 'Ver Detalles y 360°',

    // Fleet Page
    fleet_hero_title: 'Nuestra Flota de Lujo',
    fleet_hero_desc: 'Viaje con un confort insuperable a bordo de nuestros vehículos Mercedes-Benz de alta gama. Lujo y privacidad en cada trayecto.',
    fleet_hl_1: 'Flota Exclusiva Mercedes-Benz',
    fleet_hl_2: 'Chóferes Profesionales',
    fleet_hl_3: 'Para Cada Viaje',
    fleet_explore_heading: 'Explore Nuestra Flota Completa',
    fleet_explore_sub: 'Desde elegantes berlinas ejecutivas hasta amplias furgonetas VIP, disponemos del vehículo perfecto para cada itinerario.',
    fleet_on_request: 'Bajo Solicitud',
    fleet_request_btn: 'Solicitar Este Vehículo',
    fleet_view_features_btn: 'Ver Todas las Características',
    fleet_custom_cta_title: '¿Necesita una Solución de Flota a Medida?',
    fleet_custom_cta_desc: 'Para delegaciones especiales o eventos corporativos, contacte con nuestro equipo para una organización personalizada.',
    fleet_contact_team: 'Contactar al Equipo →',
    fleet_faq_title: 'Preguntas Frecuentes',
    fleet_faq_sub: 'Todo lo que necesita saber sobre nuestra flota Mercedes-Benz y las condiciones de reserva.',
    specs_passengers: 'Pasajeros',
    specs_luggage: 'Equipaje',
    specs_transmission: 'Suspensión',

    // Google Reviews
    reviews_heading: 'Nuestros Clientes, Nuestra Mayor Recomendación',
    reviews_desc: 'Descubra las experiencias de nuestros clientes con nuestros servicios de chófer privado.',
    reviews_rating_badge: 'Valoración 5.0 / 5.0 (+150 Reseñas Verificadas)',
    reviews_read_all: 'Leer Todas las Reseñas de Google',
    reviews_write: 'Escribir una Reseña',
    reviews_verified: 'Verificado por Google',

    // Footer
    footer_quick_links: 'Enlaces Rápidos',
    footer_services: 'Servicios',
    footer_contact: 'Contacto y Operaciones',
    footer_247: '24 Horas / 7 Días a la Semana',
    footer_read_reviews: 'Ver Reseñas en Google ↗',
    footer_rights: 'Todos los derechos reservados. GISA: 9110025257769. Miembro de la WKO.',
  },
  'zh-CN': {
    // Nav
    nav_home: '首页',
    nav_services: '尊享服务',
    nav_daytrips: '一日游行程',
    nav_fleet: '豪华车队',
    nav_about: '关于我们',
    nav_book_now: '立即预订',
    nav_airport_transfer: '机场专车接送',
    nav_hourly_chauffeur: '包车时租服务',
    nav_private_transfers: '私人专车接送',
    nav_b2b_solutions: '企业B2B方案',
    nav_tours_pricing: '路线与价格',
    nav_blog: '旅行博客',
    nav_contact: '联系我们',

    // Day Trips
    dt_hallstatt: '哈尔施塔特一日游',
    dt_salzburg: '萨尔茨堡一日游',
    dt_budapest: '布达佩斯一日游',
    dt_prague: '布拉格一日游',
    dt_bratislava: '布拉迪斯拉发一日游',
    dt_wachau: '瓦豪河谷一日游',
    dt_custom: '定制全景一日游',

    // Hero & Booking
    hero_eyebrow: '奥地利皇室级专车与私人定制礼宾',
    hero_title: '维也纳帝国底蕴与梅赛德斯尊尚司机的完美交汇。',
    hero_desc: '提供专享机场接送、行政商务专车及穿越中欧的私人全景一日游，全系配备高规格梅赛德斯-奔驰座驾。',
    hero_hl_pricing: '全包透明定价 无隐形消费',
    hero_hl_flight: '实时航班追踪与航站楼举牌迎宾',
    hero_hl_concierge: '24小时WhatsApp中文礼宾调度',

    // Booking Tabs
    tab_airport: '机场接送',
    tab_daytrip: '私人一日游',
    tab_hourly: '时租包车',

    // Form labels
    lbl_pickup: '出发地点',
    lbl_dropoff: '到达地点',
    lbl_date: '出发日期',
    lbl_time: '出发时间',
    lbl_passengers: '乘客人数',
    lbl_vehicle: '优选车型',
    lbl_flight: '航班号（选填）',
    lbl_hours: '包车时长（小时）',
    lbl_destination: '选择一日游目的地',
    btn_get_quote: '获取WhatsApp即时报价',
    btn_calculating: '行程路线核算中...',
    view_360_card: '点击开启360°展厅旋转与车型参数',
    explore_viewer: '开启360°展厅',
    view_details: '查看规格与360°',

    // Fleet Page
    fleet_hero_title: '尊享豪华车队',
    fleet_hero_desc: '乘座顶级梅赛德斯-奔驰座驾，畅享极致平稳与尊贵。在每一段欧洲旅途中感受德系精密工艺与无与伦比的优雅。',
    fleet_hl_1: '全系梅赛德斯-奔驰车队',
    fleet_hl_2: '专业持牌资深礼宾司机',
    fleet_hl_3: '满足各类尊贵出行需求',
    fleet_explore_heading: '探索我们的完整豪华车队',
    fleet_explore_sub: '从旗舰行政级轿车到奢华VIP多功能商务车，为您的每一次出行量身定制。',
    fleet_on_request: '需提前预约',
    fleet_request_btn: '预约此款座驾',
    fleet_view_features_btn: '查看全部奢华配置',
    fleet_custom_cta_title: '需要专属定制车队出行方案？',
    fleet_custom_cta_desc: '无论是国事访问、大型商务会议还是特殊安保出行，我们均可为您提供私密定制调度。',
    fleet_contact_team: '联系礼宾团队 →',
    fleet_faq_title: '常见问题解答',
    fleet_faq_sub: '关于我们的梅赛德斯-奔驰车队、预订流程及服务保障的全面说明。',
    specs_passengers: '尊贵乘客',
    specs_luggage: '标准行李',
    specs_transmission: '悬挂系统',

    // Google Reviews
    reviews_heading: '宾客赞誉，卓越见证',
    reviews_desc: '聆听来自全球尊贵宾客对我们维也纳专车服务的真实体验反馈。',
    reviews_rating_badge: '5.0 / 5.0 卓越评分（150+ 谷歌认证真实好评）',
    reviews_read_all: '查阅所有谷歌评价',
    reviews_write: '撰写谷歌评价',
    reviews_verified: '谷歌认证好评',

    // Footer
    footer_quick_links: '快速导航',
    footer_services: '核心服务',
    footer_contact: '联系与调度',
    footer_247: '全天候 24小时 / 7天 无休',
    footer_read_reviews: '查阅谷歌评价 ↗',
    footer_rights: '版权所有 © 2026 Vienna Day Trip。商业登记号 GISA: 9110025257769。奥地利商会(WKO)认证会员。',
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  languages: LANGUAGES,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('vdt_lang');
      if (saved && translations[saved]) {
        return saved;
      }
    } catch (e) {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem('vdt_lang', langCode);
      } catch (e) {
        // ignore
      }
    }
  };

  const t = (key) => {
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
