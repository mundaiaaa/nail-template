import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { shopIsBookable } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { PageDecorations } from "./page-decorations";

export default async function ShopLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const bookable = await shopIsBookable(shop.id);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <PageDecorations shopId={shop.id} page="LANDING" />
      <h1 className="text-3xl font-bold">{shop.name}</h1>
      {bookable ? (
        <>
          <p className="max-w-md text-muted-foreground">歡迎預約我們的美甲服務</p>
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
        <>
          <p className="max-w-md text-muted-foreground">
            我們正在準備上線，敬請期待！<br />
            預約功能即將開放。
          </p>
        </>
      )}
    </div>
  );
}
