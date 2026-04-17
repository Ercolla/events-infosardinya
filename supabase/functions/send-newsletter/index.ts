// Edge Function: send-newsletter
// Invia la newsletter settimanale con gli eventi futuri agli utenti iscritti
// Deploy: npx supabase functions deploy send-newsletter

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// CONFIGURAZIONE
// I valori vengono letti dai Secrets di Supabase
// ============================================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Indirizzo mittente verificato su Resend
const FROM_EMAIL = "newsletter@eventiinsardegna.it";
const FROM_NAME = "Eventi in Sardegna";

console.log("Newsletter Edge Function avviata");

Deno.serve(async (req: Request) => {
  try {
    // ============================================
    // 1. CONNESSIONE AL DATABASE (Service Role = bypassa RLS)
    // ============================================
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ============================================
    // 2. RECUPERA GLI ISCRITTI ALLA NEWSLETTER
    // ============================================
    const { data: subscribers, error: subscribersError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("newsletter_opt_in", true);

    if (subscribersError) {
      console.error("Errore nel recupero iscritti:", subscribersError);
      return new Response(
        JSON.stringify({ error: "Errore nel recupero iscritti" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("Nessun iscritto alla newsletter trovato");
      return new Response(
        JSON.stringify({ message: "Nessun iscritto trovato", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Trovati ${subscribers.length} iscritti`);

    // ============================================
    // 3. RECUPERA GLI EVENTI FUTURI (prossimi 7 giorni)
    // ============================================
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, description, date, date_end, location, time, image, badge_text")
      .gte("date", today)
      .lte("date", nextWeek)
      .order("date", { ascending: true });

    if (eventsError) {
      console.error("Errore nel recupero eventi:", eventsError);
      return new Response(
        JSON.stringify({ error: "Errore nel recupero eventi" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!events || events.length === 0) {
      console.log("Nessun evento in programma per la prossima settimana");
      return new Response(
        JSON.stringify({ message: "Nessun evento in programma", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Trovati ${events.length} eventi per la prossima settimana`);

    // ============================================
    // 4. COSTRUISCI L'HTML DELLA NEWSLETTER
    // ============================================
    const eventsHtml = buildEventsHtml(events);
    const emailHtml = buildNewsletterHtml(eventsHtml);

    // ============================================
    // 5. INVIA LE EMAIL CON RESEND
    // ============================================
    let sentCount = 0;
    let errorCount = 0;

    for (const subscriber of subscribers) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [subscriber.email],
            subject: `Eventi in Sardegna - Settimana del ${formatDate(today)}`,
            html: emailHtml,
          }),
        });

        if (res.ok) {
          sentCount++;
          console.log(`Email inviata a: ${subscriber.email}`);
        } else {
          errorCount++;
          const errBody = await res.text();
          console.error(`Errore invio a ${subscriber.email}:`, errBody);
        }
      } catch (sendError) {
        errorCount++;
        console.error(`Errore invio a ${subscriber.email}:`, sendError);
      }
    }

    console.log(`Newsletter completata: ${sentCount} inviate, ${errorCount} errori`);

    return new Response(
      JSON.stringify({
        message: "Newsletter inviata",
        sent: sentCount,
        errors: errorCount,
        totalSubscribers: subscribers.length,
        totalEvents: events.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Errore generale:", error);
    return new Response(
      JSON.stringify({ error: "Errore interno del server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// ============================================
// FUNZIONI HELPER
// ============================================

// Formatta una data in italiano (es. "21 aprile 2026")
function formatDate(dateStr: string): string {
  const mesi = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${mesi[d.getMonth()]} ${d.getFullYear()}`;
}

// Genera l'HTML per la lista eventi
function buildEventsHtml(events: any[]): string {
  return events
    .map(
      (event) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${
                event.image
                  ? `<td width="120" style="padding-right: 16px; vertical-align: top;">
                      <img src="${event.image}" alt="${event.title}"
                           style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px;" />
                    </td>`
                  : ""
              }
              <td style="vertical-align: top;">
                ${
                  event.badge_text
                    ? `<span style="background-color: #F59E0B; color: #fff; font-size: 11px;
                              padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                        ${event.badge_text}
                      </span><br/>`
                    : ""
                }
                <strong style="font-size: 16px; color: #1e3a5f;">
                  ${event.title}
                </strong><br/>
                <span style="font-size: 13px; color: #6b7280;">
                  ${formatDate(event.date)}${event.time ? ` alle ${event.time}` : ""}
                  ${event.location ? ` &mdash; ${event.location}` : ""}
                </span>
                ${
                  event.description
                    ? `<br/><span style="font-size: 13px; color: #374151;">
                        ${event.description.substring(0, 120)}${event.description.length > 120 ? "..." : ""}
                      </span>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");
}

// ============================================================
// TEMPLATE HTML DELLA NEWSLETTER
// ============================================================
// Puoi sostituire TUTTO il contenuto di questa funzione
// con il tuo template HTML personalizzato.
// La variabile "eventsHtml" contiene le schede degli eventi.
// ============================================================
function buildNewsletterHtml(eventsHtml: string): string {
  return `
  <!DOCTYPE html>
  <html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Newsletter - Eventi in Sardegna</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
                 style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

            <!-- HEADER -->
            <tr>
              <td style="background-color: #1e3a5f; padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                  Eventi in Sardegna
                </h1>
                <p style="color: #93c5fd; margin: 8px 0 0; font-size: 14px;">
                  La tua settimana di eventi nell'isola
                </p>
              </td>
            </tr>

            <!-- CONTENUTO -->
            <tr>
              <td style="padding: 32px;">
                <h2 style="color: #1e3a5f; font-size: 20px; margin: 0 0 8px;">
                  Questa settimana in Sardegna
                </h2>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                  Ecco gli eventi in programma per i prossimi 7 giorni.
                </p>

                <!-- LISTA EVENTI (generata dinamicamente) -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${eventsHtml}
                </table>

                <!-- CTA -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                  <tr>
                    <td align="center">
                      <a href="https://www.eventiinsardegna.it/eventi.html"
                         style="background-color: #F59E0B; color: #ffffff; padding: 14px 32px;
                                text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                        Vedi tutti gli eventi
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ============================================================ -->
            <!-- FOOTER - Dati del Titolare e link disiscrizione              -->
            <!-- Personalizza con i dati di Pf2010 y Asociados SL            -->
            <!-- ============================================================ -->
            <tr>
              <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0 0 8px;">
                  Ricevi questa email perché ti sei iscritto alla newsletter di Eventi in Sardegna.<br/>
                  Titolare del trattamento: Pf2010 y Asociados SL
                </p>
                <p style="font-size: 12px; text-align: center; margin: 0;">
                  <a href="https://www.eventiinsardegna.it/privacy-policy.html"
                     style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
                  &nbsp;|&nbsp;
                  <a href="https://www.eventiinsardegna.it/disiscrizione.html"
                     style="color: #6b7280; text-decoration: underline;">Disiscriviti</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
