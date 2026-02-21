import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Doctor Foam <info@drfoam.com.mx>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@drfoam.com.mx";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type BookingData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageName: string;
  serviceDate: string;
  vehicleInfo: string;
  vehicleSize: string;
  address: string;
  totalAmount: number; // in centavos
  paymentStatus: string;
  source: string;
};

type WelcomeData = {
  customerName: string;
  customerEmail: string;
  setupPasswordLink: string;
};

type ChatNotificationData = {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
};

/* ─── Format helpers ─── */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatCurrency(centavos: number): string {
  return `$${(centavos / 100).toLocaleString("es-MX")} MXN`;
}

/* Shared email header */
function emailHeader(title?: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0f2240;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f2240);padding:2rem;text-align:center;border-bottom:2px solid rgba(96,165,250,0.3);">
      <h1 style="margin:0;color:white;font-size:1.3rem;letter-spacing:2px;">DOCTOR <span style="background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">FOAM</span></h1>
      ${title ? `<p style="color:#94a3b8;margin:0.5rem 0 0;font-size:0.8rem;">${title}</p>` : ""}
    </div>`;
}

function emailFooter() {
  return `
    <div style="padding:1rem 2rem;border-top:1px solid rgba(96,165,250,0.1);text-align:center;">
      <p style="color:#475569;font-size:0.7rem;margin:0;">Doctor Foam México — Detallado Automotriz Premium a Domicilio</p>
      <p style="color:#475569;font-size:0.7rem;margin:0.25rem 0 0;">CDMX y Zona Metropolitana</p>
    </div>
  </div>
</body>
</html>`;
}

/* ═══════════════════════════════════════════════
   1. EMAIL DE BIENVENIDA (nueva cuenta)
   ═══════════════════════════════════════════════ */
export async function sendWelcomeEmail(data: WelcomeData) {
  const { customerName, customerEmail, setupPasswordLink } = data;
  const firstName = customerName.split(" ")[0];

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `🎉 Bienvenido a Doctor Foam, ${firstName}`,
      html: `${emailHeader("Detallado Automotriz Premium a Domicilio")}
    <div style="padding:2rem;">
      <h2 style="color:white;margin:0 0 0.5rem;font-size:1.3rem;">¡Bienvenido, ${firstName}! 🚗✨</h2>
      <p style="color:#cbd5e1;line-height:1.6;">Hemos creado tu cuenta en Doctor Foam. Desde tu portal personal podrás:</p>
      
      <div style="background:rgba(15,34,64,0.6);border:1px solid rgba(96,165,250,0.2);border-radius:12px;padding:1.25rem;margin:1.5rem 0;">
        <ul style="color:#cbd5e1;margin:0;padding-left:1.2rem;line-height:2;font-size:0.9rem;">
          <li>📋 Ver tus servicios contratados</li>
          <li>📅 Reservar nuevos servicios</li>
          <li>💬 Chatear directamente con nuestro equipo</li>
          <li>👤 Administrar tu perfil y vehículos</li>
        </ul>
      </div>

      <p style="color:#cbd5e1;line-height:1.6;">Para activar tu cuenta, configura tu contraseña:</p>

      <div style="text-align:center;margin:2rem 0;">
        <a href="${setupPasswordLink}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;padding:0.85rem 2.5rem;border-radius:8px;font-weight:600;font-size:0.95rem;">🔑 Configurar contraseña</a>
      </div>

      <div style="background:rgba(59,130,246,0.08);border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:1rem;margin:1.5rem 0;">
        <p style="color:#94a3b8;font-size:0.8rem;margin:0;">Una vez configurada, podrás iniciar sesión en <a href="${SITE_URL}/login" style="color:#60a5fa;">${SITE_URL}/login</a></p>
      </div>
    </div>${emailFooter()}`,
    });
    console.log(`✅ Welcome email sent to ${customerEmail}`);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
  }
}

/* ═══════════════════════════════════════════════
   2. CONFIRMACIÓN AL CLIENTE
   ═══════════════════════════════════════════════ */
export async function sendBookingConfirmation(data: BookingData) {
  const { customerName, customerEmail, packageName, serviceDate, vehicleInfo, address, totalAmount } = data;
  const firstName = customerName.split(" ")[0];

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `✅ Tu servicio ${packageName} está confirmado — Doctor Foam`,
      html: `${emailHeader("Detallado Automotriz Premium a Domicilio")}
    <div style="padding:2rem;">
      <h2 style="color:white;margin:0 0 0.5rem;font-size:1.3rem;">¡Hola ${firstName}! 🎉</h2>
      <p style="color:#cbd5e1;line-height:1.6;">Tu servicio ha sido confirmado. Aquí están los detalles:</p>

      <div style="background:rgba(15,34,64,0.6);border:1px solid rgba(96,165,250,0.2);border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;">Servicio</td><td style="padding:0.5rem 0;color:white;text-align:right;font-weight:600;">${packageName}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Fecha</td><td style="padding:0.5rem 0;color:#60a5fa;text-align:right;font-weight:600;border-top:1px solid rgba(96,165,250,0.1);">📅 ${formatDate(serviceDate)}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Vehículo</td><td style="padding:0.5rem 0;color:white;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">🚗 ${vehicleInfo}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Dirección</td><td style="padding:0.5rem 0;color:white;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">📍 ${address}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Total pagado</td><td style="padding:0.5rem 0;color:#34d399;text-align:right;font-weight:700;font-size:1.1rem;border-top:1px solid rgba(96,165,250,0.1);">💳 ${formatCurrency(totalAmount)}</td></tr>
        </table>
      </div>

      <div style="background:rgba(59,130,246,0.08);border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:1rem 1.25rem;margin-bottom:1.5rem;">
        <p style="color:white;font-weight:600;margin:0 0 0.5rem;font-size:0.9rem;">¿Qué sigue?</p>
        <ul style="color:#cbd5e1;margin:0;padding-left:1.2rem;line-height:1.8;font-size:0.85rem;">
          <li>Nos comunicaremos contigo un día antes para confirmar horario</li>
          <li>Asegúrate de que el vehículo esté accesible en la dirección indicada</li>
          <li>El servicio toma entre 3-6 horas dependiendo del paquete</li>
        </ul>
      </div>

      <div style="text-align:center;margin:1.5rem 0;">
        <a href="${SITE_URL}/mi-cuenta" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;padding:0.75rem 2rem;border-radius:8px;font-weight:600;font-size:0.9rem;">📋 Ver mis servicios</a>
        <a href="${SITE_URL}/mi-cuenta/chat" style="display:inline-block;background:rgba(59,130,246,0.15);color:#60a5fa;text-decoration:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;font-size:0.9rem;margin-left:0.5rem;border:1px solid rgba(59,130,246,0.3);">💬 Chat con nosotros</a>
      </div>
    </div>${emailFooter()}`,
    });
    console.log(`✅ Booking confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error("❌ Error sending booking confirmation:", error);
  }
}

