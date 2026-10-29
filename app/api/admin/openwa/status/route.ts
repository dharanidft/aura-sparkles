import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Administrator authorization required." }, { status: 401 });
  }

  const baseUrl = process.env.OPENWA_BASE_URL || "http://localhost:2785";
  const apiKey = process.env.OPENWA_API_KEY || "owa_k1_23dff2d2ae23e8ccc174eaeb34b2aee0c4cbf99fdeb8a965edf8013ebc6653ec";
  const sessionTarget = process.env.OPENWA_SESSION_ID || "aura";

  try {
    // 1. Check if OpenWA is alive
    const healthRes = await fetch(`${baseUrl}/api/health`, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    }).catch(() => null);

    if (!healthRes || !healthRes.ok) {
      return NextResponse.json({
        online: false,
        status: "offline",
        message: "OpenWA gateway is not running on port 2785.",
      });
    }

    // 2. Fetch sessions list to find UUID
    const sessionsRes = await fetch(`${baseUrl}/api/sessions`, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });

    if (!sessionsRes.ok) {
      return NextResponse.json({
        online: true,
        status: "auth_error",
        message: "OpenWA returned unauthorized or error.",
      });
    }

    const sessions = await sessionsRes.json();
    let session = Array.isArray(sessions)
      ? sessions.find((s: any) => s.id === sessionTarget || s.name === sessionTarget)
      : null;

    if (!session && Array.isArray(sessions) && sessions.length > 0) {
      session = sessions[0];
    }

    if (!session) {
      return NextResponse.json({
        online: true,
        status: "no_session",
        message: `No active session '${sessionTarget}' found in OpenWA.`,
      });
    }

    let qrCode = null;
    if (session.status === "qr_ready") {
      const qrRes = await fetch(`${baseUrl}/api/sessions/${session.id}/qr`, {
        headers: { "X-API-Key": apiKey },
        cache: "no-store",
      }).catch(() => null);

      if (qrRes && qrRes.ok) {
        const qrData = await qrRes.json();
        qrCode = qrData.qrCode || null;
      }
    }

    return NextResponse.json({
      online: true,
      sessionId: session.id,
      sessionName: session.name,
      status: session.status,
      phone: session.phone,
      pushName: session.pushName,
      qrCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        online: false,
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized. Administrator authorization required." }, { status: 401 });
  }

  const baseUrl = process.env.OPENWA_BASE_URL || "http://localhost:2785";
  const apiKey = process.env.OPENWA_API_KEY || "owa_k1_23dff2d2ae23e8ccc174eaeb34b2aee0c4cbf99fdeb8a965edf8013ebc6653ec";

  try {
    const body = await req.json().catch(() => ({}));
    const { action, phone } = body;

    // Resolve session UUID
    const sessionsRes = await fetch(`${baseUrl}/api/sessions`, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });
    const sessions = await sessionsRes.json();
    const session = Array.isArray(sessions) ? sessions[0] : null;

    if (!session) {
      return NextResponse.json({ success: false, error: "No session found" }, { status: 404 });
    }

    if (action === "restart" || action === "start") {
      const startRes = await fetch(`${baseUrl}/api/sessions/${session.id}/start`, {
        method: "POST",
        headers: { "X-API-Key": apiKey },
      });
      const data = await startRes.json();
      return NextResponse.json({ success: true, data });
    }

    if (action === "test_message" && phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      const chatId = `${cleanPhone}@c.us`;
      const sendRes = await fetch(`${baseUrl}/api/sessions/${session.id}/messages/send-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          chatId,
          text: "✨ Aura Sparkles: WhatsApp Gateway test message! Your WhatsApp OTP service is successfully linked and operational.",
        }),
      });

      const sendData = await sendRes.json();
      return NextResponse.json({ success: sendRes.ok, data: sendData });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
