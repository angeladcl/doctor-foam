import type { Metadata } from "next";
import Link from "next/link";

/* ─── Blog content database ─── */
const blogContent: Record<string, { title: string; date: string; category: string; readTime: string; content: string; metaDesc: string }> = {
    "guia-completa-recubrimiento-ceramico": {
        title: "Guía Completa: Recubrimiento Cerámico para tu Auto en CDMX",
        date: "2026-02-15",
        category: "Protección",
        readTime: "8 min",
        metaDesc: "Todo sobre recubrimiento cerámico automotriz en CDMX: tipos, precios, duración y proceso profesional. Guía completa por Doctor Foam México.",
        content: `
## ¿Qué es un Recubrimiento Cerámico?

Un recubrimiento cerámico (o coating cerámico) es una capa de protección líquida de base SiO2 (dióxido de silicio) que se aplica sobre la pintura de tu vehículo, creando un escudo transparente extremadamente resistente.

A diferencia de las ceras y selladores tradicionales que duran semanas o meses, un recubrimiento cerámico profesional puede **proteger tu auto por 2 a 5 años** dependiendo del producto y la aplicación.

## Tipos de Recubrimiento Cerámico

### Cerámico de Consumidor (DIY)
- **Duración**: 6 meses - 1 año
- **Precio**: $500 - $2,000 MXN (producto)
- **Dificultad**: Media
- **Resultado**: Básico

### Cerámico Profesional
- **Duración**: 2 - 5 años
- **Precio**: $6,000 - $15,000 MXN (servicio completo)
- **Dificultad**: Requiere certificación
- **Resultado**: Excepcional

### Cerámico de Grafeno (Nueva Generación)
- **Duración**: 3 - 7 años
- **Precio**: $10,000 - $25,000 MXN
- **Dificultad**: Especialista
- **Resultado**: Premium

## Beneficios del Recubrimiento Cerámico

1. **Efecto hidrofóbico**: El agua se desliza llevándose la suciedad
2. **Protección UV**: Evita oxidación y decoloración
3. **Resistencia a químicos**: Protege contra lluvia ácida y contaminantes
4. **Brillo profundo**: Efecto espejo permanente
5. **Fácil mantenimiento**: Lavados más rápidos y sencillos

## El Proceso de Aplicación Profesional

En Doctor Foam seguimos un protocolo de 7 pasos:

1. **Lavado de descontaminación** — Eliminamos toda suciedad y contaminantes
2. **Descontaminación química** — Eliminamos partículas incrustadas
3. **Barra de arcilla** — Retiramos contaminación mecánica
4. **Corrección de pintura** — Pulido para eliminar imperfecciones
5. **Preparación IPA** — Limpiamos residuos de pulido
6. **Aplicación del cerámico** — Capa por capa, panel por panel
7. **Curado** — Tiempo de secado controlado

## Precios de Recubrimiento Cerámico en CDMX

| Servicio | Precio Mercado | Precio Doctor Foam |
|----------|---------------|-------------------|
| Cerámico 1 año | $3,000 - $5,000 | $6,400 |
| Cerámico 3 años | $6,000 - $9,000 | $10,500 |
| Cerámico 5 años | $10,000 - $15,000 | $16,500 |
| Grafeno Premium | $15,000 - $25,000 | $22,000 |

*Precios para sedán. SUV y camionetas +20%.*

## ¿Por Qué Elegir Doctor Foam?

- **Equipo industrial**: No usamos herramientas domésticas
- **Certificación**: Nuestros técnicos están certificados
- **A domicilio**: Sin mover tu auto
- **Garantía**: Certificado de protección incluido
- **Seguimiento**: Revisión gratuita a los 30 días

---

*¿Listo para proteger tu inversión? [Agenda tu cita aquí](/reservar) y lleva la protección cerámica profesional a la puerta de tu casa.*
    `,
    },
    "5-errores-lavado-auto-premium": {
        title: "5 Errores que Arruinan la Pintura de tu Auto de Lujo",
        date: "2026-02-10",
        category: "Cuidado",
        readTime: "6 min",
        metaDesc: "Evita estos 5 errores comunes que arruinan la pintura de autos de lujo. Consejos profesionales de Doctor Foam México.",
        content: `
## Error #1: Usar Jabón de Cocina o Detergente

Muchos dueños de autos premium cometen el error de lavar su vehículo con jabón para trastes. Estos productos están diseñados para **cortar grasa agresivamente**, lo cual también elimina las capas de cera, sellador o cerámico de tu auto.

**La solución**: Usa siempre un shampoo automotriz de pH neutro diseñado específicamente para pinturas automotrices.

## Error #2: Lavar Bajo el Sol Directo

Lavar tu auto cuando está caliente o bajo el sol causa que el agua y los químicos se evaporen antes de poder enjuagarse correctamente, dejando **marcas de agua** que se graban en la pintura clara.

**La solución**: Lava tu auto en sombra. Idealmente en la mañana temprano o en la tarde cuando la carrocería esté fría al tacto.

## Error #3: Usar Una Sola Cubeta

El método de una cubeta recircula la suciedad. Cada vez que metes la esponja en la cubeta, la llenas de partículas abrasivas que luego frotas contra la pintura, creando **swirls y micro-rayones**.

**La solución**: Método de 2 cubetas: una con jabón limpio y otra solo para enjuagar la esponja. Mejor aún, usa el método de prelavado con foam cannon que usamos en Doctor Foam.

## Error #4: Secar con Cualquier Trapo

Las toallas de algodón común, las franelas y por supuesto las jergas son abrasivas para las pinturas automotrices modernas. Secar con estos materiales es una de las causas principales de swirls.

**La solución**: Usa toallas de microfibra de alta calidad (mínimo 300 GSM). En Doctor Foam usamos microfibras de 500 GSM con técnica de secado por contacto suave.

## Error #5: No Proteger la Pintura Después del Lavado

Un auto recién lavado queda completamente expuesto a los rayos UV, lluvia ácida y contaminantes. Sin una capa de protección, la pintura se deteriora rápidamente.

**La solución**: Después de cada lavado, aplica al menos un quick detailer con protección UV. Para protección real y duradera, invierte en un recubrimiento cerámico profesional.

---

*En Doctor Foam eliminamos todos estos riesgos con nuestro proceso profesional de 7 pasos. [Agenda tu servicio](/reservar) y deja tu auto en manos de expertos.*
    `,
    },
    "detallado-interior-profundo-que-incluye": {
        title: "¿Qué Incluye un Detallado Interior Profundo Profesional?",
        date: "2026-02-05",
        category: "Servicios",
        readTime: "7 min",
        metaDesc: "Descubre qué debe incluir un detallado interior automotriz profesional: aspirado industrial, vapor, ozono, hidratación de pieles y más.",
        content: `
## La Diferencia Entre Limpieza y Detallado

Una "limpieza interior" típica incluye aspirar y limpiar superficialmente. Un **detallado interior profundo** es un proceso completo de restauración que devuelve cada superficie a su estado original.

## Los 8 Pasos de Nuestro Detallado Interior

### 1. Aspirado Industrial de Alta Potencia
No usamos aspiradoras domésticas. Nuestro equipo industrial tiene succión 10x superior, capaz de extraer polvo, tierra y partículas de las fibras más profundas de alfombras y asientos.

### 2. Limpieza a Vapor a 180°C
El vapor a alta temperatura desinfecta, desodoriza y elimina bacterias sin químicos agresivos. Ideal para asientos, tablero, volante y todas las superficies de contacto.

### 3. Extracción Profunda de Manchas
Para asientos de tela y alfombras, utilizamos extractoras profesionales que inyectan solución limpiadora y aspiran simultáneamente, eliminando manchas hasta un 95%.

### 4. Limpieza de Asientos de Piel
Los asientos de piel requieren un tratamiento especial: limpiador de pH neutro para piel, cepillo de cerdas suaves, y acondicionador premium que hidrata y protege contra el secado y las grietas.

### 5. Detallado de Tablero y Plásticos
Cada botón, ranura y ventila se limpia con pinceles de detallado profesional. Los plásticos reciben un protector UV para evitar el blanqueamiento por sol.

### 6. Limpieza de Vidrios Interior
Vidrios impecables sin rayas usando limpiador cerámico profesional y técnica de doble paño.

### 7. Sanitización con Ozono
Generador de ozono que elimina bacterias, virus, hongos y olores atrapados en el sistema de ventilación, tela y alfombra. Tu auto queda 99.9% libre de patógenos.

### 8. Fragancia Premium
Aplicamos un aromatizante premium de larga duración que complementa el ambiente del vehículo sin ser invasivo.

## Precios de Detallado Interior en CDMX

| Tipo de Vehículo | Interior Básico | Interior Profundo |
|-------------------|----------------|-------------------|
| Sedán | $1,500 MXN | $2,500 MXN |
| SUV / Camioneta | $1,800 MXN | $3,200 MXN |
| Minivan / 3 filas | $2,200 MXN | $3,800 MXN |

---

*Tu auto es donde pasas horas cada día. Merece un interior impecable. [Agenda tu detallado interior](/reservar) con Doctor Foam.*
    `,
    },
};

