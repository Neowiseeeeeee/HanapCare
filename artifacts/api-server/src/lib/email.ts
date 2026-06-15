const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "noreply@hanapcare.ph";
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? "HanapCare";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (!BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured. Add it to Replit Secrets.");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
      to: [{ email: opts.to }],
      subject: opts.subject,
      htmlContent: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

export function buildPasswordResetEmail(resetUrl: string, fullName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0f172a;padding:28px 36px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;">Hanap<span style="color:#38bdf8;">Care</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 36px 28px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Hi ${fullName}, we received a request to reset the password for your HanapCare account.
                Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${resetUrl}"
                 style="display:inline-block;padding:14px 28px;background:#0ea5e9;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
                Reset password
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                If you didn't request this, you can safely ignore this email — your password won't change.
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#cbd5e1;word-break:break-all;">
                Or paste this link in your browser:<br/>
                <a href="${resetUrl}" style="color:#0ea5e9;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} HanapCare Technologies, Inc. · Philippines
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
