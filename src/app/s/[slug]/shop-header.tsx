"use client";

import Link from "next/link";
import Image from "next/image";
import { useShop } from "@/lib/shop-context";

export function ShopHeader() {
  const shop = useShop();

  return (
    <header className="border-b bg-background px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
        <Link href={`/s/${shop.slug}`} className="flex min-w-0 items-center gap-2">
          {shop.logoKey ? (
            <Image
              src={shop.logoKey}
              alt={shop.name}
              width={32}
              height={32}
              className="shrink-0 rounded-full object-cover"
            />
          ) : null}
          <span className="truncate text-lg font-semibold">{shop.name}</span>
        </Link>
        <Link
          href={`/s/${shop.slug}/account`}
          className="shrink-0 text-sm text-muted-foreground underline underline-offset-4"
        >
          會員登入
        </Link>
      </div>
    </header>
  );
}
