// Edge Function: send-confirmation-email
// Invia l'email di conferma Double Opt-In per la newsletter
// Mittente: events@infosardinya.it (registrazione/conferma)
// Nota: per la newsletter settimanale si userà newsletter@infosardinya.it
// Deploy: npx supabase functions deploy send-confirmation-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================
// CONFIGURAZIONE
// ============================================
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
// Mittente produzione — dominio infosardinya.it verificato su Resend
const FROM_EMAIL = "events@infosardinya.it";
const FROM_NAME = "InfoSardinya Eventi";

// URL base del sito (GitHub Pages)
const SITE_URL = "https://ercolla.github.io/events-infosardinya";

console.log("Send Confirmation Email - Edge Function avviata");

serve(async (req: Request) => {
  // Gestione CORS per chiamate dal frontend
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
    // Legge i dati dalla richiesta
    const { email, token } = await req.json();

    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: "Email e token sono obbligatori" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Link di conferma
    const confirmationLink = `${SITE_URL}/conferma-newsletter.html?token=${token}`;

    // Template HTML dell'email
    const emailHtml = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">
                Events<span style="color: #FF2122;">.</span>InfoSardinya
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">
                Scopri gli eventi in Sardegna
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #0a0a0a; font-size: 20px; font-weight: 700; text-align: center;">
                Non perderti nessun evento
              </h2>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Ciao!
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Abbiamo ricevuto una richiesta di iscrizione alla nostra newsletter settimanale con questo indirizzo email.
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Per confermare la tua iscrizione e iniziare a ricevere i migliori eventi in Sardegna, clicca sul pulsante qui sotto:
              </p>

              <!-- Pulsante CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${confirmationLink}" target="_blank"
                       style="display: inline-block; background-color: #F5C518; color: #0a0a0a; padding: 14px 36px; border-radius: 6px; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Conferma la mia iscrizione
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                Oppure copia e incolla questo link nel tuo browser:
              </p>
              <p style="margin: 0 0 30px; color: #1a73e8; font-size: 13px; word-break: break-all;">
                ${confirmationLink}
              </p>

              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />

              <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                Se non sei stato tu a richiedere l'iscrizione o hai cambiato idea, ignora semplicemente questa email.
                Il tuo indirizzo non verr&agrave; salvato nella nostra lista attiva e non riceverai ulteriori comunicazioni.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                A presto,<br>Il team di <strong>InfoSardinya Eventi</strong>
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
        to: [email],
        subject: "Non perderti nessun evento — Conferma la tua iscrizione",
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

    console.log(`Email di conferma inviata a: ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email di conferma inviata" }),
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
