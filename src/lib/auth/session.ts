import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import type { User } from "@/generated/prisma/client";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createOwnerSession(userId: string) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const userAgent = (await headers()).get("user-agent") ?? undefined;
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: { userId, tokenHash, userAgent, expiresAt },
  });

  (await cookies()).set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const rawToken = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function requireOwner(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function destroyOwnerSession() {
  const jar = await cookies();
  const rawToken = jar.get(SESSION_COOKIE)?.value;
  if (rawToken) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(rawToken) } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function listOwnerSessions(userId: string) {
  return db.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeOwnerSession(userId: string, sessionId: string) {
  await db.session.deleteMany({ where: { id: sessionId, userId } });
}
