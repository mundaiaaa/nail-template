import Image from "next/image";
import { db } from "@/lib/db";
import type { ShopPage } from "@/generated/prisma/enums";

// Renders a shop-owner-configured background (color and/or image) as a
// fixed full-bleed layer behind page content, and any decorative stickers
// placed on this specific page as absolutely-positioned images on top.
export async function PageDecorations({ shopId, page }: { shopId: string; page: ShopPage }) {
  const [background, stickers] = await Promise.all([
    db.pageBackground.findUnique({ where: { shopId_page: { shopId, page } } }),
    db.pageDecoration.findMany({ where: { shopId, page } }),
  ]);

  if (!background && stickers.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {background?.backgroundColor && (
        <div className="absolute inset-0" style={{ backgroundColor: background.backgroundColor }} />
      )}
      {background?.backgroundImageKey && (
        <>
          <Image src={background.backgroundImageKey} alt="" fill className="object-cover" priority />
          {page === "LANDING" && (
            // Dark gradient so the hero heading/CTA stay readable over an
            // arbitrary uploaded photo — only applied on the landing page,
            // where the background doubles as a hero banner.
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
          )}
        </>
      )}
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="absolute"
          style={{
            left: `${sticker.xPct}%`,
            top: `${sticker.yPct}%`,
            width: `${sticker.widthPct}%`,
            height: `${sticker.heightPct}%`,
            transform: `rotate(${sticker.rotationDeg}deg)`,
            zIndex: sticker.zIndex,
          }}
        >
          <Image src={sticker.imageKey} alt="" fill className="object-contain" />
        </div>
      ))}
    </div>
  );
}
