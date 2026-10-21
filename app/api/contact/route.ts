import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TARGET_MAILBOX = "contact@aurasparkles.com";

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export async function POST(request: Request) {
  try {
    const body: ContactPayload = await request.json().catch(() => ({}));
    const { name, email, phone, subject, message } = body;

    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").trim();
    const trimmedMessage = (message || "").trim();
    const trimmedSubject = (subject || "General Customer Enquiry").trim();
    const trimmedPhone = (phone || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return NextResponse.json(
        { error: "Name, email address, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const enquiryId = `ENQ-${Date.now().toString().slice(-6)}`;

    // Prepare mailto fallback URL
    const mailtoSubject = encodeURIComponent(`[Aura Sparkles Enquiry: ${trimmedSubject}] from ${trimmedName}`);
    const mailtoBody = encodeURIComponent(
      `From: ${trimmedName} (${trimmedEmail})\n` +
      `Phone: ${trimmedPhone || "Not provided"}\n` +
      `Enquiry ID: ${enquiryId}\n` +
      `Category: ${trimmedSubject}\n\n` +
      `Message:\n${trimmedMessage}\n\n` +
      `-- Sent via Aura Sparkles Official Storefront (www.aurasparkles.com)`
    );
    const mailtoUrl = `mailto:${TARGET_MAILBOX}?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Server-side audit log
    console.log(`[Aura Sparkles Contact API] Enquiry received:`, {
      enquiryId,
      timestamp,
      recipient: TARGET_MAILBOX,
      from: `${trimmedName} <${trimmedEmail}>`,
      phone: trimmedPhone,
      subject: trimmedSubject,
    });

    // Optional dynamic integration with Resend / SMTP if environment keys are supplied
    const resendApiKey = process.env.RESEND_API_KEY;
    let externalDispatchStatus = "queued_or_logged";

    if (resendApiKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Aura Sparkles Web <noreply@aurasparkles.com>",
            to: [TARGET_MAILBOX],
            reply_to: trimmedEmail,
            subject: `[${trimmedSubject}] from ${trimmedName} (${enquiryId})`,
            html: `
              <div style="font-family: serif; color: #452638; max-width: 600px; padding: 24px; border: 1px solid #EAE0D5; border-radius: 12px;">
                <h2 style="color: #452638; margin-bottom: 8px;">Aura Sparkles — New Customer Enquiry</h2>
                <p style="color: #B69A62; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Enquiry ID: ${enquiryId}</p>
                <hr style="border: none; border-top: 1px solid #EAE0D5; margin: 16px 0;" />
                <p><strong>Customer Name:</strong> ${trimmedName}</p>
                <p><strong>Customer Email:</strong> <a href="mailto:${trimmedEmail}">${trimmedEmail}</a></p>
                <p><strong>Customer Phone:</strong> ${trimmedPhone || "Not provided"}</p>
                <p><strong>Subject / Department:</strong> ${trimmedSubject}</p>
                <div style="background-color: #FAF6F0; padding: 16px; border-radius: 8px; margin-top: 16px;">
                  <p style="margin: 0; font-weight: bold; color: #452638;">Customer Message:</p>
                  <p style="margin-top: 8px; white-space: pre-wrap; color: #766E65;">${trimmedMessage}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #EAE0D5; margin: 24px 0 16px;" />
                <p style="font-size: 11px; color: #766E65;">Dispatched to ${TARGET_MAILBOX}. Reply directly to this email to respond to ${trimmedName} (${trimmedEmail}).</p>
              </div>
            `,
          }),
        });

        if (resendRes.ok) {
          externalDispatchStatus = "dispatched_via_resend";
        } else {
          console.warn("[Aura Sparkles Contact API] Resend dispatch returned non-200:", await resendRes.text());
        }
      } catch (err) {
        console.error("[Aura Sparkles Contact API] Failed external Resend dispatch:", err);
      }
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
      { error: error.message || "Failed to submit enquiry." },
      { status: 500 }
    );
  }
}
