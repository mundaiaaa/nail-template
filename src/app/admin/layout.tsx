import Link from "next/link";
import { requireShop } from "@/lib/shop";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, shop } = await requireShop();
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "nailbook.tw";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="font-semibold">{shop.name}</span>
          <Link
            href={`/s/${shop.slug}`}
            target="_blank"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            查看網站（{shop.slug}.{platformDomain}）
          </Link>
          {!shop.published && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">未上線</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              登出
            </Button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:flex-row sm:px-6">
        <aside className="w-full shrink-0 sm:w-48">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
