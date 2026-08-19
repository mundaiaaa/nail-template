"use client";

import { useActionState, useRef, useState } from "react";
import { checkSlugAvailability, createShopAction, type OnboardingActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: OnboardingActionState = {};
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "nailbook.tw";

type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "invalid";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createShopAction, initialState);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugMessage, setSlugMessage] = useState<string | undefined>();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSlugChange(value: string) {
    const next = value.toLowerCase();
    setSlug(next);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!next) {
      setSlugStatus("idle");
      setSlugMessage(undefined);
      return;
    }

    setSlugStatus("checking");
    debounceTimer.current = setTimeout(async () => {
      const result = await checkSlugAvailability(next);
      if (!result.available && result.error) {
        setSlugStatus("invalid");
        setSlugMessage(result.error);
      } else if (result.available) {
        setSlugStatus("available");
        setSlugMessage(undefined);
      } else {
        setSlugStatus("unavailable");
        setSlugMessage("此網址代稱已被使用");
      }
    }, 400);
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">店家名稱</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：美甲工作室"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">網址代稱</Label>
        <Input
          id="slug"
          name="slug"
          required
          maxLength={30}
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="my-nail-studio"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          您的網站將會是：<span className="font-mono">{slug || "your-slug"}.{PLATFORM_DOMAIN}</span>
        </p>
        {slugStatus === "checking" && <p className="text-xs text-muted-foreground">檢查中…</p>}
        {slugStatus === "available" && <p className="text-xs text-emerald-600">此網址代稱可以使用</p>}
        {(slugStatus === "unavailable" || slugStatus === "invalid") && (
          <p className="text-xs text-destructive">{slugMessage}</p>
        )}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending || slugStatus === "unavailable" || slugStatus === "invalid"}>
        {pending ? "建立中…" : "建立並上線"}
      </Button>
    </form>
  );
}
