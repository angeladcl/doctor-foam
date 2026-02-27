"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── Bubble Cluster Logo — Static SVG ─── */
function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: "2.6rem", width: "2.6rem", flexShrink: 0 }}
        aria-label="Doctor Foam"
        role="img"
      >
        <defs>
          <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Main bubble */}
        <circle cx="40" cy="45" r="26" fill="url(#lg)" opacity="0.08" />
        <circle cx="40" cy="45" r="26" fill="none" stroke="url(#lg)" strokeWidth="2" />

        {/* Medium bubble — top right */}
        <circle cx="76" cy="30" r="14" fill="url(#lg)" opacity="0.06" />
        <circle cx="76" cy="30" r="14" fill="none" stroke="url(#lg)" strokeWidth="1.5" opacity="0.75" />

        {/* Small bubble — bottom right */}
        <circle cx="78" cy="68" r="9" fill="url(#lg)" opacity="0.12" />

        {/* Tiny bubble — top left */}
        <circle cx="20" cy="18" r="6" fill="url(#lg)" opacity="0.1" />
      </svg>

      {/* Wordmark */}
      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
        <span style={{ color: "#ffffff", WebkitTextStroke: "1.5px #2563eb", paintOrder: "stroke fill" }}>DOCTOR</span>{" "}
        <span className="gradient-text">FOAM</span>
      </span>
    </span>
  );
}

/* ─── Chat Icon ─── */
function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" />
    </svg>
  );
}

/* ─── Main Service Packages ─── */
const mainServices = [
  {
    icon: "♨️",
    title: "Industrial Deep Interior",
    tagline: "Restauración interior de grado profesional",
    desc: "Tu interior absorbe todo: polvo, bacterias, ácaros, derrames invisibles. Nuestro vapor seco industrial a 180°C penetra cada fibra del tapizado y elimina lo que una aspiradora jamás alcanza. Usamos inyección-extracción de grado hospitalario para remover manchas profundas, olores atrapados y alérgenos. Las pieles Connolly reciben hidratación especializada para evitar grietas. Al terminar, sanitizamos con ozono médico — tu cabina queda clínicamente limpia, no solo bonita.",
    highlights: ["Vapor seco 180°C", "Extracción profunda", "Sanitización con ozono", "Pieles hidratadas"],
    image: "/services/deep-interior.jpg",
    bookingId: "deep-interior",
  },
  {
    icon: "💎",
    title: "Signature Detail",
    tagline: "Corrección de pintura + interior completo",
    desc: "Los micro-rayones (swirls) hacen que tu pintura luzca opaca bajo el sol. Nuestros técnicos certificados IDA corrigen la pintura en 2-3 etapas con pulidoras de triple acción, eliminando hasta el 95% de imperfecciones. El resultado es un brillo de espejo que transforma la apariencia de tu vehículo. Incluye el Industrial Deep Interior completo, sellador cerámico express de 6 meses y acondicionamiento de rines y llantas. Todo en un solo día, sin mover tu auto.",
    highlights: ["Corrección 2-3 etapas", "Swirls eliminados 95%", "Interior completo incluido", "Sellador 6 meses"],
    image: "/services/signature-detail.jpg",
    bookingId: "signature-detail",
  },
  {
    icon: "🛡️",
    title: "Ceramic Coating",
    tagline: "Protección de nueva generación",
    desc: "La pintura de tu auto enfrenta lluvia ácida, rayos UV, contaminantes industriales y excrementos de aves — todos degradan el clear coat silenciosamente. Nuestro recubrimiento cerámico profesional crea un escudo invisible de dureza 9H que repele agua, suciedad y químicos durante 3 a 5 años. Incluye preparación completa de superficie y certificado Doctor Foam. ¿Quieres más? El upgrade Graphene Shield ofrece 5-7 años de protección con dureza 10H y efecto hidrofóbico superior.",
    highlights: ["Protección 3-5 años", "Dureza 9H", "Certificado incluido", "Upgrade Graphene disponible"],
    image: "/services/ceramic-coating.jpg",
    bookingId: "ceramic-coating",
  },
];

/* ─── Foam Maintenance (Post-Service) ─── */
const foamMaintenance = {
  icon: "🧽",
  title: "Foam Maintenance",
  desc: "Servicio de mantenimiento posterior a tu primer paquete. Lavado con foam cannon industrial, descontaminación química, barra de arcilla y sellador UV. El estándar Doctor Foam para preservar tu inversión.",
  price: "Desde $1,800 MXN",
  bookingId: "foam-maintenance",
  note: "Recomendación: 1 a 2 veces al mes.",
};

/* ─── Membership ─── */
const membership = {
  icon: "🔄",
  title: "Membresía Doctor Foam",
  price: "$1,160",
  priceLabel: "MXN / mes",
  features: [
    "Foam Maintenance bimestral incluido",
    "10% de descuento en cualquier paquete",
    "Membresía por cliente, no importa el vehículo",
  ],
  bookingId: "membresia",
};

