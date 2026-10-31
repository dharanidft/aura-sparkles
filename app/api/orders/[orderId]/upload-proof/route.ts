import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getStoredOrderById, saveStoredOrder, getUploadsDirectory, sanitizeFileName } from "@/lib/order-store";
import { PaymentProof } from "@/lib/upi-types";
import { dispatchOrderWhatsAppNotification } from "@/lib/whatsapp-notifications";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];

function validateFileBufferMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  // JPEG magic: FF D8 FF
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  // PNG magic: 89 50 4E 47
  if (mimeType.includes("png")) {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  return false;
}

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const formData = await request.formData();

    const accessKey = formData.get("accessKey") as string;
    const utr = (formData.get("utr") as string || "").trim();
    const file = formData.get("screenshot") as File | null;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is missing." }, { status: 400 });
    }

    const order = getStoredOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Security check: Must have valid access key
    if (!accessKey || order.accessKey !== accessKey) {
      return NextResponse.json({ error: "Unauthorized access to order." }, { status: 403 });
    }

    // Validate UTR / Reference ID
    if (!utr || utr.length < 6) {
      return NextResponse.json(
        { error: "Please enter a valid UPI Transaction Reference ID / UTR (at least 6 digits/characters)." },
        { status: 400 }
      );
    }

    // Validate File existence
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Please select a payment screenshot image to upload." }, { status: 400 });
    }

    // Validate File Size (<= 5 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Screenshot file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of 5 MB.` },
        { status: 400 }
      );
    }

    // Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file format. Only JPG, JPEG, and PNG images are supported." },
        { status: 400 }
      );
    }

    // Read bytes and validate actual image magic header
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateFileBufferMagicBytes(buffer, file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "The uploaded file does not match a valid JPG or PNG image header. Please verify your file." },
        { status: 400 }
      );
    }

    // Save screenshot to server's private uploads directory
    const uploadsDir = getUploadsDirectory();
    const ext = file.type.includes("png") ? ".png" : ".jpg";
    const safeFileName = `${sanitizeFileName(orderId)}_${Date.now()}${ext}`;
    const targetFilePath = path.join(uploadsDir, safeFileName);

    fs.writeFileSync(targetFilePath, buffer);

    const now = new Date().toISOString();
    const paymentProof: PaymentProof = {
      orderId: order.orderId,
      transactionReference: utr,
      screenshotStoragePath: targetFilePath,
      screenshotFileName: safeFileName,
      screenshotMimeType: file.type.toLowerCase(),
      fileSizeBytes: file.size,
      submittedAt: now,
      verificationStatus: "PENDING",
    };

    // Update order status to PAYMENT_REVIEW
    const previousStatus = order.paymentStatus;
    order.paymentStatus = "PAYMENT_REVIEW";
    order.updatedAt = now;
    order.proof = paymentProof;

    if (!order.adminAuditLog) {
      order.adminAuditLog = [];
    }
    order.adminAuditLog.push({
      action: "PAYMENT_PROOF_SUBMITTED",
      admin: "CUSTOMER",
      timestamp: now,
      previousStatus,
      newStatus: "PAYMENT_REVIEW",
      reason: `Customer submitted screenshot (${safeFileName}) with UTR: ${utr}`,
    });

    saveStoredOrder(order);

    // Asynchronously trigger PAYMENT_PROOF_SUBMITTED WhatsApp notification
    dispatchOrderWhatsAppNotification("PAYMENT_PROOF_SUBMITTED", order).catch((err) => {
      console.warn("[Aura Orders] Background WhatsApp PAYMENT_PROOF_SUBMITTED failed:", err.message);
    });

    console.log(`[Aura Orders] Payment proof submitted for ${orderId}: UTR=${utr}, Status changed to PAYMENT_REVIEW`);

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully. Your order is awaiting payment verification. We will confirm your order after verifying the transaction.",
      orderId: order.orderId,
      paymentStatus: "PAYMENT_REVIEW",
      submittedAt: now,
    });
  } catch (error: any) {
    console.error("[Aura Orders] Error uploading payment proof:", error);
    return NextResponse.json({ error: error.message || "Failed to upload payment proof." }, { status: 500 });
  }
}
