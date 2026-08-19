"use client";

import Link from "next/link";
import Image from "next/image";
import { useShop } from "@/lib/shop-context";

export function ShopHeader() {
  const shop = useShop();

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6">
      <Link href={`/s/${shop.slug}`} className="flex items-center gap-2">
        {shop.logoKey ? (
          <Image src={shop.logoKey} alt={shop.name} width={32} height={32} className="rounded-full object-cover" />
        ) : null}
        <span className="text-lg font-semibold">{shop.name}</span>
      </Link>
      <Link href={`/s/${shop.slug}/account`} className="text-sm text-muted-foreground underline underline-offset-4">
        會員登入
      </Link>
    </header>
  );
}
