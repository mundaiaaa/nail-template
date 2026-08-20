import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDateTimeTaipei(d: Date): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

export default async function BookingDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { slug } = await params;
  const { bookingId } = await searchParams;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const booking = bookingId
    ? await db.booking.findFirst({
        where: { id: bookingId, branch: { shopId: shop.id } },
        include: { branch: true, technician: true, services: { include: { service: true } } },
      })
    : null;
  if (!booking) notFound();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">預約請求已送出</h1>
      <p className="text-muted-foreground">
        您的預約目前為「待確認」狀態，店家確認後即完成預約，請留意通知。
      </p>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>{booking.services.map((bs) => bs.service.name).join("、")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>分店：{booking.branch.name}</p>
          <p>時間：{formatDateTimeTaipei(booking.startTime)}</p>
          {booking.technician && <p>美甲師：{booking.technician.name}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button render={<Link href={`/s/${slug}/account`} />} nativeButton={false}>
          查看我的預約
        </Button>
        <Button render={<Link href={`/s/${slug}`} />} nativeButton={false} variant="outline">
          回首頁
        </Button>
      </div>
    </div>
  );
}
