"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/calendar", label: "行事曆" },
  { href: "/admin/branches", label: "分店管理" },
  { href: "/admin/bookings", label: "預約管理" },
  { href: "/admin/shop", label: "商店設定" },
  { href: "/admin/shop/appearance", label: "外觀設定" },
];

// A nav item is active on an exact match, or on any nested route under it —
// unless a more specific sibling item (e.g. "/admin/shop/appearance" under
// "/admin/shop") matches better, in which case only that sibling lights up.
function isActive(pathname: string, item: (typeof NAV_ITEMS)[number]): boolean {
  if (pathname === item.href) return true;
  if (item.href === "/admin") return false;
  if (!pathname.startsWith(`${item.href}/`)) return false;
  return !NAV_ITEMS.some(
    (other) =>
      other !== item &&
      other.href.startsWith(`${item.href}/`) &&
      (pathname === other.href || pathname.startsWith(`${other.href}/`))
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full rounded-lg bg-card p-1 shadow-sm">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-1 py-2 text-center text-xs font-medium transition-colors sm:px-2 sm:py-2.5 sm:text-sm",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
