"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>商家登入</CardTitle>
        <CardDescription>登入以管理您的美甲沙龍</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密碼</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground underline underline-offset-4">
                忘記密碼？
              </Link>
            </div>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "登入中…" : "登入"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          還沒有帳號嗎？{" "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
            立即註冊
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
