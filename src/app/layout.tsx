import WhatsAppButton from "@/components/WhatsAppButton";
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: '--font-body', display: 'swap' });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: '--font-heading', display: 'swap' });
export const metadata: Metadata = {
  metadataBase: new URL("https://drfoam.com.mx"),
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
    url: "https://drfoam.com.mx",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Doctor Foam Lavado y Detallado Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doctor Foam México | Detallado Automotriz Premium a Domicilio",
    description:
      "Servicio de detallado automotriz premium a domicilio en CDMX. Equipo industrial + químicos especializados = resultados superiores.",
    images: ["/hero-bg.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
    shortcut: "/icon-192.png",
  },
  alternates: {
    canonical: "https://drfoam.com.mx",
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
    <html lang="es" className={`${dmSans.variable} ${outfit.variable}`}>
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f2240" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Doctor Foam" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <WhatsAppButton />
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
