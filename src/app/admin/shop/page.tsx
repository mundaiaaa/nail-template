import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShopSettingsForm } from "./shop-settings-form";

export default async function ShopSettingsPage() {
  const { shop } = await requireShop();

  return (
    <Card>
      <CardHeader>
        <CardTitle>商店設定</CardTitle>
      </CardHeader>
      <CardContent>
        <ShopSettingsForm shop={shop} />
      </CardContent>
    </Card>
  );
}
