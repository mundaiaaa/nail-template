import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandingForm } from "./branding-form";
import { FontForm } from "./font-form";
import { BackgroundForm } from "./background-form";
import { StickerEditor } from "./sticker-editor";

export default async function AppearancePage() {
  const { shop } = await requireShop();

  const [backgrounds, stickers] = await Promise.all([
    db.pageBackground.findMany({ where: { shopId: shop.id } }),
    db.pageDecoration.findMany({ where: { shopId: shop.id } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">外觀設定</h1>
        <p className="text-sm text-muted-foreground">自訂您網站的標誌、顏色、背景、字型與貼圖裝飾</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>品牌識別</CardTitle>
          <CardDescription>標誌與主題顏色</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandingForm shop={shop} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>字型</CardTitle>
          <CardDescription>未上傳時使用預設的繁體中文字型</CardDescription>
        </CardHeader>
        <CardContent>
          <FontForm shop={shop} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>頁面背景</CardTitle>
          <CardDescription>為每個頁面分別設定背景顏色或圖片</CardDescription>
        </CardHeader>
        <CardContent>
          <BackgroundForm backgrounds={backgrounds} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>裝飾貼圖</CardTitle>
          <CardDescription>上傳貼圖並拖曳調整位置與大小，如同排版限時動態一樣</CardDescription>
        </CardHeader>
        <CardContent>
          <StickerEditor stickers={stickers} />
        </CardContent>
      </Card>
    </div>
  );
}
