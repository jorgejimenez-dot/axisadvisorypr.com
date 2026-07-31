// Netlify automatically invokes this function on every verified form submission.
// Sends a branded, bilingual acknowledgment to the person who submitted.
// Requires env var RESEND_API_KEY. Sending domain must be verified in Resend.

const FROM     = "AXIS Independent Advisory <info@axisadvisorypr.com>";
const REPLY_TO = "info@axisadvisorypr.com";
const NAVY = "#2B3A52", BRONZE = "#8F6432", MUTED = "#5A6A7E", LINE = "#DDE1E6";

const COPY = {
  en: {
    subject: "We received your message — AXIS Independent Advisory",
    heading: "Message received",
    greet: (n) => (n ? `${n},` : "Hello,"),
    body: [
      "Thank you for reaching out. This note confirms your message reached us.",
      "We review every inquiry personally and will respond within <strong>one business day</strong> with an honest assessment of whether we can help &mdash; and if so, what the engagement would look like.",
      "If your matter is time-sensitive, you can reach us directly by WhatsApp at (787) 830-6462."
    ],
    summaryLabel: "What you sent",
    disclaimer: "This message confirms receipt only. It does not create a professional engagement. An engagement begins only upon execution of a written engagement letter. Any screening figures shown are illustrative and are not an opinion of value.",
    sign: "AXIS Independent Advisory"
  },
  es: {
    subject: "Recibimos su mensaje — AXIS Independent Advisory",
    heading: "Mensaje recibido",
    greet: (n) => (n ? `${n},` : "Hola,"),
    body: [
      "Gracias por comunicarse con nosotros. Esta nota confirma que su mensaje nos llegó.",
      "Revisamos cada consulta personalmente y le responderemos dentro de <strong>un día laborable</strong> con una evaluación honesta de si podemos ayudarle &mdash; y de ser así, cómo sería el encargo.",
      "Si su asunto es urgente, puede comunicarse directamente por WhatsApp al (787) 830-6462."
    ],
    summaryLabel: "Lo que nos envió",
    disclaimer: "Este mensaje confirma recibo únicamente. No constituye un encargo profesional. Un encargo comienza solamente con la firma de una carta de encargo. Cualquier cifra de evaluación mostrada es ilustrativa y no constituye una opinión de valor.",
    sign: "AXIS Independent Advisory"
  }
};

const esc = (s) => String(s || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

function html(c, name, summary) {
  const paras = c.body.map((p) => `<p style="margin:0 0 14px;color:${MUTED};font-size:15px;line-height:1.6">${p}</p>`).join("");
  const summaryBlock = summary
    ? `<div style="margin:22px 0 0;padding:14px 16px;background:#FAFAF8;border:1px solid ${LINE};border-radius:4px">
         <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${NAVY};font-weight:700;margin-bottom:8px">${esc(c.summaryLabel)}</div>
         <pre style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};line-height:1.55;white-space:pre-wrap">${esc(summary)}</pre>
       </div>` : "";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#F4F5F7;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid ${LINE};border-radius:6px">
      <tr><td style="background:${NAVY};padding:20px 28px;border-radius:6px 6px 0 0">
        <div style="color:#fff;font-size:15px;font-weight:700;letter-spacing:.14em">AXIS INDEPENDENT ADVISORY</div>
        <div style="color:#E0C677;font-size:12px;margin-top:3px">Business Valuation &amp; Advisory Services</div>
      </td></tr>
      <tr><td style="padding:28px">
        <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${BRONZE};font-weight:700;margin-bottom:10px">${esc(c.heading)}</div>
        <p style="margin:0 0 14px;color:${NAVY};font-size:16px;font-weight:700">${esc(c.greet(name))}</p>
        ${paras}${summaryBlock}
        <p style="margin:22px 0 0;color:${NAVY};font-size:15px">${esc(c.sign)}<br>
          <a href="mailto:info@axisadvisorypr.com" style="color:${BRONZE}">info@axisadvisorypr.com</a> &middot;
          <a href="https://axisadvisorypr.com" style="color:${BRONZE}">axisadvisorypr.com</a>
        </p>
      </td></tr>
      <tr><td style="padding:16px 28px 22px;border-top:1px solid ${LINE}">
        <p style="margin:0;color:#8A94A3;font-size:11px;line-height:1.5">${esc(c.disclaimer)}</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export default async (req) => {
  // Every path returns 200 on purpose: a confirmation-email failure must never
  // block or retry the visitor's form submission. That makes the logs the only
  // signal, so each outcome is tagged distinctly and greppable in the Netlify
  // function log. Search "[axis-confirm]" to see the full picture.
  const TAG = "[axis-confirm]";
  let formName = "unknown";
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.error(`${TAG} FAIL env — RESEND_API_KEY not set; confirmation skipped`);
      return new Response("no key", { status: 200 });
    }

    const payload = await req.json();
    const d = payload?.payload?.data || {};
    formName = payload?.payload?.form_name || d.form_name || "unknown";
    const to = (d.email || "").trim();
    if (!to) {
      console.warn(`${TAG} SKIP no-email — form="${formName}"; submission stored, no confirmation possible`);
      return new Response("no recipient", { status: 200 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      console.warn(`${TAG} SKIP bad-email — form="${formName}"; address failed validation`);
      return new Response("no recipient", { status: 200 });
    }

    const lang = (d.lang || "").toLowerCase() === "es" ? "es" : "en";
    const c = COPY[lang];
    const summary = d.message || d.summary || "";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM, to: [to], reply_to: REPLY_TO,
        subject: c.subject, html: html(c, (d.name || "").trim(), summary)
      })
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "<unreadable>");
      console.error(`${TAG} FAIL resend — form="${formName}" lang=${lang} status=${res.status} detail=${detail}`);
      return new Response("resend error logged", { status: 200 });
    }

    console.log(`${TAG} OK — form="${formName}" lang=${lang} confirmation sent`);
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(`${TAG} FAIL exception — form="${formName}"`, e);
    return new Response("error logged", { status: 200 });
  }
};
