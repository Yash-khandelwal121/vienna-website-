export const siteConfig = {
  name: "VIENNA DAY TRIP",
  tagline: "Ultra-Luxury Chauffeur & Bespoke European Journeys",
  phone: "+43 664 2035445",
  phoneDisplay: "+43 664 2035445",
  email: "booking@viennadaytrip.com",
  address: "Lechnerstraße 2, 1030 Vienna, Austria",
  googleMapsUrl: "https://www.google.com/maps/place/Vienna+Day+Trip+%7C+Private+Chauffeur+%26+Limousines+%7C+Airport+Transfers/@48.1972001,16.4100588,17z/data=!4m8!3m7!1s0x8a448010b2701db5:0x8837fa7ac4dd2722!8m2!3d48.1983157!4d16.4075483!9m1!1b1!16s%2Fg%2F11zj40_mr5!18m1!1e1?entry=ttu",
  whatsappUrl: "https://api.whatsapp.com/send/?phone=436642035445&text=Hello%21%20I%27m%20interested%20in%20your%20Vienna%20Limousine%20services.&type=phone_number&app_absent=0",
  socials: {
    facebook: "https://www.facebook.com/share/1GDCLKbEKY/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/viennadaytrip?igsh=MWhrY2M0MDF4NHhzaQ%3D%3D&utm_source=qr",
    tiktok: "https://www.tiktok.com/@viennadaytrip_?_r=1&_t=ZN-98MjF9kJBMk",
    linkedin: "https://www.linkedin.com/in/vienna-day-trip-vdt-0b8890437/",
    tripadvisor: "https://www.tripadvisor.com/Profile/viennadaytripp",
    trustpilot: "https://www.trustpilot.com/review/viennadaytrip.com",
    yelp: "https://biz.yelp.com/home/b9b7q2QEDd5ZeTpWDYPhoQ/?fwp=true",
    reddit: "https://www.reddit.com/user/viennadaytrips/"
  },
  stats: [
    { value: "7+", label: "Years of Excellence", icon: "Award" },
    { value: "150+", label: "5-Star Reviews", icon: "Star" },
    { value: "24/7", label: "Concierge & Dispatch", icon: "Clock" },
    { value: "99%", label: "Satisfaction Rate", icon: "ShieldCheck" }
  ],
  trustHighlights: [
    { title: "Professional Chauffeurs", desc: "Background-checked, English & German speaking hospitality professionals.", icon: "UserCheck" },
    { title: "Premium Mercedes Fleet", desc: "Pristine E-Class, S-Class, V-Class, and VIP Sprinter transport.", icon: "Car" },
    { title: "Flexible Private Journeys", desc: "Bespoke European itineraries with zero rigid schedules or rush.", icon: "Compass" },
    { title: "24/7 Availability", desc: "Round-the-clock VIP dispatch, flight tracking, and immediate support.", icon: "Clock" }
  ]
};

export const navLinks = [
  { label: "Home", href: "/", tKey: "nav_home" },
  {
    label: "Our Services",
    href: "/our-services/",
    tKey: "nav_services",
    dropdown: [
      { label: "Airport Transfers", href: "/airport-transfer-vienna/", tKey: "nav_airport_transfer" },
      { label: "Hourly Chauffeur", href: "/hourly-chauffeur-service/", tKey: "nav_hourly_chauffeur" },
      { label: "Private Transfers", href: "/our-services/", tKey: "nav_private_transfers" },
      { label: "B2B Solutions", href: "/b2b-solutions/", tKey: "nav_b2b_solutions" }
    ]
  },
  {
    label: "Day Trips",
    href: "/tour-pricing/",
    tKey: "nav_daytrips",
    dropdown: [
      { label: "Hallstatt Day Trip", href: "/hallstatt-day-trip-from-vienna/", tKey: "dt_hallstatt" },
      { label: "Salzburg Day Trip", href: "/salzburg-day-trip/", tKey: "dt_salzburg" },
      { label: "Budapest Day Trip", href: "/budapest-day-trip/", tKey: "dt_budapest" },
      { label: "Prague Day Trip", href: "/prague-day-trip/", tKey: "dt_prague" },
      { label: "Bratislava Day Trip", href: "/bratislava-day-trip/", tKey: "dt_bratislava" },
      { label: "Wachau Valley Trip", href: "/wachau-valley-trip/", tKey: "dt_wachau" },
      { label: "Customized Day Trips", href: "/customized-day-trips/", tKey: "dt_custom" }
    ]
  },
  { label: "Luxury Fleet", href: "/our-fleet/", tKey: "nav_fleet" },
  { label: "About Us", href: "/about-vienna-day-trip/", tKey: "nav_about" }
];