/* ─── Fallback articles ─── */
const defaultContent: Record<string, { title: string; date: string; category: string; readTime: string; content: string; metaDesc: string }> = {
    "correccion-pintura-swirls-guia": {
        title: "Corrección de Pintura: Cómo Eliminar Swirls y Micro-rayones",
        date: "2026-01-28", category: "Corrección", readTime: "9 min",
        metaDesc: "Aprende sobre corrección de pintura profesional: qué son los swirls, niveles de pulido y cómo Doctor Foam restaura el brillo de espejo.",
        content: `## ¿Qué son los Swirls?\n\nLos swirls son micro-rayones circulares en la capa clara (clear coat) de la pintura de tu auto. Son visibles especialmente bajo luz directa del sol o iluminación puntual.\n\n## Causas Principales\n\n1. Lavado con técnica incorrecta\n2. Secado con materiales abrasivos\n3. Máquinas de autolavado\n4. Pulido amateur sin experiencia\n\n## Niveles de Corrección\n\n### Corrección en 1 Etapa\nPulido único con compound medio. Elimina 60-70% de las imperfecciones.\n\n### Corrección en 2 Etapas\nCompound + polish. Elimina 85-95% de las imperfecciones. El más recomendado.\n\n### Corrección en 3 Etapas\nCutting compound + medium polish + finishing polish. Eliminación del 95-99%. Para quien busca la perfección absoluta.\n\n---\n\n*Descubre el verdadero color de tu auto. [Agenda una evaluación gratuita](/reservar).*`,
    },
    "por-que-detallado-domicilio-mejor": {
        title: "¿Por Qué el Detallado a Domicilio Supera al Taller?",
        date: "2026-01-20", category: "Tendencias", readTime: "5 min",
        metaDesc: "Ventajas del detallado automotriz a domicilio vs taller: comodidad, atención personalizada, equipo industrial. Doctor Foam CDMX.",
        content: `## La Revolución del Detallado Móvil\n\nEl servicio a domicilio no es solo conveniencia — es una experiencia superior en todos los sentidos.\n\n## 5 Razones por las que el Domicilio Gana\n\n### 1. Tu Tiempo Vale Oro\nNo pierdes 2-4 horas llevando y recogiendo tu auto.\n\n### 2. Supervisión Total\nPuedes ver todo el proceso desde tu ventana.\n\n### 3. Atención 1 a 1\nEn un taller manejan 5-10 autos. A domicilio, tu auto es el único.\n\n### 4. Sin Riesgo de Daños en Traslado\nCero riesgo de golpes en estacionamientos de talleres.\n\n### 5. Equipo Profesional Sin Compromisos\nEn Doctor Foam nuestras unidades móviles cargan el mismo equipo que los mejores talleres del mundo.\n\n---\n\n*Experimenta la diferencia. [Agenda con Doctor Foam](/reservar).*`,
    },
    "mejores-ceras-selladores-mexico": {
        title: "Las Mejores Ceras y Selladores Disponibles en México",
        date: "2026-01-15", category: "Productos", readTime: "10 min",
        metaDesc: "Comparativa de ceras y selladores automotrices en México: carnaubas, selladores cerámicos y grafeno. Por los expertos de Doctor Foam.",
        content: `## Ceras Carnauba\n\n### Collinite 845\n- **Duración**: 3-4 meses\n- **Precio**: ~$600 MXN\n- **Brillo**: Excelente\n\n### Meguiar's Gold Class\n- **Duración**: 1-2 meses\n- **Precio**: ~$350 MXN\n- **Brillo**: Muy bueno\n\n## Selladores Sintéticos\n\n### Jescar Power Lock Plus\n- **Duración**: 6 meses\n- **Precio**: ~$800 MXN\n- **Protección**: Excelente\n\n### Menzerna Power Lock\n- **Duración**: 4-6 meses\n- **Precio**: ~$700 MXN\n- **Protección**: Muy buena\n\n## Cerámicos Spray\n\n### CarPro Reload\n- **Duración**: 3-4 meses\n- **Precio**: ~$500 MXN\n- **Facilidad**: Muy fácil\n\n---\n\n*¿Quieres protección profesional? Nuestros recubrimientos cerámicos duran años, no meses. [Cotiza aquí](/reservar).*`,
    },
};