/* ═══════════════════════════════════════════════
   3. NOTIFICACIÓN AL ADMIN (NUEVA RESERVA)
   ═══════════════════════════════════════════════ */
export async function sendAdminNotification(data: BookingData) {
  const { customerName, customerEmail, customerPhone, packageName, serviceDate, vehicleInfo, vehicleSize, address, totalAmount, source } = data;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🆕 Nueva reserva: ${packageName} — ${customerName}`,
      html: `${emailHeader()}
    <div style="padding:1.5rem 2rem;">
      <h2 style="color:white;margin:0 0 1rem;font-size:1.1rem;">🆕 Nueva Reserva</h2>
      <div style="background:rgba(15,34,64,0.6);border:1px solid rgba(96,165,250,0.2);border-radius:12px;padding:1.25rem;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;">Cliente</td><td style="padding:0.4rem 0;color:white;text-align:right;font-weight:600;">${customerName}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Email</td><td style="padding:0.4rem 0;color:#60a5fa;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">${customerEmail}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Teléfono</td><td style="padding:0.4rem 0;color:white;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">${customerPhone || "—"}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Servicio</td><td style="padding:0.4rem 0;color:white;text-align:right;font-weight:600;border-top:1px solid rgba(96,165,250,0.1);">${packageName}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Fecha</td><td style="padding:0.4rem 0;color:#fbbf24;text-align:right;font-weight:700;border-top:1px solid rgba(96,165,250,0.1);">📅 ${formatDate(serviceDate)}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Vehículo</td><td style="padding:0.4rem 0;color:white;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">${vehicleInfo} (${vehicleSize})</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Dirección</td><td style="padding:0.4rem 0;color:white;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">📍 ${address}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Total</td><td style="padding:0.4rem 0;color:#34d399;text-align:right;font-weight:700;font-size:1.1rem;border-top:1px solid rgba(96,165,250,0.1);">${formatCurrency(totalAmount)}</td></tr>
          <tr><td style="padding:0.4rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Origen</td><td style="padding:0.4rem 0;color:#94a3b8;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">${source === "online" ? "🌐 En línea (Stripe)" : "📋 Manual (Admin)"}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin-top:1.25rem;">
        <a href="${SITE_URL}/admin" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;padding:0.6rem 1.5rem;border-radius:8px;font-weight:600;font-size:0.85rem;">📊 Ver Dashboard</a>
        <a href="${SITE_URL}/admin/mensajes" style="display:inline-block;background:rgba(59,130,246,0.15);color:#60a5fa;text-decoration:none;padding:0.6rem 1.5rem;border-radius:8px;font-weight:600;font-size:0.85rem;margin-left:0.5rem;border:1px solid rgba(59,130,246,0.3);">💬 Mensajes</a>
      </div>
    </div>${emailFooter()}`,
    });
    console.log("✅ Admin notification email sent");
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
  }
}

/* ═══════════════════════════════════════════════
   4. NOTIFICACIÓN DE NUEVO MENSAJE
   ═══════════════════════════════════════════════ */
export async function sendChatNotification(data: ChatNotificationData) {
  const { recipientEmail, recipientName, senderName, messagePreview } = data;
  const firstName = recipientName.split(" ")[0];

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `💬 Nuevo mensaje de ${senderName} — Doctor Foam`,
      html: `${emailHeader()}
    <div style="padding:2rem;">
      <h2 style="color:white;margin:0 0 1rem;font-size:1.1rem;">Hola ${firstName}, tienes un nuevo mensaje</h2>
      <div style="background:rgba(15,34,64,0.6);border:1px solid rgba(96,165,250,0.2);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;">
        <p style="color:#94a3b8;font-size:0.8rem;margin:0 0 0.5rem;">${senderName} escribió:</p>
        <p style="color:#cbd5e1;font-size:0.95rem;margin:0;line-height:1.6;">"${messagePreview}"</p>
      </div>
      <div style="text-align:center;">
        <a href="${SITE_URL}/mi-cuenta/chat" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;padding:0.75rem 2rem;border-radius:8px;font-weight:600;font-size:0.9rem;">💬 Responder</a>
      </div>
    </div>${emailFooter()}`,
    });
    console.log(`✅ Chat notification sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Error sending chat notification:", error);
  }
}

