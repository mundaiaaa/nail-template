import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyEmailToken } from "@/lib/auth/verify";
import { ResendVerificationForm } from "./resend-form";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    const result = await verifyEmailToken(token);
    return (
      <Card>
        <CardHeader>
          <CardTitle>電子郵件驗證</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          {result === "ok" || result === "already-verified" ? (
            <>
              <p className="text-sm text-foreground">您的電子郵件已成功驗證！</p>
              <Button render={<Link href="/admin" />} nativeButton={false}>
                前往管理後台
              </Button>
            </>
          ) : (
            <p className="text-sm text-destructive">驗證連結無效或已過期，請重新寄送驗證信。</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const user = await getCurrentUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>請驗證您的電子郵件</CardTitle>
        <CardDescription>
          我們已寄送一封驗證信至 {user?.email ?? "您的信箱"}，請點擊信中連結完成驗證。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {user ? (
          <ResendVerificationForm />
        ) : (
          <Button render={<Link href="/login" />} nativeButton={false} variant="outline">
            前往登入
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
