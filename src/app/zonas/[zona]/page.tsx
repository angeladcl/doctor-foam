import type { Metadata } from "next";
import Link from "next/link";

/* ─── Zone Data ─── */
const zonesData: Record<string, {
    name: string;
    fullName: string;
    state: string;
    description: string;
    neighborhoods: string[];
    metaDesc: string;
    intro: string;
    carBrands: string[];
}> = {
    polanco: {
        name: "Polanco",
        fullName: "Polanco, Miguel Hidalgo",
        state: "Ciudad de México",
        description: "La zona más exclusiva de CDMX con la mayor concentración de autos de lujo",
        neighborhoods: ["Campos Elíseos", "Polanco I Sección", "Polanco II Sección", "Polanco III Sección", "Polanco IV Sección", "Polanco V Sección", "Granadas", "Irrigación"],
        metaDesc: "Detallado automotriz premium a domicilio en Polanco, CDMX. Doctor Foam lleva equipo industrial a tu puerta. Servicio para BMW, Porsche, Mercedes y más.",
        intro: "Polanco es sinónimo de lujo y exclusividad en la Ciudad de México. Con calles como Masaryk, Campos Elíseos y Anatole France, esta zona concentra algunos de los vehículos más valiosos del país. En Doctor Foam, entendemos que un auto de lujo merece un cuidado excepcional.",
        carBrands: ["BMW", "Mercedes-Benz", "Porsche", "Audi", "Range Rover", "Ferrari", "Lamborghini"],
    },
    "lomas-de-chapultepec": {
        name: "Lomas de Chapultepec",
        fullName: "Lomas de Chapultepec, Miguel Hidalgo",
        state: "Ciudad de México",
        description: "Residencial premium con vehículos de la más alta gama",
        neighborhoods: ["Lomas Altas", "Lomas Virreyes", "Barrilaco", "Lomas de Bezares", "Prados de la Montaña"],
        metaDesc: "Servicio de detallado automotriz premium a domicilio en Lomas de Chapultepec. Equipo industrial, químicos profesionales. Doctor Foam México.",
        intro: "Lomas de Chapultepec es una de las zonas residenciales más prestigiosas de México. Sus amplias residencias y cocheras albergan colecciones de autos que merecen el mejor cuidado posible. Doctor Foam ofrece servicio a domicilio con la comodidad y discreción que esta zona exige.",
        carBrands: ["Mercedes-Benz", "BMW", "Porsche", "Bentley", "Maserati", "Audi"],
    },
    "santa-fe": {
        name: "Santa Fe",
        fullName: "Santa Fe, Álvaro Obregón / Cuajimalpa",
        state: "Ciudad de México",
        description: "Centro corporativo y residencial moderno de alto nivel",
        neighborhoods: ["Centro de Ciudad Santa Fe", "Lomas de Santa Fe", "Santa Fe Cuajimalpa", "Contadero", "Cruz Manca"],
        metaDesc: "Detallado automotriz a domicilio en Santa Fe CDMX. Servicio premium con equipo industrial para ejecutivos y residentes. Doctor Foam.",
        intro: "Santa Fe es el corazón corporativo de la Ciudad de México y hogar de ejecutivos que valoran su tiempo tanto como sus vehículos. Nuestro servicio a domicilio es perfecto para quienes desean que su auto sea detallado mientras trabajan o descansan en su departamento.",
        carBrands: ["BMW", "Audi", "Mercedes-Benz", "Volvo", "Porsche", "Tesla"],
    },
    "bosques-de-las-lomas": {
        name: "Bosques de las Lomas",
        fullName: "Bosques de las Lomas, Cuajimalpa",
        state: "Ciudad de México",
        description: "Zona residencial exclusiva entre la ciudad y la naturaleza",
        neighborhoods: ["Bosques de las Lomas", "Tecamachalco", "La Herradura", "Palo Alto"],
        metaDesc: "Detallado automotriz premium en Bosques de las Lomas y Tecamachalco. Servicio a domicilio con equipo industrial. Doctor Foam CDMX.",
        intro: "Bosques de las Lomas y sus colonias aledañas como Tecamachalco y La Herradura representan lo mejor de la vida residencial premium en la CDMX. Aquí, Doctor Foam atiende a familias exigentes que buscan lo mejor para sus flotillas personales.",
        carBrands: ["Range Rover", "BMW", "Mercedes-Benz", "Porsche", "Audi", "Cadillac"],
    },
    pedregal: {
        name: "Pedregal",
        fullName: "Jardines del Pedregal, Coyoacán",
        state: "Ciudad de México",
        description: "Zona residencial icónica del sur de la ciudad",
        neighborhoods: ["Jardines del Pedregal", "Pedregal de San Ángel", "San Ángel Inn", "Ex Hacienda de Guadalupe Chimalistac"],
        metaDesc: "Servicio de detallado automotriz premium a domicilio en Pedregal y San Ángel, CDMX. Equipo industrial profesional. Doctor Foam.",
        intro: "El Pedregal de San Ángel es una de las zonas residenciales más emblemáticas de la Ciudad de México. Con sus casas arquitectónicas y jardines amplios, es el escenario perfecto para nuestro servicio de detallado a domicilio.",
        carBrands: ["BMW", "Mercedes-Benz", "Audi", "Mini", "Porsche", "Lexus"],
    },
    interlomas: {
        name: "Interlomas",
        fullName: "Interlomas, Huixquilucan",
        state: "Estado de México",
        description: "Desarrollo residencial moderno de alto nivel en Huixquilucan",
        neighborhoods: ["Interlomas", "Bosque Real", "Hacienda de las Palmas", "La Estadía", "Villa Florence"],
        metaDesc: "Detallado automotriz premium a domicilio en Interlomas y Bosque Real. Equipo industrial con químicos profesionales. Doctor Foam.",
        intro: "Interlomas y Bosque Real son de los desarrollos residenciales más modernos y exclusivos del área metropolitana. Doctor Foam atiende estos fraccionamientos con la misma calidad premium que ofrecemos en toda la zona del Valle de México.",
        carBrands: ["Audi", "BMW", "Mercedes-Benz", "Porsche", "Volkswagen Premium", "Mini"],
    },
    huixquilucan: {
        name: "Huixquilucan",
        fullName: "Huixquilucan de Degollado",
        state: "Estado de México",
        description: "Municipio con los fraccionamientos más exclusivos del EdoMex",
        neighborhoods: ["Zona Esmeralda", "La Herradura", "Jesús del Monte", "Hacienda de las Palmas", "Bosque Real"],
        metaDesc: "Detallado automotriz a domicilio en Huixquilucan, Zona Esmeralda y alrededores. Servicio premium industrial. Doctor Foam México.",
        intro: "Huixquilucan es el municipio con mayor ingreso per cápita del Estado de México. Sus fraccionamientos cerrados y residenciales premium son ideales para nuestro servicio de detallado a domicilio, donde la seguridad y la privacidad son prioridad.",
        carBrands: ["BMW", "Audi", "Mercedes-Benz", "Porsche", "Range Rover", "Jeep Premium"],
    },
    coyoacan: {
        name: "Coyoacán Premium",
        fullName: "Coyoacán",
        state: "Ciudad de México",
        description: "Zonas selectas del sur de la Ciudad de México",
        neighborhoods: ["Country Club Churubusco", "Del Carmen", "Campestre Churubusco", "Villa Coyoacán", "Los Reyes"],
        metaDesc: "Servicio de detallado automotriz premium a domicilio en Coyoacán y sur de CDMX. Doctor Foam: equipo industrial y resultados garantizados.",
        intro: "Coyoacán combina tradición con zonas residenciales de alto nivel como el Country Club Churubusco. Es una zona con alto poder adquisitivo y amantes de los autos bien cuidados. Doctor Foam llega hasta la puerta de tu casa con equipo profesional.",
        carBrands: ["BMW", "Audi", "Mercedes-Benz", "Volkswagen", "Mini", "Volvo"],
    },
};