export const reviews = [
  {
    name: "Gavin",
    source: "Google Verified Review",
    rating: 5,
    text: "We had a wonderful multi-day trip with them from Vienna, visiting some of the most beautiful places in Austria, including St. Wolfgangsee, Salzburg, Mondsee, Hallstatt, Dachstein, and Krippenstein. Everything was organized smoothly, and we were able to enjoy each destination without feeling rushed. We truly appreciated their professionalism, friendliness, and attention to detail."
  },
  {
    name: "Palwinderjit Singh",
    source: "Google Verified Review",
    rating: 5,
    text: "Wir waren mit dem Service von Vienna Day Trip wirklich begeistert. Der Fahrer war pünktlich, ausgesprochen freundlich und äußerst professionell. Das Mercedes-Fahrzeug war makellos sauber, komfortabel und luxuriös. Die gesamte Fahrt verlief angenehm, entspannt und reibungslos."
  },
  {
    name: "Zainab Saqer",
    source: "Google Verified Review",
    rating: 5,
    text: "An excellent trip with a very comfortable ride. The driver suggested several places that made our journey easier and guided us to many wonderful spots that were not originally part of our plan. Their prices were also very reasonable compared to others. Highly recommended!"
  },
  {
    name: "Camilla Monti",
    source: "Google Verified Review",
    rating: 5,
    text: "Un’ottima esperienza! Servizio consigliatissimo! Puntualità impeccabile e comfort straordinario durante tutto il viaggio."
  },
  {
    name: "Santosh Ranabhat",
    source: "Google Verified Review",
    rating: 5,
    text: "Harmeet singh cheema is the very friendly guy. We enjoyed our trip with him like our best friend. Very kind hearted and knowledgeable. Amazing trip with him across Austria!"
  },
  {
    name: "chani Gutfreund",
    source: "Google Verified Review",
    rating: 5,
    text: "היה שירות יוצא מן הכלל!!!! הנהג היה מאד אדיב ועשה כל מה שרצינו ממנו. הוא עזר לנו והביא אותנו למקומות יפים. ממליצה מאדדד!!!!"
  },
  {
    name: "sara picó",
    source: "Google Verified Review",
    rating: 5,
    text: "Increíble el conductor una maravilla encantador y profesional, atento y servicial me ha encantado, un 10 total."
  },
  {
    name: "Gurj Singh",
    source: "Google Verified Review",
    rating: 5,
    text: "Fantastic and smooth and punctual. Harmeet was the best chauffeur we could have asked for in Vienna."
  }
];

export const marqueeItems = [
  { label: "MERCEDES-BENZ FLEET", href: "/our-fleet/" },
  { label: "VIENNA AIRPORT TRANSFERS", href: "/airport-transfer-vienna/" },
  { label: "BESPOKE EUROPEAN DAY TRIPS", href: "/private-day-trips/" },
  { label: "HOURLY CHAUFFEUR HIRE", href: "/hourly-chauffeur-service/" },
  { label: "DIPLOMATIC & EMBASSY SERVICES", href: "/secure-transportation/" },
  { label: "HALLSTATT • SALZBURG • BUDAPEST • PRAGUE", href: "/private-day-trips/" },
  { label: "24/7 CONCIERGE DISPATCH", href: "/contact-us-i/" }
];