/* ─── Vehicle Size Coefficients ─── */
const vehicleSizes = [
  { label: "Sedán / SUV 2 filas", coeff: 1.0 },
  { label: "Pick Up / SUV 3 filas", coeff: 1.15 },
];

/* ─── Pricing Packages ─── */
const packages = [
  {
    name: "Industrial Deep Interior",
    price: "$2,499",
    priceLabel: "Sedán / SUV 2 filas",
    subtitle: "Limpieza interior profesional",
    prices: { sedan: "$2,499", pickup: "$2,874" },
    features: [
      "Vapor seco industrial a 180°C",
      "Aspirado de alta potencia",
      "Lavado a base de inyección y extracción",
      "Extracción profunda de manchas",
      "Hidratación de pieles Connolly",
      "Sanitización con ozono",
    ],
    featured: false,
  },
  {
    name: "Signature Detail",
    price: "$7,449",
    priceLabel: "Sedán / SUV 2 filas",
    subtitle: "El más popular",
    prices: { sedan: "$7,449", pickup: "$8,566" },
    features: [
      "Incluye Industrial Deep Interior completo",
      "Corrección de pintura en 2-3 etapas",
      "Eliminación de swirls al 95%",
      "Sellador cerámico express (6 meses)",
      "Limpieza de vidrios y rines",
      "Acondicionamiento de llantas",
      "Técnicos certificados IDA",
    ],
    featured: true,
  },
  {
    name: "Ceramic Coating",
    price: "$11,999",
    priceLabel: "Sedán / SUV 2 filas",
    subtitle: "Protección de nueva generación",
    prices: { sedan: "$11,999", pickup: "$13,799" },
    features: [
      "Recubrimiento cerámico (3-5 años)",
      "Protección UV, lluvia ácida y contaminantes",
      "Cerámico en vidrios y rines",
      "Certificado de protección Doctor Foam",
      "Seguimiento post-servicio 30 días",
    ],
    upgrade: {
      name: "Graphene Shield",
      price: "$14,999",
      pickupPrice: "$17,249",
      desc: "Supera al cerámico en dureza e hidrofobicidad. Protección de 5 a 7 años.",
    },
    featured: false,
  },
];

/* ─── Zones ─── */
const zones = [
  { name: "Bosque Real", tag: "Máximo Potencial", tagClass: "zone-tag-gold", desc: "Torres de ultra-lujo, SUVs exóticos, eléctricos de alta gama" },
  { name: "Polanco", tag: "Ultra Premium", tagClass: "zone-tag-gold", desc: "Campos Elíseos, Masaryk — Sedanes europeos, super-deportivos" },
  { name: "Zona Esmeralda", tag: "Alto Potencial", tagClass: "zone-tag-gold", desc: "Condado de Sayavedra, Chiluca — SUVs familiares de lujo, blindados" },
  { name: "Santa Fe", tag: "Premium", tagClass: "zone-tag-blue", desc: "Corporativos y lofts — Ejecutivos, Tesla, Audi e-tron" },
  { name: "Lomas de Chapultepec", tag: "Ultra Premium", tagClass: "zone-tag-gold", desc: "Virreyes, Barrilaco — SUVs de lujo, vehículos blindados" },
  { name: "Pedregal", tag: "Premium", tagClass: "zone-tag-blue", desc: "San Ángel — Autos clásicos, colección, preservación" },
  { name: "Interlomas", tag: "Premium", tagClass: "zone-tag-blue", desc: "Bosque Real, Hacienda Palmas — BMW, Mercedes, Land Rover" },
  { name: "Metepec", tag: "Nuevo", tagClass: "zone-tag-blue", desc: "Zona ejecutiva Toluca — Mercado desatendido, alto potencial" },
];

/* ─── Process Steps ─── */
const processSteps = [
  { num: 1, title: "Elige y paga en línea", desc: "Selecciona tu paquete, completa tus datos y realiza el pago seguro en línea." },
  { num: 2, title: "Te contactamos", desc: "Un asesor se comunica contigo por nuestro chat interno para agendar día y hora." },
  { num: 3, title: "Detallado premium", desc: "Llegamos a tu domicilio con equipo industrial y químicos profesionales." },
  { num: 4, title: "Entrega perfecta", desc: "Revisión final juntos. Garantía de satisfacción 100%. Factura incluida." },
];

