import "server-only";
import { db } from "@/lib/db";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function siteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

export async function issueAndSendVerificationEmail(userId: string, email: string) {
  const rawToken = generateRawToken();
  await db.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
    },
  });
  await sendVerificationEmail(email, siteUrl(`/verify-email?token=${rawToken}`));
}

export type VerifyEmailResult = "ok" | "already-verified" | "invalid";

export async function verifyEmailToken(rawToken: string): Promise<VerifyEmailResult> {
  const tokenHash = hashToken(rawToken);
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) return "invalid";
  if (record.user.emailVerified) return "already-verified";
  if (record.usedAt || record.expiresAt < new Date()) return "invalid";

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    db.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return "ok";
}

export async function issueAndSendPasswordResetEmail(userId: string, email: string) {
  const rawToken = generateRawToken();
  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  await sendPasswordResetEmail(email, siteUrl(`/reset-password?token=${rawToken}`));
}

export async function findValidPasswordResetToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  return record;
}
