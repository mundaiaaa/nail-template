"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateBrandingAction, type AppearanceActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Shop } from "@/generated/prisma/client";

const initialState: AppearanceActionState = {};

export function BrandingForm({ shop }: { shop: Shop }) {
  const [state, formAction, pending] = useActionState(updateBrandingAction, initialState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="themeColor">主題顏色</Label>
        <div className="flex items-center gap-3">
          <input
            id="themeColor"
            name="themeColor"
            type="color"
            defaultValue={shop.themeColor}
            className="h-9 w-14 cursor-pointer rounded border"
          />
          <span className="font-mono text-sm text-muted-foreground">{shop.themeColor}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="logo">商店 Logo</Label>
        {shop.logoKey && (
          <Image src={shop.logoKey} alt="Logo" width={64} height={64} className="rounded-full object-cover" />
        )}
        <Input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "儲存中…" : "儲存"}
      </Button>
    </form>
  );
}
