import nodemailer from 'nodemailer';

export async function sendEmail(to, subject, html, from) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM = from || process.env.FROM_EMAIL || 'Amahle Blue <noreply@amahle-blue.co.za>';
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

  if (RESEND_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
      });
      if (res.ok) return { ok: true };
      const text = await res.text();
      console.warn('[email] Resend failed:', text);
    } catch (e) {
      console.warn('[email] Resend fetch error:', e.message);
    }
  }

  if (GMAIL_USER && GMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_PASS },
      });
      await transporter.sendMail({
        from: `Amahle Blue <${GMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html,
      });
      return { ok: true };
    } catch (e) {
      console.error('[email] Gmail SMTP error:', e.message);
    }
  }

  const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'production';
  if (isLocal) {
    console.log(`[DEV-EMAIL-LOG] To: ${to} | Subject: ${subject}`);
    return { ok: true, dev: true };
  }

  console.error('[email] No email provider configured or all providers failed');
  return { ok: false };
}

