"use client";

import { useActionState, useState } from "react";
import { updateShopSettingsAction, type ShopSettingsState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Shop } from "@/generated/prisma/client";

const initialState: ShopSettingsState = {};

export function ShopSettingsForm({ shop }: { shop: Shop }) {
  const [state, formAction, pending] = useActionState(updateShopSettingsAction, initialState);
  const [published, setPublished] = useState(shop.published);
  const [cancellationEnabled, setCancellationEnabled] = useState(shop.cancellationEnabled);
  const [depositRequired, setDepositRequired] = useState(shop.depositRequired);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">店家名稱</Label>
        <Input id="name" name="name" required maxLength={50} defaultValue={shop.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">網址代稱</Label>
        <Input id="slug" name="slug" required maxLength={30} defaultValue={shop.slug} className="font-mono" />
        <p className="text-xs text-muted-foreground">變更網址代稱將會改變您網站的網址</p>
      </div>

      <label className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">網站上線</p>
          <p className="text-xs text-muted-foreground">關閉後顧客將無法瀏覽您的預約網站</p>
        </div>
        <Switch name="published" checked={published} onCheckedChange={setPublished} />
      </label>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">允許顧客自行取消／改期</p>
            <p className="text-xs text-muted-foreground">關閉後顧客須直接聯繫分店取消或改期</p>
          </div>
          <Switch
            name="cancellationEnabled"
            checked={cancellationEnabled}
            onCheckedChange={setCancellationEnabled}
          />
        </label>
        {cancellationEnabled && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="cancellationMinNoticeHrs">須於預約時間前幾小時取消／改期</Label>
            <Input
              id="cancellationMinNoticeHrs"
              name="cancellationMinNoticeHrs"
              type="number"
              min={1}
              max={720}
              defaultValue={shop.cancellationMinNoticeHrs}
              className="w-32"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">預約需支付訂金</p>
            <p className="text-xs text-muted-foreground">開啟後顧客送出預約前須確認訂金說明</p>
          </div>
          <Switch name="depositRequired" checked={depositRequired} onCheckedChange={setDepositRequired} />
        </label>
        {depositRequired && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="depositAmount">訂金金額（NT$，選填）</Label>
            <Input
              id="depositAmount"
              name="depositAmount"
              type="number"
              min={0}
              defaultValue={shop.depositAmount ?? undefined}
              className="w-32"
            />
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "儲存中…" : "儲存設定"}
      </Button>
    </form>
  );
}
