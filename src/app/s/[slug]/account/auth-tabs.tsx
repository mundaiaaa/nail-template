"use client";

import { useActionState } from "react";
import { registerCustomerAction, loginCustomerAction, type CustomerActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const initialState: CustomerActionState = {};

export function AuthTabs({ slug }: { slug: string }) {
  const [loginState, loginAction, loginPending] = useActionState(loginCustomerAction, initialState);
  const [registerState, registerAction, registerPending] = useActionState(registerCustomerAction, initialState);

  return (
    <Tabs defaultValue="login" className="w-full max-w-sm">
      <TabsList className="w-full">
        <TabsTrigger value="login" className="flex-1">
          會員登入
        </TabsTrigger>
        <TabsTrigger value="register" className="flex-1">
          註冊會員
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <form action={loginAction} className="flex flex-col gap-4">
          <input type="hidden" name="slug" value={slug} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-email">電子郵件</Label>
            <Input id="login-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-password">密碼</Label>
            <Input id="login-password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {loginState?.error && <p className="text-sm text-destructive">{loginState.error}</p>}
          <Button type="submit" disabled={loginPending} className="bg-[var(--brand)] hover:opacity-90">
            {loginPending ? "登入中…" : "登入"}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="register">
        <form action={registerAction} className="flex flex-col gap-4">
          <input type="hidden" name="slug" value={slug} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-name">姓名</Label>
            <Input id="register-name" name="name" required maxLength={50} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-phone">手機號碼</Label>
            <Input id="register-phone" name="phone" required placeholder="0912345678" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-email">電子郵件</Label>
            <Input id="register-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password">密碼</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {registerState?.error && <p className="text-sm text-destructive">{registerState.error}</p>}
          <Button type="submit" disabled={registerPending} className="bg-[var(--brand)] hover:opacity-90">
            {registerPending ? "註冊中…" : "註冊"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
