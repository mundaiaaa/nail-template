"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">新密碼</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        <p className="text-xs text-muted-foreground">至少 8 個字元</p>
      </div>
      {state?.error && (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{state.error}</p>
          <Link href="/forgot-password" className="text-sm underline underline-offset-4">
            重新申請重設連結
          </Link>
        </div>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "更新中…" : "更新密碼"}
      </Button>
    </form>
  );
}
