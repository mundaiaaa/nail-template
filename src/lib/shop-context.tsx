"use client";

import { createContext, useContext } from "react";

export interface PublicShop {
  id: string;
  name: string;
  slug: string;
  logoKey: string | null;
  themeColor: string;
  fontKey: string | null;
  cancellationEnabled: boolean;
  cancellationMinNoticeHrs: number;
  depositRequired: boolean;
  depositAmount: number | null;
}

const ShopContext = createContext<PublicShop | null>(null);

export function ShopProvider({ shop, children }: { shop: PublicShop; children: React.ReactNode }) {
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop(): PublicShop {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error("useShop must be used within a ShopProvider");
  return shop;
}
