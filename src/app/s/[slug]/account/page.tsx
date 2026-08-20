import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth/customer-session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthTabs } from "./auth-tabs";
import { logoutCustomerAction } from "./actions";
import { CustomerBookingsList } from "./customer-bookings-list";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";

export default async function AccountPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const customer = await getCurrentCustomer(shop.id);

  if (!customer) {
    return (
      <div className="relative flex flex-1 flex-col items-center gap-6 px-4 py-16">
        <PageDecorations shopId={shop.id} page="ACCOUNT" />
        <h1 className="text-xl font-semibold">會員專區</h1>
        <AuthTabs slug={slug} />
      </div>
    );
  }

  const bookings = await db.booking.findMany({
    where: { customerId: customer.id },
    include: { branch: true, service: true, technician: true },
    orderBy: { startTime: "desc" },
  });

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageDecorations shopId={shop.id} page="ACCOUNT" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{customer.name}，您好</h1>
          <p className="truncate text-sm text-muted-foreground">
            {customer.email} · {customer.phone}
          </p>
        </div>
        <form action={logoutCustomerAction}>
          <input type="hidden" name="slug" value={slug} />
          <Button type="submit" variant="outline" size="sm">
            登出
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>我的預約</CardTitle>
          <CardDescription>查看與管理您的預約紀錄</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerBookingsList slug={slug} shop={shop} bookings={bookings} />
        </CardContent>
      </Card>
    </div>
  );
}
