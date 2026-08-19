import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Noto_Sans_TC } from "next/font/google";
import { db } from "@/lib/db";
import { ShopProvider, type PublicShop } from "@/lib/shop-context";
import { ShopHeader } from "./shop-header";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
});

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const publicShop: PublicShop = {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    logoKey: shop.logoKey,
    themeColor: shop.themeColor,
    fontKey: shop.fontKey,
    cancellationEnabled: shop.cancellationEnabled,
    cancellationMinNoticeHrs: shop.cancellationMinNoticeHrs,
    depositRequired: shop.depositRequired,
    depositAmount: shop.depositAmount,
  };

  return (
    <ShopProvider shop={publicShop}>
      <div
        className={`${notoSansTC.variable} flex min-h-screen flex-col`}
        style={
          {
            "--brand": shop.themeColor,
            fontFamily: "var(--shop-font, var(--font-noto-sans-tc))",
          } as CSSProperties
        }
      >
        {shop.fontKey && (
          <style
            // Owner-uploaded fonts are runtime files, not build-time known —
            // next/font can't handle them, so we inject a plain @font-face
            // and point the same --shop-font variable at it.
            dangerouslySetInnerHTML={{
              __html: `@font-face{font-family:'ShopCustomFont';src:url('${shop.fontKey}');font-display:swap;} :root{--shop-font:'ShopCustomFont';}`,
            }}
          />
        )}
        <ShopHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </ShopProvider>
  );
}
