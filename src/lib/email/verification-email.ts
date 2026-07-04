// Plain-HTML verification email (no react-email dependency). Inline styles only,
// since email clients ignore <style>/external CSS.

/** Escape user-supplied values before interpolating into the HTML. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function verificationEmail({
  name,
  verifyUrl,
}: {
  name?: string | null;
  verifyUrl: string;
}): { subject: string; html: string; text: string } {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const safeUrl = escapeHtml(verifyUrl);

  const subject = "Verify your DevStash email";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#141414;border:1px solid #262626;border-radius:12px;padding:32px;">
            <tr>
              <td style="color:#fafafa;font-size:20px;font-weight:600;padding-bottom:16px;">
                DevStash
              </td>
            </tr>
            <tr>
              <td style="color:#d4d4d4;font-size:15px;line-height:1.6;padding-bottom:12px;">
                ${greeting}
              </td>
            </tr>
            <tr>
              <td style="color:#d4d4d4;font-size:15px;line-height:1.6;padding-bottom:24px;">
                Thanks for signing up. Confirm your email address to activate your account.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${safeUrl}" style="display:inline-block;background:#fafafa;color:#0a0a0a;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;">
                  Verify email
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#737373;font-size:13px;line-height:1.6;padding-bottom:8px;">
                Or paste this link into your browser:
              </td>
            </tr>
            <tr>
              <td style="color:#a3a3a3;font-size:13px;line-height:1.6;word-break:break-all;padding-bottom:24px;">
                ${safeUrl}
              </td>
            </tr>
            <tr>
              <td style="color:#737373;font-size:13px;line-height:1.6;border-top:1px solid #262626;padding-top:16px;">
                This link expires in 24 hours. If you didn't create a DevStash account, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${name ? `Hi ${name},` : "Hi there,"}

Thanks for signing up for DevStash. Confirm your email address to activate your account:

${verifyUrl}

This link expires in 24 hours. If you didn't create a DevStash account, you can safely ignore this email.`;

  return { subject, html, text };
}
