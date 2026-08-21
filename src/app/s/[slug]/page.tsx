import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { shopIsBookable } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageDecorations } from "./page-decorations";

export default async function ShopLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const [bookable, hero] = await Promise.all([
    shopIsBookable(shop.id),
    db.pageBackground.findUnique({ where: { shopId_page: { shopId: shop.id, page: "LANDING" } } }),
  ]);
  const hasHeroImage = !!hero?.backgroundImageKey;

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center",
        hasHeroImage && "min-h-[70vh]"
      )}
    >
      <PageDecorations shopId={shop.id} page="LANDING" />
      <h1 className={cn("text-3xl font-bold", hasHeroImage && "text-white drop-shadow-md")}>{shop.name}</h1>
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
