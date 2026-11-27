export interface EmailTemplateResult {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapLayout(title: string, bodyHtml: string, footerNote?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F7F5F2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E5E0D8;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid #F0ECE6;">
              <span style="font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#111111;">JaniduDev</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-size:15px;line-height:1.65;color:#262626;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#FAF9F6;border-top:1px solid #F0ECE6;font-size:12px;color:#6E6A63;line-height:1.5;">
              ${footerNote ?? "Sent securely from JaniduDev Portfolio &amp; Admin Dashboard."}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildOtpEmail(code: string, purposeLabel: string): EmailTemplateResult {
  const safeCode = escapeHtml(code);
  const safePurpose = escapeHtml(purposeLabel);
  return {
    subject: `Your JaniduDev verification code: ${code}`,
    html: wrapLayout(
      "Verification Code",
      `<p style="margin:0 0 16px;">Use the 6-digit code below to ${safePurpose}:</p>
       <div style="margin:24px 0;padding:18px 24px;background-color:#FAF9F6;border:1px solid #E5E0D8;border-radius:12px;text-align:center;">
         <span style="font-size:32px;font-weight:700;letter-spacing:0.25em;color:#111111;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${safeCode}</span>
       </div>
       <p style="margin:0 0 12px;color:#525252;font-size:14px;">This code expires in <strong>5 minutes</strong> and can only be used once.</p>
       <p style="margin:0;color:#737373;font-size:13px;">If you did not request this code, you can safely ignore this email.</p>`
    ),
    text: `Your JaniduDev verification code to ${purposeLabel} is: ${code}\n\nThis code expires in 5 minutes. If you did not request this, ignore this email.`,
  };
}

export function buildPasswordResetEmail(resetUrl: string): EmailTemplateResult {
  const safeUrl = escapeHtml(resetUrl);
  return {
    subject: "Reset your JaniduDev Admin password",
    html: wrapLayout(
      "Reset Your Password",
      `<h2 style="margin:0 0 14px;font-size:20px;color:#111111;">Reset your admin password</h2>
       <p style="margin:0 0 20px;">Click the button below to choose a new password for your JaniduDev Admin Dashboard. This link expires in 30 minutes.</p>
       <p style="margin:24px 0;">
         <a href="${safeUrl}" style="display:inline-block;padding:12px 24px;background-color:#111111;color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Choose a New Password</a>
       </p>
       <p style="margin:0;color:#737373;font-size:13px;">If you did not ask to reset your password, you can safely ignore this email.</p>`
    ),
    text: `Reset your JaniduDev Admin password using this link (expires in 30 minutes):\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  };
}

export function buildEmailVerificationEmail(verifyUrl: string): EmailTemplateResult {
  const safeUrl = escapeHtml(verifyUrl);
  return {
    subject: "Confirm your JaniduDev Admin email",
    html: wrapLayout(
      "Confirm Your Email",
      `<h2 style="margin:0 0 14px;font-size:20px;color:#111111;">Confirm your email address</h2>
       <p style="margin:0 0 20px;">Click the button below to confirm your email address for the JaniduDev Admin Dashboard.</p>
       <p style="margin:24px 0;">
         <a href="${safeUrl}" style="display:inline-block;padding:12px 24px;background-color:#111111;color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Confirm Email Address</a>
       </p>`
    ),
    text: `Confirm your JaniduDev Admin email address:\n${verifyUrl}`,
  };
}

export function buildSecurityAlertEmail(eventDescription: string): EmailTemplateResult {
  const safeEvent = escapeHtml(eventDescription);
  return {
    subject: "Security update on your JaniduDev Admin account",
    html: wrapLayout(
      "Security Update",
      `<h2 style="margin:0 0 14px;font-size:20px;color:#111111;">Account security update</h2>
       <p style="margin:0 0 16px;">${safeEvent}</p>
       <p style="margin:0;color:#525252;font-size:14px;">If this was you, no action is needed. If you did not make this change, sign in right away and reset your password.</p>`
    ),
    text: `Account security update: ${eventDescription}\n\nIf you did not make this change, reset your password immediately.`,
  };
}

export function buildNewEnquiryAdminEmail(params: {
  name: string;
  email: string;
  businessName?: string | null;
  country?: string | null;
  selectedDesign?: string | null;
  message: string;
  dashboardUrl: string;
}): EmailTemplateResult {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safeBiz = params.businessName ? escapeHtml(params.businessName) : "Not provided";
  const safeCountry = params.country ? escapeHtml(params.country) : "Not provided";
  const safeDesign = params.selectedDesign ? escapeHtml(params.selectedDesign) : "Not specified";
  const safeMsg = escapeHtml(params.message).replace(/\n/g, "<br/>");
  const safeDash = escapeHtml(params.dashboardUrl);

  return {
    subject: `New client enquiry from ${params.name}${params.businessName ? ` (${params.businessName})` : ""}`,
    html: wrapLayout(
      "New Client Enquiry",
      `<h2 style="margin:0 0 16px;font-size:20px;color:#111111;">You have a new client enquiry</h2>
       <table role="presentation" width="100%" cellspacing="0" cellpadding="6" style="background-color:#FAF9F6;border-radius:10px;border:1px solid #E5E0D8;margin-bottom:18px;font-size:14px;">
         <tr><td style="color:#6E6A63;width:130px;"><strong>Name</strong></td><td>${safeName}</td></tr>
         <tr><td style="color:#6E6A63;"><strong>Email</strong></td><td><a href="mailto:${safeEmail}" style="color:#111111;">${safeEmail}</a></td></tr>
         <tr><td style="color:#6E6A63;"><strong>Business</strong></td><td>${safeBiz}</td></tr>
         <tr><td style="color:#6E6A63;"><strong>Country</strong></td><td>${safeCountry}</td></tr>
         <tr><td style="color:#6E6A63;"><strong>Style / Interest</strong></td><td>${safeDesign}</td></tr>
       </table>
       <div style="padding:16px;background-color:#FFFFFF;border:1px solid #E5E0D8;border-radius:10px;margin-bottom:22px;font-size:14px;">
         ${safeMsg}
       </div>
       <p style="margin:0;">
         <a href="${safeDash}" style="display:inline-block;padding:12px 22px;background-color:#111111;color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">Open in Dashboard</a>
       </p>`
    ),
    text: `New client enquiry from ${params.name} (${params.email})\nBusiness: ${params.businessName || "Not provided"}\nCountry: ${params.country || "Not provided"}\nInterest: ${params.selectedDesign || "Not specified"}\n\nMessage:\n${params.message}\n\nView in dashboard: ${params.dashboardUrl}`,
  };
}

export function buildEnquiryAcknowledgementEmail(params: {
  name: string;
  businessName?: string | null;
}): EmailTemplateResult {
  const safeName = escapeHtml(params.name);
  return {
    subject: "Thanks for reaching out to JaniduDev",
    html: wrapLayout(
      "Enquiry Received",
      `<h2 style="margin:0 0 14px;font-size:20px;color:#111111;">Thank you, ${safeName}!</h2>
       <p style="margin:0 0 16px;">I have received your message${params.businessName ? ` about <strong>${escapeHtml(params.businessName)}</strong>` : ""} and will review it personally.</p>
       <p style="margin:0 0 16px;">I typically reply within <strong>24 hours</strong> with clear next steps, a rough timeline, and a tailored recommendation.</p>
       <p style="margin:0;color:#525252;">Best regards,<br/><strong>Janidu Dev</strong></p>`,
      "You received this confirmation because you submitted an enquiry at janidudev.com."
    ),
    text: `Thank you, ${params.name}!\n\nI have received your message and will reply within 24 hours with clear next steps.\n\nBest regards,\nJanidu Dev`,
  };
}