const allContent = { ...blogContent, ...defaultContent };

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return Object.keys(allContent).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = allContent[slug];
    if (!post) return { title: "Artículo no encontrado" };

    return {
        title: `${post.title} | Doctor Foam México`,
        description: post.metaDesc,
        alternates: { canonical: `https://doctorfoam.mx/blog/${slug}` },
        openGraph: {
            title: post.title,
            description: post.metaDesc,
            type: "article",
            publishedTime: post.date,
        },
    };
}

export default async function BlogPost({ params }: PageProps) {
    const { slug } = await params;
    const post = allContent[slug];

    if (!post) {
        return (
            <main style={{ paddingTop: "8rem", textAlign: "center" }}>
                <h1>Artículo no encontrado</h1>
                <Link href="/blog" style={{ color: "var(--color-gold-400)" }}>Volver al blog</Link>
            </main>
        );
    }

    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.metaDesc,
        datePublished: post.date,
        author: { "@type": "Organization", name: "Doctor Foam México" },
        publisher: { "@type": "Organization", name: "Doctor Foam México" },
        url: `https://doctorfoam.mx/blog/${slug}`,
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

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
                <article className="section-padding" style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <Link href="/blog" style={{ color: "var(--color-gold-400)", textDecoration: "none", fontSize: "0.9rem" }}>
                            ← Volver al blog
                        </Link>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <span className="zone-tag zone-tag-gold">{post.category}</span>
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{post.readTime} de lectura</span>
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                            {new Date(post.date).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                    </div>

                    <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", marginBottom: "2rem", lineHeight: "1.3" }}>
                        {post.title}
                    </h1>

                    <div
                        className="blog-content"
                        style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: "1.9" }}
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
                    />

                    <div className="glass-card" style={{ padding: "2rem", marginTop: "3rem", textAlign: "center" }}>
                        <h3 style={{ marginBottom: "1rem" }}>¿Listo para la experiencia <span className="gradient-text">Doctor Foam</span>?</h3>
                        <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Agenda tu cita hoy y transforma tu auto.</p>
                        <a href="/reservar" className="btn-premium">
                            📅 Agendar servicio
                        </a>
                    </div>
                </article>
            </main>
        </>
    );
}

/* Simple markdown-to-html for blog content */
function formatMarkdown(md: string): string {
    return md
        .replace(/^### (.+)$/gm, '<h3 style="margin-top:2rem;margin-bottom:0.75rem;font-size:1.15rem;">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 style="margin-top:2.5rem;margin-bottom:1rem;font-size:1.4rem;">$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, "<strong style='color:white'>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^\d+\. (.+)$/gm, '<li style="margin-bottom:0.5rem;margin-left:1.5rem;">$1</li>')
        .replace(/^- (.+)$/gm, '<li style="margin-bottom:0.5rem;margin-left:1.5rem;list-style:disc;">$1</li>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--color-gold-400);text-decoration:underline;">$1</a>')
        .replace(/\|(.+)\|/g, (match) => {
            const cells = match.split("|").filter(Boolean).map((c) => c.trim());
            return `<tr>${cells.map((c) => `<td style="padding:0.5rem 1rem;border:1px solid rgba(96,165,250,0.1)">${c}</td>`).join("")}</tr>`;
        })
        .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(96,165,250,0.1);margin:2rem 0">')
        .replace(/\n\n/g, "<br/><br/>")
        .replace(/\n/g, " ");
}
