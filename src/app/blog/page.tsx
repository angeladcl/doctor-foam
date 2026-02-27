import Logo from "@/components/Logo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Blog | Doctor Foam México — Consejos de Detallado Automotriz",
    description:
        "Tips, guías y artículos sobre cuidado automotriz, detallado premium, recubrimientos cerámicos y mantenimiento de vehículos de lujo en México.",
    alternates: { canonical: "https://doctorfoam.mx/blog" },
};

const blogPosts = [
    {
        slug: "guia-completa-recubrimiento-ceramico",
        title: "Guía Completa: Recubrimiento Cerámico para tu Auto en CDMX",
        excerpt:
            "Todo lo que necesitas saber antes de aplicar un recubrimiento cerámico: tipos, duración, precios y qué esperar del proceso profesional.",
        date: "2026-02-15",
        category: "Protección",
        readTime: "8 min",
    },
    {
        slug: "5-errores-lavado-auto-premium",
        title: "5 Errores que Arruinan la Pintura de tu Auto de Lujo",
        excerpt:
            "Desde usar el jabón equivocado hasta secar mal. Descubre los errores más comunes que cometen los dueños de autos premium y cómo evitarlos.",
        date: "2026-02-10",
        category: "Cuidado",
        readTime: "6 min",
    },
    {
        slug: "detallado-interior-profundo-que-incluye",
        title: "¿Qué Incluye un Detallado Interior Profundo Profesional?",
        excerpt:
            "Aspirado industrial, vapor, ozono, hidratación de pieles... ¿Qué realmente debería incluir un detallado interior de calidad? Te lo explicamos paso a paso.",
        date: "2026-02-05",
        category: "Servicios",
        readTime: "7 min",
    },
    {
        slug: "correccion-pintura-swirls-guia",
        title: "Corrección de Pintura: Cómo Eliminar Swirls y Micro-rayones",
        excerpt:
            "Tu auto tiene más swirls de los que crees. Aprende sobre los niveles de corrección y cuándo necesitas un pulido profesional.",
        date: "2026-01-28",
        category: "Corrección",
        readTime: "9 min",
    },
    {
        slug: "por-que-detallado-domicilio-mejor",
        title: "¿Por Qué el Detallado a Domicilio Supera al Taller?",
        excerpt:
            "Conveniencia, atención personalizada, equipo industrial portátil. Descubre por qué cada vez más dueños de autos premium prefieren el servicio a domicilio.",
        date: "2026-01-20",
        category: "Tendencias",
        readTime: "5 min",
    },
    {
        slug: "mejores-ceras-selladores-mexico",
        title: "Las Mejores Ceras y Selladores Disponibles en México",
        excerpt:
            "Comparativa de los mejores productos de protección para tu auto: desde ceras carnaubas hasta selladores cerámicos de última generación.",
        date: "2026-01-15",
        category: "Productos",
        readTime: "10 min",
    },
];

export default function BlogPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Blog Doctor Foam México",
        description: "Artículos sobre detallado automotriz premium, cuidado de autos de lujo",
        url: "https://doctorfoam.mx/blog",
        publisher: {
            "@type": "Organization",
            name: "Doctor Foam México",
        },
        blogPost: blogPosts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            url: `https://doctorfoam.mx/blog/${post.slug}`,
        })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <nav className="navbar navbar-scrolled">
                <div className="navbar-inner">
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <Logo size="sm" />
                    </Link>
                    <a href="/#contacto" className="btn-premium" style={{ padding: "0.5rem 1.2rem", fontSize: "0.8rem" }}>
                        Agendar Cita
                    </a>
                </div>
            </nav>

            <main style={{ paddingTop: "6rem" }}>
                <section className="section-padding">
                    <div className="container">
                        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                            <span className="section-label">Blog</span>
                            <h1 className="section-title">
                                Guías y consejos de <span className="gradient-text">detallado automotriz</span>
                            </h1>
                            <p className="section-subtitle">
                                Artículos escritos por expertos para que cuides tu auto como se merece.
                            </p>
                        </div>

                        <div className="services-grid" style={{ maxWidth: "1000px", margin: "0 auto" }}>
                            {blogPosts.map((post, i) => (
                                <article key={i} className="glass-card" style={{ padding: "2rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                                        <span className="zone-tag zone-tag-gold">{post.category}</span>
                                        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{post.readTime}</span>
                                    </div>
                                    <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", lineHeight: "1.4" }}>
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            style={{ color: "white", textDecoration: "none" }}
                                        >
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.7", marginBottom: "1rem" }}>
                                        {post.excerpt}
                                    </p>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ color: "#475569", fontSize: "0.8rem" }}>
                                            {new Date(post.date).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                                        </span>
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            style={{ color: "var(--color-gold-400)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
                                        >
                                            Leer más →
                                        </Link>
                                    </div>
                                </article>
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
                    </p>
                </div>
            </footer>
        </>
    );
}
