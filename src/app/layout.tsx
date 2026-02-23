import type { Metadata } from "next";
import "./globals.css";
import GuestChat from "@/components/GuestChat";

export const metadata: Metadata = {
  title: "Doctor Foam México | Detallado Automotriz Premium a Domicilio",
  description:
    "Servicio de detallado automotriz premium a domicilio en CDMX y Valle de México. Acabados de nivel industrial con resultados superiores a talleres de estética automotriz. Polanco, Lomas, Santa Fe y más.",
  keywords: [
    "detallado automotriz",
    "car detailing CDMX",
    "lavado premium a domicilio",
    "estética automotriz México",
    "Doctor Foam",
    "detallado a domicilio Polanco",
    "detallado automotriz Santa Fe",
    "limpieza automotriz premium",
    "recubrimiento cerámico CDMX",
    "corrección de pintura México",
  ],
  authors: [{ name: "Doctor Foam México" }],
  openGraph: {
    title: "Doctor Foam México | Detallado Automotriz Premium a Domicilio",
    description:
      "Llevamos el taller a tu puerta. Detallado automotriz con equipo industrial y químicos especializados. Resultados superiores a cualquier taller.",
    url: "https://doctorfoam.mx",
    siteName: "Doctor Foam México",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doctor Foam México | Detallado Automotriz Premium a Domicilio",
    description:
      "Servicio de detallado automotriz premium a domicilio en CDMX. Equipo industrial + químicos especializados = resultados superiores.",
  },
  alternates: {
    canonical: "https://doctorfoam.mx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f2240" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Doctor Foam" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <GuestChat />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
