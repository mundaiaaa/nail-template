"use client";

import { useActionState } from "react";
import { uploadFontAction, removeFontAction, type AppearanceActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Shop } from "@/generated/prisma/client";

const initialState: AppearanceActionState = {};

export function FontForm({ shop }: { shop: Shop }) {
  const [state, formAction, pending] = useActionState(uploadFontAction, initialState);

  return (
    <div className="flex max-w-md flex-col gap-4">
      <p className="text-sm">
        目前字型：<span className="font-medium">{shop.fontName ?? "預設字型（Noto Sans TC）"}</span>
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="font">上傳自訂字型檔案</Label>
          <Input id="font" name="font" type="file" accept=".ttf,.otf,.woff,.woff2" />
          <p className="text-xs text-muted-foreground">支援 .ttf、.otf、.woff、.woff2 格式</p>
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "上傳中…" : "上傳字型"}
        </Button>
      </form>
      {shop.fontKey && (
        <form action={removeFontAction}>
          <Button type="submit" variant="outline">
            恢復預設字型
          </Button>
        </form>
      )}
    </div>
  );
}
