"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BranchTabsClient({ branchId }: { branchId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/admin/branches/${branchId}`, label: "基本資料" },
    { href: `/admin/branches/${branchId}/services`, label: "服務項目" },
    { href: `/admin/branches/${branchId}/technicians`, label: "美甲師" },
  ];

  return (
    <div className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const active =
          tab.label === "基本資料" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
