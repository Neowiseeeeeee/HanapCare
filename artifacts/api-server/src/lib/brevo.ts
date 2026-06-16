const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "noreply@hanapcare.ph";
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "HanapCare";

interface SendEmailOptions {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY is not configured");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: opts.to.email, name: opts.to.name ?? opts.to.email }],
      subject: opts.subject,
      htmlContent: opts.html,
      textContent: opts.text,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `Brevo error ${res.status}`);
  }
}

export function passwordResetEmail(opts: {
  fullName: string;
  resetUrl: string;
}): { subject: string; html: string; text: string } {
  const { fullName, resetUrl } = opts;
  const firstName = fullName.split(" ")[0];

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">
        <!-- Header -->
        <tr>
          <td style="background:#0ea5e9;padding:32px 40px;text-align:center">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px">
              Hanap<span style="color:#bae6fd">Care</span>
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px">
            <p style="margin:0 0 8px;color:#0f172a;font-size:18px;font-weight:700">Hi ${firstName},</p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
              We received a request to reset your HanapCare password. Click the button below to choose a new one.
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center" style="padding:8px 0 28px">
                  <a href="${resetUrl}"
                     style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;letter-spacing:0.1px">
                    Reset my password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;line-height:1.5">
              This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email — your password won't change.
            </p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
            <p style="margin:0;color:#cbd5e1;font-size:12px">
              Having trouble with the button?<br>Copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color:#0ea5e9;word-break:break-all">${resetUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
            <p style="margin:0;color:#94a3b8;font-size:12px">
              © ${new Date().getFullYear()} HanapCare Technologies, Inc. · Philippine Healthcare Management System
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${firstName},

We received a request to reset your HanapCare password.

Reset your password here:
${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

— HanapCare Team`;

  return { subject: "Reset your HanapCare password", html, text };
}
