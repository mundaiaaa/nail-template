import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { shopIsBookable } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { cn } from "@/lib/utils";
import { PageDecorations } from "./page-decorations";

export default async function ShopLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const [bookable, background] = await Promise.all([
    shopIsBookable(shop.id),
    db.pageBackground.findUnique({ where: { shopId_page: { shopId: shop.id, page: "LANDING" } } }),
  ]);
  const hasHeroImage = !!background?.backgroundImageKey;
  // A shop that hasn't customized its landing background at all (no image,
  // no color) gets the template's own default hero look instead of a bare
  // page — but the moment an owner sets either, their choice wins untouched.
  const hasCustomBackground = hasHeroImage || !!background?.backgroundColor;
  const useDefaultWallpaper = !hasCustomBackground;

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-3.5 px-4 py-24 text-center",
        hasHeroImage && "min-h-[70vh]",
        useDefaultWallpaper && "min-h-[78vh] bg-cover bg-center py-16"
      )}
      style={useDefaultWallpaper ? { backgroundImage: "url(/brand/hero-wallpaper.jpg)" } : undefined}
    >
      <PageDecorations shopId={shop.id} page="LANDING" />
      {useDefaultWallpaper && (
        <p className="text-xs font-medium tracking-[0.28em] text-muted-foreground">NAIL SALON</p>
      )}
      <h1 className={cn("text-3xl font-bold", hasHeroImage && "text-white drop-shadow-md")}>{shop.name}</h1>
      {useDefaultWallpaper && <Divider />}
      {bookable ? (
        <>
          <p className={cn("max-w-md", hasHeroImage ? "text-white/90 drop-shadow-sm" : "text-muted-foreground")}>
            歡迎預約我們的美甲服務
          </p>
          <Button
            size="lg"
            className="bg-[var(--brand)] text-white hover:opacity-90"
            render={<Link href={`/s/${shop.slug}/book`} />}
            nativeButton={false}
          >
            立即預約
          </Button>
        </>
      ) : (
        <p className={cn("max-w-md", hasHeroImage ? "text-white/90 drop-shadow-sm" : "text-muted-foreground")}>
          我們正在準備上線，敬請期待！
          <br />
          預約功能即將開放。
        </p>
      )}
    </div>
  );
}
