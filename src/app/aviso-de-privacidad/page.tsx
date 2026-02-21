import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Aviso de Privacidad | Doctor Foam México",
    description: "Aviso de privacidad de Doctor Foam México. Conoce cómo protegemos tus datos personales.",
    robots: { index: false, follow: false },
};

export default function AvisoDePrivacidad() {
    return (
        <>
            <nav className="navbar navbar-scrolled">
                <div className="navbar-inner">
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.3rem", color: "white" }}>
                            DOCTOR <span className="gradient-text">FOAM</span>
                        </span>
                    </Link>
                </div>
            </nav>

            <main style={{ paddingTop: "6rem" }}>
                <section className="section-padding">
                    <div className="container" style={{ maxWidth: "800px" }}>
                        <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: "2rem" }}>
                            Aviso de Privacidad
                        </h1>

                        <div style={{ color: "#cbd5e1", lineHeight: "1.9", fontSize: "0.95rem" }}>
                            <p style={{ marginBottom: "1.5rem" }}>
                                <strong style={{ color: "white" }}>Doctor Foam México</strong>, con domicilio en la Ciudad de México,
                                es responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
                            </p>

                            <h2 style={{ fontSize: "1.2rem", color: "white", marginTop: "2rem", marginBottom: "1rem" }}>
                                ¿Para qué fines utilizaremos sus datos personales?
                            </h2>
                            <p style={{ marginBottom: "1rem" }}>
                                Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades
                                que son necesarias para el servicio que solicita:
                            </p>
                            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
                                <li style={{ marginBottom: "0.5rem" }}>Agendar y confirmar citas de servicio</li>
                                <li style={{ marginBottom: "0.5rem" }}>Enviar cotizaciones y facturas</li>
                                <li style={{ marginBottom: "0.5rem" }}>Dar seguimiento a servicios realizados</li>
                                <li style={{ marginBottom: "0.5rem" }}>Enviar información sobre promociones y nuevos servicios</li>
                                <li style={{ marginBottom: "0.5rem" }}>Realizar encuestas de satisfacción</li>
                            </ul>

                            <h2 style={{ fontSize: "1.2rem", color: "white", marginTop: "2rem", marginBottom: "1rem" }}>
                                ¿Qué datos personales utilizaremos?
                            </h2>
                            <p style={{ marginBottom: "1rem" }}>
                                Para las finalidades señaladas, requerimos obtener los siguientes datos personales:
                            </p>
                            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
                                <li style={{ marginBottom: "0.5rem" }}>Nombre completo</li>
                                <li style={{ marginBottom: "0.5rem" }}>Teléfono celular</li>
                                <li style={{ marginBottom: "0.5rem" }}>Correo electrónico</li>
                                <li style={{ marginBottom: "0.5rem" }}>Dirección de servicio</li>
                                <li style={{ marginBottom: "0.5rem" }}>Datos del vehículo (marca, modelo, año, color)</li>
                            </ul>

                            <h2 style={{ fontSize: "1.2rem", color: "white", marginTop: "2rem", marginBottom: "1rem" }}>
                                ¿Cómo puede acceder, rectificar o cancelar sus datos personales?
                            </h2>
                            <p style={{ marginBottom: "1.5rem" }}>
                                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos
                                y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección
                                de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación);
                                que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo
                                utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines
                                específicos (Oposición). Estos derechos se conocen como derechos ARCO.
                            </p>

                            <p style={{ marginBottom: "1.5rem" }}>
                                Para el ejercicio de cualquiera de los derechos ARCO, usted deberá enviar su solicitud a través
                                del correo electrónico <strong style={{ color: "var(--color-gold-400)" }}>privacidad@doctorfoam.mx</strong>.
                            </p>

                            <h2 style={{ fontSize: "1.2rem", color: "white", marginTop: "2rem", marginBottom: "1rem" }}>
                                Cambios al aviso de privacidad
                            </h2>
                            <p style={{ marginBottom: "1.5rem" }}>
                                El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas
                                de nuevos requerimientos legales; de nuestras propias necesidades por los servicios que ofrecemos;
                                de nuestras prácticas de privacidad; de cambios en nuestro modelo de negocio, o por otras causas.
                            </p>

                            <p style={{ marginBottom: "1.5rem" }}>
                                Fecha de última actualización: <strong style={{ color: "white" }}>Febrero 2026</strong>.
                            </p>
                        </div>

                        <div style={{ marginTop: "3rem" }}>
                            <Link href="/" style={{ color: "var(--color-gold-400)", textDecoration: "none" }}>
                                ← Volver al inicio
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