/* ─── Verified Google Reviews ─── */
const googleReviews = [
  {
    stars: 5,
    text: "Compré mi carro de un mecánico hace un par de meses, y el interior era un desastre... El interior de mi coche luce como totalmente nuevo, limpio y no parece haber tenido una sola mancha jamás! Totalmente satisfecho! 💙🙌🏽",
    author: "Mario Hernandez",
    date: "Hace un año",
  },
  {
    stars: 5,
    text: "Excelente trabajo, quedó como nuevo mi coche!! Si buscan de buen trabajo, 100% recomendado. Quedamos encantados por el resultado🙌 Precio justo y con servicio a domicilio, muy amable!",
    author: "Shl Mjv",
    date: "Hace un año",
  },
  {
    stars: 5,
    text: "Quedo como nuevo mi camioneta😀 la verdad nunca pensé que me quedara súper limpia. Muy profesional totalmente recomendado…",
    author: "MA Masonry LLC",
    date: "Hace 2 años",
  },
  {
    stars: 5,
    text: "Profesional y buena comunicación. Muy bien trabajo, quedó como nuevo mi carro 🙏🏽 Mil gracias",
    author: "Jossie Rivera",
    date: "Hace 3 años",
  },
  {
    stars: 5,
    text: "For 160 dollars I was praying it would be worth it... OMG!! MY CAR LOOKS BRAND NEW. No over exaggeration and it smells so amazing.",
    author: "Latoya Acolatse",
    date: "Hace 2 años",
  },
  {
    stars: 5,
    text: "Dr. Foam Mobile Carwash did an amazing job on my car. He is very professional and prompt... My car looks brand new on the inside.",
    author: "M C",
    date: "Hace 2 años",
  },
  {
    stars: 5,
    text: "Awesome job! Car looks brand new. I highly recommend. He did my car again a year later and did great job as always!",
    author: "Shavon Reid",
    date: "Hace 2 años",
  },
  {
    stars: 5,
    text: "Awesome job! Cleaned the interior of my car... He made the interior look new again. Customer service was on point!",
    author: "Kishia Kelly",
    date: "Hace 2 años",
  },
  {
    stars: 5,
    text: "Amazing work!!! After Dr Foam interior auto detail, the car was impressively cleaned and smelled like new.",
    author: "Shanelle Coleman",
    date: "Hace 3 años",
  },
  {
    stars: 5,
    text: "I was very impressed with the amount of time and effort Doctor Foam put into washing my car. It was absolutely spotless.",
    author: "todd samalin",
    date: "Hace un año",
  },
  {
    stars: 5,
    text: "Noe made my car look brand new inside and out. He has the best price and service in Atlanta!",
    author: "Ria Buford",
    date: "Hace un año",
  },
  {
    stars: 5,
    text: "By far, the best detailing job I've ever seen. They worked miracles with my dirty car. It's like new now!",
    author: "Timothy Foster",
    date: "Hace 3 años",
  },
  {
    stars: 5,
    text: "I am extremely happy with the services that were provided! This is the 2nd time using Dr Foam's services... I recommend Dr. Foam to everyone 😊",
    author: "Yaneli Ramos",
    date: "Hace 3 años",
  },
];
const googleOverallRating = 4.9;
const googleTotalReviews = 34;
/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "¿Qué diferencia a Doctor Foam de otros servicios de detallado?",
    a: "Utilizamos maquinaria industrial de grado hospitalario — generadores de vapor seco a 180°C, pulidoras de triple acción y compresores industriales — que llevamos hasta tu puerta. Nuestros técnicos cuentan con certificación IDA (International Detailing Association). No somos un lavado a domicilio: somos un centro de estética automotriz portátil.",
  },
  {
    q: "¿Por qué sus precios son más altos que otros servicios?",
    a: "Nuestros precios están 20-30% por encima del mercado porque usamos equipos y químicos de grado profesional importados, no comerciales. Un vehículo bien mantenido retiene 15-20% más de su valor de reventa. El costo de Doctor Foam no es un gasto: es una inversión en la preservación de un activo de alto valor.",
  },
  {
    q: "¿Cuánto tiempo toma el servicio?",
    a: "Foam Maintenance: 2-3 horas. Signature Detail: 5-6 horas. Graphene Shield: 8-10 horas. Todo se completa en un solo día sin mover tu auto. Nuestras unidades traen tanque de 400 litros, generador eléctrico y compresor propio.",
  },
  {
    q: "¿Necesito proporcionar agua o electricidad?",
    a: "No. Nuestras unidades móviles son completamente autónomas con tanque de agua, generador industrial y compresor. Además, nuestro proceso de vapor seco consume 45% menos agua que un lavado tradicional — contamos con certificación Sello ECO (equivalente ECO Green en México), ideal para condominios que restringen el uso de mangueras.",
  },
  {
    q: "¿Trabajan con vehículos blindados?",
    a: "Sí. Tenemos protocolos específicos para vehículos blindados usando químicos que no degradan los materiales balísticos ni el policarbonato de los vidrios. También atendemos autos exóticos (Ferrari, Lamborghini, McLaren), eléctricos (Tesla, Lucid, Rivian) y vehículos clásicos de colección.",
  },
  {
    q: "¿Qué es el Graphene Shield y cómo supera al cerámico?",
    a: "El recubrimiento de grafeno es la nueva generación de protección automotriz. Supera al cerámico tradicional en dureza (10H vs 9H), efecto hidrofóbico y resistencia a químicos. Dura 5 a 7 años vs 2-3 del cerámico convencional. Incluimos certificado de aplicación y seguimiento post-servicio.",
  },
];

