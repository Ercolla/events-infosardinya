// Edge Function: send-contact-email
// Invia il contenuto del form contatti a events@infosardinya.it
// Mittente: noreply@infosardinya.it — Reply-to: email dell'utente (per rispondere direttamente)
// Deploy: npx supabase functions deploy send-contact-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================
// CONFIGURAZIONE
// ============================================
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
// Mittente: dominio verificato — destinatario: casella ufficiale events@
const FROM_EMAIL = "noreply@infosardinya.it";
const FROM_NAME = "Form Contatti InfoSardinya";
const TO_EMAIL = "events@infosardinya.it";

console.log("Send Contact Email - Edge Function avviata");

// Escape HTML per evitare injection nei campi inseriti dall'utente
function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req: Request) => {
  // Gestione CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Email, oggetto e messaggio sono obbligatori" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Sanitizzazione
    const safeName = escapeHtml(name || "(non fornito)");
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    // Template HTML dell'email verso lo staff
    const emailHtml = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #0077B6; padding: 24px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">
                Nuovo messaggio dal form contatti
              </h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">
                Events InfoSardinya
              </p>
            </td>
          </tr>

          <!-- Dati mittente -->
          <tr>
            <td style="padding: 30px 40px 10px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px; font-weight: 600; width: 110px;">Nome:</td>
                  <td style="padding: 8px 0; color: #111; font-size: 14px;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #111; font-size: 14px;">
                    <a href="mailto:${safeEmail}" style="color: #0077B6; text-decoration: none;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #555; font-size: 14px; font-weight: 600;">Oggetto:</td>
                  <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 600;">${safeSubject}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Messaggio -->
          <tr>
            <td style="padding: 10px 40px 30px;">
              <div style="background: #f8f9fa; border-left: 4px solid #0077B6; padding: 20px; border-radius: 6px;">
                <p style="margin: 0 0 6px; color: #555; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Messaggio
                </p>
                <p style="margin: 0; color: #222; font-size: 15px; line-height: 1.6;">
                  ${safeMessage}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 16px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Rispondi direttamente a questa email per contattare l'utente.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Invio email tramite Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        // Impostando reply_to sull'email dell'utente, lo staff può rispondere
        // direttamente cliccando "Rispondi" nel client email
        reply_to: email,
        subject: `[Contatti] ${subject}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Errore Resend:", resendData);
      return new Response(
        JSON.stringify({ error: "Errore nell'invio dell'email", details: resendData }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`Email contatto inviata da ${email} a ${TO_EMAIL}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

  } catch (err) {
    console.error("Errore nella Edge Function:", err);
    return new Response(
      JSON.stringify({ error: "Errore interno del server" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
