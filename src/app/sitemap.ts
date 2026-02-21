import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://doctorfoam.mx";

    const zones = [
        "polanco",
        "lomas-de-chapultepec",
        "santa-fe",
        "bosques-de-las-lomas",
        "pedregal",
        "interlomas",
        "huixquilucan",
        "coyoacan",
    ];

    const blogPosts = [
        "guia-completa-recubrimiento-ceramico",
        "5-errores-lavado-auto-premium",
        "detallado-interior-profundo-que-incluye",
        "correccion-pintura-swirls-guia",
        "por-que-detallado-domicilio-mejor",
        "mejores-ceras-selladores-mexico",
    ];

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/reservar`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.95,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        ...blogPosts.map((slug) => ({
            url: `${baseUrl}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })),
        ...zones.map((zona) => ({
            url: `${baseUrl}/zonas/${zona}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.9,
        })),
        {
            url: `${baseUrl}/aviso-de-privacidad`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
