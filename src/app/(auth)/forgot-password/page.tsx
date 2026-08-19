"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState: AuthActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>忘記密碼</CardTitle>
        <CardDescription>輸入您的電子郵件，我們將寄送重設密碼的連結給您</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.message ? (
          <p className="text-sm text-foreground">{state.message}</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "傳送中…" : "寄送重設連結"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            返回登入
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
