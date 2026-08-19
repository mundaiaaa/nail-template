"use client";

import { useActionState } from "react";
import { resendVerificationAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function ResendVerificationForm() {
  const [state, formAction, pending] = useActionState(resendVerificationAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-center gap-3">
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "寄送中…" : "重新寄送驗證信"}
      </Button>
      {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
    </form>
  );
}
