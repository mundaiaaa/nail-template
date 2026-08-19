import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth/session";
import type { User, Shop } from "@/generated/prisma/client";

// Full auth+ownership gate used by every admin page and server action:
// must be logged in, verified, and past onboarding (shop created).
export async function requireShop(): Promise<{ user: User; shop: Shop }> {
  const user = await requireOwner();
  if (!user.emailVerified) redirect("/verify-email");

  const shop = await db.shop.findUnique({ where: { ownerId: user.id } });
  if (!shop) redirect("/onboarding");

  return { user, shop };
}

export async function getShopBySlug(slug: string) {
  return db.shop.findUnique({ where: { slug } });
}

// A branch only counts as "bookable" once it has at least one service —
// used to decide between the real booking flow and the "coming soon" state.
export async function shopIsBookable(shopId: string): Promise<boolean> {
  const branchWithService = await db.branch.findFirst({
    where: { shopId, services: { some: {} } },
    select: { id: true },
  });
  return branchWithService !== null;
}
