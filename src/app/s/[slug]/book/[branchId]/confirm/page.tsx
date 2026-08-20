import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth/customer-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmForm } from "./confirm-form";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";
import { sumDurationRange, formatDurationRange } from "@/lib/booking/duration";
import { parseServiceIds } from "@/lib/booking/query";

function formatDateTimeTaipei(d: Date): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

export default async function ConfirmBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; branchId: string }>;
  searchParams: Promise<{ serviceIds?: string; technicianId?: string; date?: string; time?: string; rescheduleFrom?: string }>;
}) {
  const { slug, branchId } = await params;
  const { serviceIds: rawServiceIds, technicianId, date, time, rescheduleFrom } = await searchParams;
  const serviceIds = parseServiceIds(rawServiceIds);
  if (!date || !time || serviceIds.length === 0) notFound();

  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  const services = await db.service.findMany({ where: { id: { in: serviceIds }, branchId } });
  if (!branch || services.length !== serviceIds.length) notFound();

  const technician = technicianId ? await db.technician.findFirst({ where: { id: technicianId, branchId } }) : null;
  const customer = await getCurrentCustomer(shop.id);
  const startTime = new Date(time);
  const duration = sumDurationRange(services);
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
      <PageDecorations shopId={shop.id} page="CONFIRM" />
      <div>
        <h1 className="text-xl font-semibold">確認預約</h1>
        <p className="text-sm text-muted-foreground">請確認以下資訊並填寫預約人資料</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>服務項目</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>分店：{branch.name}</p>
          <ul className="list-inside list-disc">
            {services.map((s) => (
              <li key={s.id}>
                {s.name}（{s.category === "ADDON" ? "加購" : "主項目"}） · NT$ {s.price.toLocaleString("zh-TW")}
              </li>
            ))}
          </ul>
          <p>時間：{formatDateTimeTaipei(startTime)}</p>
          <p>預估時長：{formatDurationRange(duration.min, duration.max)}</p>
          {technician && <p>指定美甲師：{technician.name}</p>}
          <p className="font-medium">總價：NT$ {totalPrice.toLocaleString("zh-TW")}</p>
        </CardContent>
      </Card>

      {shop.depositRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">訂金說明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {shop.depositAmount
              ? `此預約需支付訂金 NT$ ${shop.depositAmount.toLocaleString("zh-TW")}，將由店家與您另行確認付款方式。`
              : "此預約需支付訂金，將由店家與您另行確認金額與付款方式。"}
          </CardContent>
        </Card>
      )}

      <ConfirmForm
        slug={slug}
        branchId={branchId}
        serviceIds={rawServiceIds!}
        technicianId={technicianId}
        date={date}
        time={time}
        rescheduleFrom={rescheduleFrom}
        depositRequired={shop.depositRequired}
        loggedInCustomerName={customer?.name}
      />
    </div>
  );
}
