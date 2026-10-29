import { NextResponse } from "next/server";
import { 
  escapeHtml, 
  sanitizeText, 
  sanitizeEmail, 
  sanitizePhone, 
  verifyHoneypot,
  generateCaptchaChallenge,
  verifyCaptchaResponse
} from "@/lib/sanitize";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const TARGET_MAILBOX = process.env.TARGET_MAILBOX || "contact@aurasparkles.com";

// GET endpoint to provide a fresh anti-bot challenge
export async function GET() {
  const challenge = generateCaptchaChallenge();
  return NextResponse.json({
    success: true,
    challenge,
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // 1. Rate Limiting: 4 enquiries per 5 minutes per IP
  const rl = checkRateLimit(`contact:${ip}`, "contactForm");
  if (!rl.allowed) {
    return createRateLimitResponse(
      rl.limit,
      rl.resetSeconds,
      "Too many enquiries submitted. Please wait a few minutes before sending another message."
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, phone, subject, message, _website_hp, captchaToken, captchaAnswer } = body;

    // 2. Anti-bot honeypot check
    if (!verifyHoneypot(body, "_website_hp")) {
      console.warn(`[Aura Security] Bot caught in contact honeypot trap from IP ${ip}`);
      // Return 200 to trick spam bots into thinking submission succeeded
      return NextResponse.json({
        success: true,
        enquiryId: `ENQ-BOT-${Date.now().toString().slice(-4)}`,
        message: "Enquiry logged successfully.",
      });
    }

    // 3. CAPTCHA response check (if challenge was provided)
    if (captchaToken && captchaAnswer) {
      const captchaCheck = verifyCaptchaResponse(captchaToken, captchaAnswer);
      if (!captchaCheck.valid) {
        return NextResponse.json({ error: captchaCheck.error || "Security verification failed." }, { status: 400 });
      }
    }

    // 4. Sanitize and Validate Inputs
    const cleanName = sanitizeText(name, 80);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phone) || sanitizeText(phone, 20);
    const cleanSubject = sanitizeText(subject, 100) || "General Customer Enquiry";
    const cleanMessage = sanitizeText(message, 3000);

    if (!cleanName) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!cleanEmail) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!cleanMessage || cleanMessage.length < 5) {
      return NextResponse.json({ error: "Please enter your message (at least 5 characters)." }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const enquiryId = `ENQ-${Date.now().toString().slice(-6)}`;

    // 5. HTML Escape all content to prevent HTML Injection in mailbox
    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safePhone = escapeHtml(cleanPhone);
    const safeSubject = escapeHtml(cleanSubject);
    const safeMessage = escapeHtml(cleanMessage);

    // Prepare mailto fallback URL
    const mailtoSubject = encodeURIComponent(`[Aura Sparkles Enquiry: ${cleanSubject}] from ${cleanName}`);
    const mailtoBody = encodeURIComponent(
      `From: ${cleanName} (${cleanEmail})\n` +
      `Phone: ${cleanPhone || "Not provided"}\n` +
      `Enquiry ID: ${enquiryId}\n` +
      `Category: ${cleanSubject}\n\n` +
      `Message:\n${cleanMessage}\n\n` +
      `-- Sent via Aura Sparkles Official Storefront (www.aurasparkles.com)`
    );
    const mailtoUrl = `mailto:${TARGET_MAILBOX}?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Server-side audit log
    console.log(`[Aura Sparkles Contact API] Sanitized enquiry received:`, {
      enquiryId,
      timestamp,
      recipient: TARGET_MAILBOX,
      from: `${cleanName} <${cleanEmail}>`,
      ip,
    });

    // 6. Direct SMTP Integration (GoDaddy / Custom SMTP)
    const smtpHost = process.env.SMTP_HOST || "smtpout.secureserver.net";
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const rawPort = process.env.SMTP_PORT;
    const smtpPort = rawPort && rawPort !== "587" ? parseInt(rawPort, 10) : 465;
    const smtpSecure = smtpPort === 465 || process.env.SMTP_SECURE === "true";

    let externalDispatchStatus = "queued_or_logged";

    if (smtpHost && smtpUser && smtpPass && smtpPass !== "Your_GoDaddy_Email_Password_Here") {
      try {
        let nodemailerModule: any = null;
        try {
          const req = eval("require");
          nodemailerModule = req("nodemailer");
        } catch {
          nodemailerModule = null;
        }
        if (nodemailerModule) {
          const nodemailer = nodemailerModule.default || nodemailerModule;
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
          });

          await transporter.sendMail({
            from: `"Aura Sparkles Storefront" <${smtpUser}>`,
            to: TARGET_MAILBOX,
            replyTo: cleanEmail,
            subject: `[Enquiry: ${cleanSubject}] from ${cleanName} (${enquiryId})`,
            text: `Customer Name: ${cleanName}\nEmail: ${cleanEmail}\nPhone: ${cleanPhone || "Not provided"}\nSubject: ${cleanSubject}\nEnquiry ID: ${enquiryId}\n\nMessage:\n${cleanMessage}`,
            html: `
              <div style="font-family: serif; color: #452638; max-width: 600px; padding: 24px; border: 1px solid #EAE0D5; border-radius: 12px;">
                <h2 style="color: #452638; margin-bottom: 8px;">Aura Sparkles — New Customer Enquiry</h2>
                <p style="color: #B69A62; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Enquiry ID: ${enquiryId}</p>
                <hr style="border: none; border-top: 1px solid #EAE0D5; margin: 16px 0;" />
                <p><strong>Customer Name:</strong> ${safeName}</p>
                <p><strong>Customer Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
                <p><strong>Customer Phone:</strong> ${safePhone || "Not provided"}</p>
                <p><strong>Subject / Department:</strong> ${safeSubject}</p>
                <div style="background-color: #FAF6F0; padding: 16px; border-radius: 8px; margin-top: 16px;">
                  <p style="margin: 0; font-weight: bold; color: #452638;">Customer Message:</p>
                  <p style="margin-top: 8px; white-space: pre-wrap; color: #766E65;">${safeMessage}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #EAE0D5; margin: 24px 0 16px;" />
                <p style="font-size: 11px; color: #766E65;">Dispatched to ${TARGET_MAILBOX}. Reply directly to this email to respond to ${safeName} (${safeEmail}).</p>
              </div>
            `,
          });
          externalDispatchStatus = "dispatched_via_smtp";
        }
      } catch (err: any) {
        externalDispatchStatus = `smtp_failed: ${err?.message || err}`;
        console.error("[Aura Sparkles Contact API] SMTP Dispatch Failed:", err);
      }
    } else {
      externalDispatchStatus = "smtp_credentials_not_configured";
    }

    return NextResponse.json({
      success: true,
      enquiryId,
      recipient: TARGET_MAILBOX,
      dispatchStatus: externalDispatchStatus,
      mailtoUrl,
      message: `Enquiry logged successfully and routed to ${TARGET_MAILBOX}.`,
    });
  } catch (error: any) {
    console.error("[Aura Sparkles Contact API] Internal error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry. Please try again or use direct mailto link." },
      { status: 500 }
    );
  }
}