interface PageProps {
    params: Promise<{ zona: string }>;
}

export async function generateStaticParams() {
    return Object.keys(zonesData).map((zona) => ({ zona }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { zona } = await params;
    const z = zonesData[zona];
    if (!z) return { title: "Zona no encontrada" };

    return {
        title: `Detallado Automotriz en ${z.name} | Doctor Foam México`,
        description: z.metaDesc,
        alternates: { canonical: `https://doctorfoam.mx/zonas/${zona}` },
        openGraph: {
            title: `Detallado Premium a Domicilio en ${z.name}`,
            description: z.metaDesc,
        },
    };
}

export default async function ZonePage({ params }: PageProps) {
    const { zona } = await params;
    const z = zonesData[zona];

    if (!z) {
        return (
            <main style={{ paddingTop: "8rem", textAlign: "center" }}>
                <h1>Zona no encontrada</h1>
                <Link href="/#cobertura" style={{ color: "var(--color-gold-400)" }}>Ver zonas de cobertura</Link>
            </main>
        );
    }

    const localBusinessJsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `Doctor Foam — Detallado Automotriz en ${z.name}`,
        description: z.metaDesc,
        provider: {
            "@type": "LocalBusiness",
            name: "Doctor Foam México",
            areaServed: {
                "@type": "Place",
                name: `${z.fullName}, ${z.state}`,
            },
        },
        serviceType: "Mobile Auto Detailing",
        url: `https://doctorfoam.mx/zonas/${zona}`,
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

            <nav className="navbar navbar-scrolled">
                <div className="navbar-inner">
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", color: "white" }}>
                            DOCTOR <span className="gradient-text">FOAM</span>
                        </span>
                    </Link>
                    <a href="/#contacto" className="btn-premium" style={{ padding: "0.5rem 1.2rem", fontSize: "0.8rem" }}>
                        Agendar Cita
                    </a>
                </div>
            </nav>

            <main style={{ paddingTop: "6rem" }}>
                {/* Hero */}
                <section className="section-padding" style={{ textAlign: "center" }}>
                    <div className="container">
                        <span className="section-label">{z.state}</span>
                        <h1 className="section-title">
                            Detallado Automotriz Premium en <span className="gradient-text">{z.name}</span>
                        </h1>
                        <p className="section-subtitle" style={{ maxWidth: "700px" }}>
                            {z.description}
                        </p>
                    </div>
                </section>

                {/* Intro */}
                <section className="section-padding" style={{ paddingTop: 0 }}>
                    <div className="container" style={{ maxWidth: "800px" }}>
                        <div className="glass-card" style={{ padding: "2.5rem" }}>
                            <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: "1.9" }}>
                                {z.intro}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Neighborhoods */}
                <section className="section-padding" style={{ paddingTop: 0 }}>
                    <div className="container" style={{ maxWidth: "800px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                            Colonias y Fraccionamientos que Atendemos
                        </h2>
                        <div className="zones-grid">
                            {z.neighborhoods.map((n, i) => (
                                <div key={i} className="glass-card" style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                                    <span style={{ color: "var(--color-gold-400)", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                                        {n}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Car brands */}
                <section className="section-padding" style={{ paddingTop: 0 }}>
                    <div className="container" style={{ maxWidth: "800px", textAlign: "center" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                            Marcas que Detallamos en {z.name}
                        </h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
                            {z.carBrands.map((b, i) => (
                                <span key={i} className="zone-tag zone-tag-gold" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Services preview */}
                <section className="section-padding" style={{ paddingTop: 0 }}>
                    <div className="container" style={{ maxWidth: "800px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                            Servicios Disponibles en {z.name}
                        </h2>
                        <div className="services-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                            {[
                                { icon: "🧽", title: "Lavado Premium", price: "Desde $1,800" },
                                { icon: "🪑", title: "Detallado Interior", price: "Desde $2,500" },
                                { icon: "💎", title: "Corrección de Pintura", price: "Desde $4,500" },
                                { icon: "🛡️", title: "Recubrimiento Cerámico", price: "Desde $8,500" },
                            ].map((s, i) => (
                                <div key={i} className="glass-card" style={{ padding: "1.5rem", textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{s.icon}</div>
                                    <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{s.title}</h3>
                                    <span className="gradient-text" style={{ fontWeight: 700, fontFamily: "var(--font-heading)" }}>{s.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="section-padding" style={{ textAlign: "center" }}>
                    <div className="container" style={{ maxWidth: "600px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                            ¿Estás en <span className="gradient-text">{z.name}</span>?
                        </h2>
                        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
                            Agenda tu cita y lleva la experiencia Doctor Foam a la puerta de tu casa.
                        </p>
                        <Link
                            href="/reservar"
                            className="btn-premium"
                        >
                            Agendar en {z.name}
                        </Link>
                    </div>
                </section>

                {/* Other zones */}
                <section className="section-padding" style={{ paddingTop: 0 }}>
                    <div className="container" style={{ maxWidth: "800px", textAlign: "center" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#94a3b8" }}>
                            También estamos en:
                        </h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                            {Object.entries(zonesData)
                                .filter(([key]) => key !== zona)
                                .map(([key, val]) => (
                                    <Link
                                        key={key}
                                        href={`/zonas/${key}`}
                                        className="zone-tag zone-tag-blue"
                                        style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                                    >
                                        {val.name}
                                    </Link>
                                ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-bottom" style={{ borderTop: "none", marginTop: 0 }}>
                    <p>&copy; {new Date().getFullYear()} Doctor Foam México. Todos los derechos reservados.</p>
                    <p style={{ marginTop: "0.5rem" }}>
                        <Link href="/" style={{ color: "#64748b", textDecoration: "underline" }}>Inicio</Link>
                        {" · "}
                        <Link href="/blog" style={{ color: "#64748b", textDecoration: "underline" }}>Blog</Link>
                    </p>
                </div>
            </footer>
        </>
    );
}
