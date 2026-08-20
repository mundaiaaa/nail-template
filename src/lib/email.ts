import "server-only";
import { mkdir, appendFile } from "fs/promises";
import path from "path";

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

interface EmailService {
  send(message: EmailMessage): Promise<void>;
}

// Dev-only implementation: logs to the console and appends to a local
// JSON-lines file so `/dev/emails` can render a simple inbox for testing
// verification/reset links without any real mail provider configured.
// Swap this out for a real provider (Resend/SMTP/etc.) via EMAIL_PROVIDER
// once one is available — the EmailService interface stays the same.
class ConsoleEmailService implements EmailService {
  private logPath = path.join(process.cwd(), ".data", "emails.log");

  async send(message: EmailMessage): Promise<void> {
    const entry = { ...message, sentAt: new Date().toISOString() };

    console.log(
      `\n--- 📧 Email (dev) ---\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.body}\n----------------------\n`
    );

    // Best-effort only: serverless runtimes (e.g. Vercel) have a read-only
    // filesystem outside /tmp, so this write is expected to fail there.
    // The console.log above is what actually matters — on Vercel it's
    // readable via `vercel logs`. Never let a logging convenience crash
    // the request that's sending a real (dev-mode) email.
    try {
      await mkdir(path.dirname(this.logPath), { recursive: true });
      await appendFile(this.logPath, JSON.stringify(entry) + "\n", "utf-8");
    } catch {
      // ignore — see comment above
    }
  }
}

const emailService: EmailService = new ConsoleEmailService();

export async function sendVerificationEmail(to: string, link: string) {
  await emailService.send({
    to,
    subject: "請驗證您的電子郵件信箱",
    body: `感謝您註冊美甲預約系統！\n\n請點擊以下連結以驗證您的電子郵件信箱：\n${link}\n\n此連結將於 24 小時後失效。若您並未申請此帳號,請忽略此郵件。`,
  });
}

export async function sendPasswordResetEmail(to: string, link: string) {
  await emailService.send({
    to,
    subject: "重設您的密碼",
    body: `我們收到重設您帳號密碼的請求。\n\n請點擊以下連結重設密碼：\n${link}\n\n此連結將於 1 小時後失效。若您並未提出此請求,請忽略此郵件,您的密碼將維持不變。`,
  });
}
