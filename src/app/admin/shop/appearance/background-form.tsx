"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { updatePageBackgroundAction, type AppearanceActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SHOP_PAGES } from "@/lib/validation/appearance";
import type { PageBackground } from "@/generated/prisma/client";

const initialState: AppearanceActionState = {};

export function BackgroundForm({ backgrounds }: { backgrounds: PageBackground[] }) {
  const [page, setPage] = useState<string>(SHOP_PAGES[0].value);
  const [state, formAction, pending] = useActionState(updatePageBackgroundAction, initialState);
  const current = backgrounds.find((b) => b.page === page);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="page">選擇頁面</Label>
        <Select name="page" value={page} onValueChange={(v) => v && setPage(v)}>
          <SelectTrigger id="page" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHOP_PAGES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="backgroundColor">背景顏色（選填）</Label>
        <input
          key={`color-${page}`}
          id="backgroundColor"
          name="backgroundColor"
          type="color"
          defaultValue={current?.backgroundColor ?? "#ffffff"}
          className="h-9 w-14 cursor-pointer rounded border"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="backgroundImage">背景圖片（選填）</Label>
        {current?.backgroundImageKey && (
          <div className="flex items-center gap-3">
            <Image
              src={current.backgroundImageKey}
              alt="背景預覽"
              width={96}
              height={64}
              className="rounded border object-cover"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="clearImage" /> 移除此圖片
            </label>
          </div>
        )}
        <Input key={`image-${page}`} id="backgroundImage" name="backgroundImage" type="file" accept="image/*" />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "儲存中…" : "儲存背景設定"}
      </Button>
    </form>
  );
}