/* ═══════════════════════════════════════════════
   5. RECORDATORIO PRE-SERVICIO (24h antes)
   ═══════════════════════════════════════════════ */
export async function sendServiceReminder(data: { customerName: string; customerEmail: string; packageName: string; serviceDate: string; address: string }) {
  const firstName = data.customerName.split(" ")[0];

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `⏰ Tu servicio es mañana — Doctor Foam`,
      html: `${emailHeader("Recordatorio de servicio")}
    <div style="padding:2rem;">
      <h2 style="color:white;margin:0 0 0.5rem;font-size:1.3rem;">¡${firstName}, tu servicio es mañana! 🚗</h2>
      <p style="color:#cbd5e1;line-height:1.6;">Te recordamos que tienes programado:</p>

      <div style="background:rgba(15,34,64,0.6);border:1px solid rgba(96,165,250,0.2);border-radius:12px;padding:1.25rem;margin:1.5rem 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;">Servicio</td><td style="padding:0.5rem 0;color:white;text-align:right;font-weight:600;">${data.packageName}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Fecha</td><td style="padding:0.5rem 0;color:#fbbf24;text-align:right;font-weight:700;border-top:1px solid rgba(96,165,250,0.1);">📅 ${formatDate(data.serviceDate)}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#64748b;font-size:0.85rem;border-top:1px solid rgba(96,165,250,0.1);">Dirección</td><td style="padding:0.5rem 0;color:white;text-align:right;border-top:1px solid rgba(96,165,250,0.1);">📍 ${data.address}</td></tr>
        </table>
      </div>

      <div style="background:rgba(251,191,36,0.08);border-left:3px solid #fbbf24;border-radius:0 8px 8px 0;padding:1rem;">
        <p style="color:#fbbf24;font-weight:600;margin:0 0 0.3rem;font-size:0.85rem;">Recuerda:</p>
        <p style="color:#cbd5e1;font-size:0.85rem;margin:0;line-height:1.6;">Asegúrate de que el vehículo esté accesible. Si necesitas hacer cambios, contáctanos por el chat.</p>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <a href="${SITE_URL}/mi-cuenta/chat" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;padding:0.75rem 2rem;border-radius:8px;font-weight:600;font-size:0.9rem;">💬 Contactar al equipo</a>
      </div>
    </div>${emailFooter()}`,
    });
    console.log(`✅ Service reminder sent to ${data.customerEmail}`);
  } catch (error) {
    console.error("❌ Error sending service reminder:", error);
  }
}

/* ═══════════════════════════════════════════════
   CONVENIENCE: Send booking emails
   ═══════════════════════════════════════════════ */
export async function sendBookingEmails(data: BookingData) {
  await Promise.all([
    sendBookingConfirmation(data),
    sendAdminNotification(data),
  ]);
}
