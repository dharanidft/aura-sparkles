import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  adminUser: string;
  ip: string;
  userAgent?: string;
  targetResource?: string;
  details?: Record<string, any>;
  severity?: "INFO" | "WARN" | "CRITICAL";
}

const DATA_DIR = path.join(process.cwd(), "data");
const AUDIT_FILE = path.join(DATA_DIR, "admin-audit.json");
const MAX_AUDIT_ENTRIES = 1000;

function ensureAuditFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify([]), "utf8");
  }
}

export function logAdminAction(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  try {
    ensureAuditFile();
    const id = `AUDIT-${crypto.randomBytes(6).toString("hex")}`;
    const timestamp = new Date().toISOString();

    const fullEntry: AuditLogEntry = {
      id,
      timestamp,
      severity: entry.severity || "INFO",
      ...entry,
    };

    let logs: AuditLogEntry[] = [];
    try {
      const raw = fs.readFileSync(AUDIT_FILE, "utf8");
      logs = JSON.parse(raw);
      if (!Array.isArray(logs)) logs = [];
    } catch {
      logs = [];
    }

    logs.unshift(fullEntry);

    // Keep within capacity
    if (logs.length > MAX_AUDIT_ENTRIES) {
      logs = logs.slice(0, MAX_AUDIT_ENTRIES);
    }

    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), "utf8");

    // Also output to server console for monitoring
    const prefix = fullEntry.severity === "CRITICAL" ? "🔴 [SECURITY ALERT]" : "🛡️ [ADMIN AUDIT]";
    console.log(`${prefix} ${fullEntry.action} by ${fullEntry.adminUser} from ${fullEntry.ip}:`, fullEntry.details || "");
  } catch (err) {
    console.error("[Audit Logger] Failed to record audit log:", err);
  }
}

export function getAuditLogs(limit: number = 100): AuditLogEntry[] {
  try {
    ensureAuditFile();
    const raw = fs.readFileSync(AUDIT_FILE, "utf8");
    const logs = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(logs) ? logs.slice(0, limit) : [];
  } catch {
    return [];
  }
}