/* ─── JSON-LD Schemas ─── */
function JsonLd() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: "Doctor Foam México",
    description:
      "Servicio de detallado automotriz premium a domicilio en CDMX y Valle de México",
    url: "https://doctorfoam.mx",
    telephone: "+52-55-0000-0000",
    areaServed: [
      { "@type": "City", name: "Ciudad de México" },
      { "@type": "AdministrativeArea", name: "Estado de México" },
    ],
    serviceType: [
      "Detallado automotriz",
      "Recubrimiento cerámico",
      "Corrección de pintura",
      "Lavado premium a domicilio",
    ],
    priceRange: "$$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Mobile Auto Detailing",
    provider: {
      "@type": "LocalBusiness",
      name: "Doctor Foam México",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 19.4326,
        longitude: -99.1332,
      },
      geoRadius: "50000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de Detallado",
      itemListElement: packages.map((p) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: `Paquete ${p.name}`,
          description: p.features.join(". "),
        },
        price: p.price.replace("$", "").replace(",", ""),
        priceCurrency: "MXN",
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════ */

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [grapheneUpgrade, setGrapheneUpgrade] = useState(false);

  /* Scroll listener for navbar */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Intersection Observer for scroll animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <JsonLd />

      {/* ─── NAVBAR ─── */}
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" aria-label="Doctor Foam inicio">
            <Logo />
          </Link>
          <ul className="nav-links">
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#precios">Precios</a></li>
            <li><a href="#cobertura">Cobertura</a></li>
            <li><a href="#proceso">Proceso</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><Link href="/blog">Blog</Link></li>
            <li>
              <Link href="/mi-cuenta" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "color 0.2s" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Mi Cuenta
              </Link>
            </li>
            <li>
              <Link href="/reservar" className="btn-premium" style={{ padding: "0.6rem 1.5rem", fontSize: "0.85rem" }}>
                Reservar y Pagar
              </Link>
            </li>
          </ul>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
          >
            {mobileMenuOpen ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "#0f172a", cursor: "pointer" }}
          aria-label="Cerrar menú"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <a href="#servicios" onClick={() => setMobileMenuOpen(false)}>Servicios</a>
        <a href="#precios" onClick={() => setMobileMenuOpen(false)}>Precios</a>
        <a href="#cobertura" onClick={() => setMobileMenuOpen(false)}>Cobertura</a>
        <a href="#proceso" onClick={() => setMobileMenuOpen(false)}>Proceso</a>
        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
        <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
        <Link href="/mi-cuenta" onClick={() => setMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Mi Cuenta
        </Link>
        <Link href="/reservar" className="btn-premium" onClick={() => setMobileMenuOpen(false)}>
          Reservar y Pagar
        </Link>
      </div>

      {/* ─── HERO ─── */}
      <section className="hero-section" id="inicio">
        <Image src="/hero-bg.png" alt="Doctor Foam Automotriz Premium" fill priority style={{ objectFit: 'cover', zIndex: 0 }} />
        <div className="hero-bg" style={{ zIndex: 1 }} />
        <div className="hero-glow hero-glow-gold" style={{ zIndex: 1 }} />
        <div className="hero-glow hero-glow-blue" style={{ zIndex: 1 }} />

        <div className="container" style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", color: "#93c5fd" }}>Detallado Automotriz Premium a Domicilio</span>
            <h1 className="section-title" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", marginBottom: "1.5rem", maxWidth: "900px", marginLeft: "auto", marginRight: "auto", color: "#ffffff" }}>
              Llevamos el <span className="gradient-text">taller perfecto</span> hasta la puerta de tu casa
            </h1>
            <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.85)", maxWidth: "700px", margin: "0 auto 2.5rem", lineHeight: "1.8" }}>
              Equipo industrial de grado profesional. Químicos especializados. Resultados iguales o superiores
              a cualquier taller de estética automotriz. Todo en un solo día, sin mover tu auto.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/reservar" className="btn-premium">
                Reservar y Pagar en Línea
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#proceso" className="btn-outline" style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)" }}>
                ¿Cómo funciona?
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row animate-on-scroll" style={{ marginTop: "4rem" }}>
            <div className="stat-item">
              <div className="stat-number gradient-text">500+</div>
              <div className="stat-label" style={{ color: "rgba(255,255,255,0.6)" }}>Vehículos atendidos</div>
            </div>
            <div className="stat-item">
              <div className="stat-number gradient-text">4.9★</div>
              <div className="stat-label" style={{ color: "rgba(255,255,255,0.6)" }}>Calificación promedio</div>
            </div>
            <div className="stat-item">
              <div className="stat-number gradient-text">100%</div>
              <div className="stat-label" style={{ color: "rgba(255,255,255,0.6)" }}>Equipo industrial</div>
            </div>
            <div className="stat-item">
              <div className="stat-number gradient-text">1 día</div>
              <div className="stat-label" style={{ color: "rgba(255,255,255,0.6)" }}>Servicio completo</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="section-padding" id="precios">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label">Paquetes y Precios</span>
            <h2 className="section-title">
              Elige tu nivel de <span className="gradient-text">perfección</span>
            </h2>
            <p className="section-subtitle">
              Todos los precios incluyen IVA y son facturables (CFDI). Precios base para Sedán / SUV de 2 filas.
              Pick Ups y SUV de 3 filas aplican coeficiente ×1.15. Paga en línea de forma segura.
            </p>
          </div>

          <div className="services-grid" style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {packages.map((p, i) => {
              const isGrapheneActive = p.upgrade && grapheneUpgrade;
              const displayPrice = isGrapheneActive ? p.upgrade!.price : p.price;
              const displayName = isGrapheneActive ? "Graphene Shield" : p.name;
              const displaySubtitle = isGrapheneActive ? "Protección superior de grafeno 5-7 años" : p.subtitle;
              const bookingSlug = isGrapheneActive ? "graphene-upgrade" : p.name.toLowerCase().replace(/ /g, '-');

              return (
                <div key={i} className={`glass-card price-card animate-on-scroll ${p.featured ? "featured" : ""}`}>
                  {p.featured && <span className="badge">Más Popular</span>}
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "0.25rem" }}>{p.name}</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{displaySubtitle}</p>
                  <div className="price-amount gradient-text" style={{ transition: "all 0.3s ease" }}>{displayPrice}</div>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{p.priceLabel} · IVA incluido</p>
                  <ul className="price-list">
                    {p.features.map((f, fi) => (
                      <li key={fi}>{f}</li>
                    ))}
                  </ul>
                  {p.upgrade && (
                    <button
                      onClick={() => setGrapheneUpgrade(!grapheneUpgrade)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        width: "100%",
                        padding: "0.85rem",
                        borderRadius: "0.75rem",
                        border: grapheneUpgrade ? "2px solid #2563eb" : "2px solid rgba(37,99,235,0.15)",
                        background: grapheneUpgrade ? "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(59,130,246,0.05))" : "rgba(37,99,235,0.03)",
                        cursor: "pointer",
                        marginBottom: "1rem",
                        textAlign: "left",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {/* Toggle switch */}
                      <div style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        background: grapheneUpgrade ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "#cbd5e1",
                        position: "relative",
                        flexShrink: 0,
                        transition: "background 0.3s ease",
                        boxShadow: grapheneUpgrade ? "0 0 12px rgba(37,99,235,0.3)" : "none",
                      }}>
                        <div style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#ffffff",
                          position: "absolute",
                          top: "3px",
                          left: grapheneUpgrade ? "23px" : "3px",
                          transition: "left 0.3s ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                      </div>
                      {/* Label */}
                      <div style={{ flex: 1 }}>
                        <p style={{ color: grapheneUpgrade ? "#2563eb" : "#475569", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.15rem", transition: "color 0.3s ease" }}>
                          ⬆️ Upgrade: {p.upgrade.name}
                        </p>
                        <p style={{ color: "#64748b", fontSize: "0.72rem", margin: 0, lineHeight: 1.4 }}>
                          {p.upgrade.desc}
                        </p>
                        <p style={{ color: grapheneUpgrade ? "#2563eb" : "#0f172a", fontSize: "0.82rem", fontWeight: 700, margin: "0.2rem 0 0", transition: "color 0.3s ease" }}>
                          {p.upgrade.price} MXN
                        </p>
                      </div>
                    </button>
                  )}
                  <Link href={`/reservar?paquete=${bookingSlug}`} className={p.featured ? "btn-premium" : "btn-outline"} style={{ width: "100%", justifyContent: "center" }}>
                    Reservar {displayName}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="section-padding" id="servicios" style={{ background: "#f1f5f9" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label">Nuestros Paquetes</span>
            <h2 className="section-title">
              Cada servicio, un <span className="gradient-text">estándar superior</span>
            </h2>
            <p className="section-subtitle">
              No somos un lavado de autos. Somos un centro de estética automotriz portátil con
              maquinaria industrial y técnicos certificados IDA.
            </p>
            {/* ECO Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #dcfce7, #bbf7d0)", padding: "0.5rem 1.2rem", borderRadius: "2rem", marginTop: "1rem", fontSize: "0.85rem", color: "#166534", fontWeight: 600 }}>
              🌿 Certificación Sello ECO · 45% menos consumo de agua
            </div>
          </div>

          {/* Main Packages — Horizontal Cards */}
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
            {mainServices.map((s, i) => (
              <div key={i} className="glass-card animate-on-scroll service-card-horizontal" style={{ display: "flex", gap: "0", overflow: "hidden", cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}>
                {/* Image Side */}
                <div className="service-card-image" style={{
                  flex: "0 0 340px",
                  minHeight: "280px",
                  background: `linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.15))`,
                  backgroundImage: `url(${s.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}>
                  {/* Fallback icon if no image loaded */}
                  <span style={{ fontSize: "4rem", opacity: 0.3, position: "absolute" }}>{s.icon}</span>
                </div>

                {/* Content Side */}
                <div className="service-card-content" style={{ flex: 1, padding: "2rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ color: "#2563eb", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>{s.tagline}</span>
                  <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", fontFamily: "var(--font-heading)" }}>
                    <span style={{ marginRight: "0.5rem" }}>{s.icon}</span>{s.title}
                  </h3>
                  <p className="service-card-desc" style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.8", marginBottom: "1.25rem" }}>{s.desc}</p>

                  {/* Highlights */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {s.highlights.map((h, j) => (
                      <span key={j} style={{
                        background: "rgba(37,99,235,0.08)",
                        color: "#2563eb",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "0.3rem 0.8rem",
                        borderRadius: "2rem",
                        fontFamily: "var(--font-heading)",
                      }}>{h}</span>
                    ))}
                  </div>

                  <Link href={`/reservar?paquete=${s.bookingId}`} className="btn-premium" style={{ alignSelf: "flex-start", padding: "0.7rem 2rem", fontSize: "0.85rem" }}>
                    Reservar {s.title}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* ─── PAGO RECURRENTE ─── */}
      <section className="section-padding" id="recurrente">
        <div className="container" style={{ textAlign: "center" }}>
          {/* ─── Subscription Plans ─── */}
          <div style={{ marginTop: "3rem" }}>
            <div className="animate-on-scroll">
              <span className="section-label">Suscripciones</span>
              <h3 className="section-title" style={{ fontSize: "1.8rem" }}>
                Planes de <span className="gradient-text">pago recurrente</span>
              </h3>
              <p className="section-subtitle">
                Mantén tu auto impecable con pagos mensuales automáticos. Cancela cuando quieras.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
              {/* Foam Maintenance Card */}
              <div className="glass-card animate-on-scroll" style={{ padding: "2rem", textAlign: "left", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "2.5rem" }}>{foamMaintenance.icon}</span>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{foamMaintenance.title}</h3>
                    <span style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 600, background: "#dcfce7", padding: "0.2rem 0.6rem", borderRadius: "1rem" }}>
                      Pago mensual · Recurrente
                    </span>
                  </div>
                </div>
                <p style={{ color: "#475569", fontSize: "0.88rem", marginBottom: "1rem", lineHeight: "1.7", flex: 1 }}>{foamMaintenance.desc}</p>
                <div style={{ marginBottom: "0.25rem" }}>
                  <span className="gradient-text" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2rem" }}>$1,800</span>
                  <span style={{ color: "#64748b", fontSize: "0.9rem", marginLeft: "0.25rem" }}>MXN / mes</span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1.25rem" }}>IVA incluido · Facturable · {foamMaintenance.note}</p>
                <a
                  href="https://buy.stripe.com/4gM00kclRcDc8e92Zg3ZK03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium"
                  style={{ width: "100%", justifyContent: "center", textAlign: "center" }}
                >
                  🔄 Suscribirme
                </a>
              </div>

              {/* Membresía Card */}
              <div className="glass-card animate-on-scroll" style={{ padding: "2rem", textAlign: "center", border: "2px solid rgba(37,99,235,0.15)", display: "flex", flexDirection: "column" }}>
                <span style={{ display: "inline-block", padding: "0.25rem 1rem", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#ffffff", fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, borderRadius: "2rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", alignSelf: "center" }}>
                  Mejor Valor
                </span>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{membership.icon}</div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>{membership.title}</h3>
                <div className="gradient-text" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2.5rem", marginBottom: "0.25rem" }}>
                  {membership.price}
                </div>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{membership.priceLabel}</p>
                <span style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 600, background: "#dcfce7", padding: "0.2rem 0.6rem", borderRadius: "1rem", display: "inline-block", marginBottom: "1.25rem" }}>
                  Pago mensual · Recurrente
                </span>
                <ul style={{ listStyle: "none", padding: 0, textAlign: "left", maxWidth: "320px", margin: "0 auto 1.5rem", flex: 1 }}>
                  {membership.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem", color: "#334155", fontSize: "0.9rem" }}>
                      <span style={{ color: "#2563eb", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://buy.stripe.com/cNi28s71x8mW0LH43k3ZK04"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium"
                  style={{ width: "100%", justifyContent: "center", textAlign: "center" }}
                >
                  🔄 Suscribirme
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COVERAGE ZONES ─── */}
      <section className="section-padding" id="cobertura" style={{ background: "#f8fafc" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label">Zonas de Cobertura</span>
            <h2 className="section-title">
              Presentes en las zonas más <span className="gradient-text">exclusivas</span>
            </h2>
            <p className="section-subtitle">
              Operamos en las colonias y fraccionamientos más premium de la Ciudad de México
              y el Estado de México.
            </p>
          </div>

          <div className="zones-grid">
            {zones.map((z, i) => (
              <div key={i} className="glass-card zone-card animate-on-scroll">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span className="zone-name">{z.name}</span>
                  <span className={`zone-tag ${z.tagClass}`}>{z.tag}</span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{z.desc}</p>
              </div>
            ))}
          </div>

          <p className="animate-on-scroll" style={{ marginTop: "2rem", color: "#94a3b8", fontSize: "0.9rem" }}>
            ¿Tu zona no aparece? <a href="#contacto" style={{ color: "var(--color-gold-400)", textDecoration: "underline" }}>Contáctanos</a> —
            posiblemente también te cubrimos.
          </p>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section style={{ padding: "3rem 1.5rem", background: "#ffffff" }} id="proceso">
        <div className="container">
          <div className="animate-on-scroll" style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="section-label">¿Cómo Funciona?</span>
          </div>
          <div className="animate-on-scroll" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "0", maxWidth: "900px", margin: "0 auto", flexWrap: "wrap" }}>
            {processSteps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "160px" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", marginBottom: "0.5rem", flexShrink: 0 }}>
                    {s.num}
                  </div>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.2rem" }}>{s.title}</p>
                  <p style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: "1.4" }}>{s.desc}</p>
                </div>
                {i < processSteps.length - 1 && (
                  <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg, #2563eb, #60a5fa)", marginTop: "1.25rem", flexShrink: 0, opacity: 0.3 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GOOGLE REVIEWS ─── */}
      <section className="section-padding" id="resenas" style={{ background: "#f1f5f9" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label">Reseñas Verificadas</span>
            <h2 className="section-title">
              Lo que dicen nuestros <span className="gradient-text">clientes</span>
            </h2>

            {/* Google Rating Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", background: "white", padding: "1.25rem 2rem", borderRadius: "1rem", marginTop: "1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", flexWrap: "wrap", justifyContent: "center" }}>
              {/* Google Logo */}
              <svg viewBox="0 0 272 92" width="80" height="27" xmlns="http://www.w3.org/2000/svg">
                <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335" />
                <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05" />
                <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4" />
                <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
                <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335" />
                <path d="M35.29 41.19V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49-.21z" fill="#4285F4" />
              </svg>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2rem", color: "#0f172a" }}>{googleOverallRating}</span>
                <div>
                  <div style={{ color: "#FBBC05", fontSize: "1.1rem", letterSpacing: "2px" }}>
                    {"★".repeat(Math.floor(googleOverallRating))}{googleOverallRating % 1 >= 0.5 ? "★" : ""}
                  </div>
                  <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>{googleTotalReviews} reseñas</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "#e8f5e9", padding: "0.35rem 0.75rem", borderRadius: "2rem", fontSize: "0.78rem", color: "#2e7d32", fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#2e7d32"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                Verificado
              </div>
            </div>
          </div>

          {/* Reviews Infinite Carousel */}
          <div style={{ overflow: "hidden", marginTop: "2.5rem", position: "relative" }}>
            {/* Fade edges */}
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "60px", background: "linear-gradient(90deg, #f1f5f9, transparent)", zIndex: 2, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60px", background: "linear-gradient(270deg, #f1f5f9, transparent)", zIndex: 2, pointerEvents: "none" }} />
            <div className="reviews-marquee">
              {[...googleReviews, ...googleReviews].map((r, i) => (
                <div key={i} className="glass-card" style={{ padding: "1.25rem", textAlign: "left", minWidth: "320px", maxWidth: "320px", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #4285F4, #34A853)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                      {r.author.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.82rem", color: "#0f172a", margin: 0 }}>{r.author}</p>
                      <div style={{ color: "#FBBC05", fontSize: "0.75rem", letterSpacing: "1px" }}>{"★".repeat(r.stars)}</div>
                    </div>
                  </div>
                  <p style={{ color: "#334155", fontSize: "0.82rem", lineHeight: "1.6", margin: 0, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Link to Google Maps */}
          <a
            href="https://maps.app.goo.gl/Hw6CwVxJrAPP6ASZ6"
            target="_blank"
            rel="noopener noreferrer"
            className="animate-on-scroll"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", color: "#4285F4", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}
          >
            Ver todas las reseñas en Google Maps
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </a>
        </div>
      </section>


      {/* ─── BLOG CAROUSEL ─── */}
      <section className="section-padding" id="blog" style={{ background: "#ffffff" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label">Aprende con Nosotros</span>
            <h2 className="section-title">
              Últimos artículos del <span className="gradient-text">Blog</span>
            </h2>
          </div>

          <div style={{
            display: "flex",
            gap: "2rem",
            overflowX: "auto",
            paddingBottom: "2rem",
            marginTop: "3rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}>
            {/* Array is mapped over statically to prevent build errors since it's a client component */}
            {[
              { slug: "guia-completa-recubrimiento-ceramico", title: "Guía Completa: Recubrimiento Cerámico en CDMX", cat: "Protección" },
              { slug: "5-errores-lavado-auto-premium", title: "5 Errores que Arruinan la Pintura de tu Auto", cat: "Cuidado" },
              { slug: "detallado-interior-profundo-que-incluye", title: "¿Qué Incluye un Detallado Interior Profundo?", cat: "Servicios" },
              { slug: "correccion-pintura-swirls-guia", title: "Cómo Eliminar Swirls y Micro-rayones", cat: "Corrección" },
              { slug: "por-que-detallado-domicilio-mejor", title: "¿Por Qué el Detallado a Domicilio Supera al Taller?", cat: "Tendencias" },
              { slug: "mejores-ceras-selladores-mexico", title: "Las Mejores Ceras y Selladores en México", cat: "Productos" }
            ].map((b, i) => (
              <a key={i} href={`/blog/${b.slug}`} className="glass-card animate-on-scroll" style={{
                minWidth: "320px",
                maxWidth: "320px",
                flexShrink: 0,
                textAlign: "left",
                textDecoration: "none",
                display: "block",
                overflow: "hidden"
              }}>
                <div style={{ height: "200px", backgroundImage: `url(/blog/${b.slug}.png)`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ padding: "1.5rem" }}>
                  <span className="zone-tag zone-tag-gold" style={{ marginBottom: "0.5rem" }}>{b.cat}</span>
                  <h3 style={{ fontSize: "1.1rem", color: "#0f172a", marginTop: "0.5rem" }}>{b.title}</h3>
                  <p style={{ color: "var(--color-gold-400)", fontSize: "0.85rem", marginTop: "1rem", fontWeight: 600 }}>Leer artículo →</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* ─── FAQ ─── */}
      <section className="section-padding" id="faq">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="animate-on-scroll" style={{ textAlign: "center" }}>
            <span className="section-label">Preguntas Frecuentes</span>
            <h2 className="section-title">
              Todo lo que necesitas <span className="gradient-text">saber</span>
            </h2>
          </div>

          <div className="animate-on-scroll">
            {faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {f.q}
                  <svg
                    className={`faq-icon ${openFaq === i ? "open" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <div className={`faq-answer ${openFaq === i ? "open" : ""}`}>
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA / CONTACT ─── */}
      <section className="section-padding" id="contacto" style={{ background: "linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label">Reserva Tu Servicio</span>
            <h2 className="section-title">
              ¿Listo para la <span className="gradient-text">experiencia Doctor Foam</span>?
            </h2>
            <p className="section-subtitle">
              Paga en línea de forma segura y agenda tu servicio de inmediato.
              Todos los precios incluyen IVA. Todos los servicios son facturables.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/reservar" className="btn-premium">
                💳 Reservar y Pagar en Línea
              </Link>
              <Link href="?chat=open" className="btn-outline">
                💬 Chat para dudas
              </Link>
            </div>
            <p style={{ color: "#475569", fontSize: "0.8rem", marginTop: "1rem" }}>
              🔒 Pago seguro con Stripe · Facturación CFDI disponible
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: "1rem", maxWidth: "320px", lineHeight: "1.7" }}>
              Servicio de detallado automotriz premium a domicilio. Equipo industrial, químicos
              profesionales, resultados extraordinarios. Valle de México.
            </p>
          </div>
          <div>
            <h4 className="footer-title">Servicios</h4>
            <ul className="footer-links">
              <li><a href="#servicios">Lavado Premium</a></li>
              <li><a href="#servicios">Detallado Interior</a></li>
              <li><a href="#servicios">Corrección de Pintura</a></li>
              <li><a href="#servicios">Recubrimiento Cerámico</a></li>
              <li><a href="#servicios">Membresía</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Cobertura</h4>
            <ul className="footer-links">
              <li><a href="#cobertura">Polanco</a></li>
              <li><a href="#cobertura">Lomas de Chapultepec</a></li>
              <li><a href="#cobertura">Santa Fe</a></li>
              <li><a href="#cobertura">Bosques de las Lomas</a></li>
              <li><a href="#cobertura">Pedregal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Contacto</h4>
            <ul className="footer-links">
              <li><Link href="?chat=open">Chat en línea</Link></li>
              <li><a href="tel:+5215500000000">+52 55 0000 0000</a></li>
              <li><a href="mailto:hola@doctorfoam.mx">hola@doctorfoam.mx</a></li>
              <li><a href="https://instagram.com/doctorfoam.mx">Instagram</a></li>
              <li><a href="https://facebook.com/doctorfoam.mx">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Doctor Foam México. Todos los derechos reservados.</p>
          <p style={{ marginTop: "0.5rem" }}>
            <Link href="/aviso-de-privacidad" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}>
              Aviso de Privacidad
            </Link>
            {" · "}
            <Link href="/blog" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}>
              Blog
            </Link>
          </p>
        </div>
      </footer>

      {/* Chat handled by GuestChat in layout */}
    </>
  );
}
