import "server-only";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import type { Customer } from "@/generated/prisma/client";

const CUSTOMER_SESSION_COOKIE = "customer_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createCustomerSession(customerId: string) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const userAgent = (await headers()).get("user-agent") ?? undefined;
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.customerSession.create({
    data: { customerId, tokenHash, userAgent, expiresAt },
  });

  (await cookies()).set(CUSTOMER_SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Scoped by shopId: a session cookie only resolves to a customer if that
// customer belongs to the shop currently being viewed. This matters both in
// production (subdomains already isolate cookies, but we double-check) and
// in local dev, where every shop is served from the same origin via /s/[slug].
export async function getCurrentCustomer(shopId: string): Promise<Customer | null> {
  const rawToken = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const session = await db.customerSession.findUnique({
    where: { tokenHash },
    include: { customer: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  if (session.customer.shopId !== shopId) return null;
  return session.customer;
}

export async function destroyCustomerSession() {
  const jar = await cookies();
  const rawToken = jar.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (rawToken) {
    await db.customerSession.deleteMany({ where: { tokenHash: hashToken(rawToken) } });
  }
  jar.delete(CUSTOMER_SESSION_COOKIE);
}
