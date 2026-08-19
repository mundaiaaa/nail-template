import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth/customer-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmForm } from "./confirm-form";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";

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
  params: Promise<{ slug: string; branchId: string; serviceId: string }>;
  searchParams: Promise<{ technicianId?: string; date?: string; time?: string; rescheduleFrom?: string }>;
}) {
  const { slug, branchId, serviceId } = await params;
  const { technicianId, date, time, rescheduleFrom } = await searchParams;
  if (!date || !time) notFound();

  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  const service = await db.service.findFirst({ where: { id: serviceId, branchId } });
  if (!branch || !service) notFound();

  const technician = technicianId ? await db.technician.findFirst({ where: { id: technicianId, branchId } }) : null;
  const customer = await getCurrentCustomer(shop.id);
  const startTime = new Date(time);

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
      <PageDecorations shopId={shop.id} page="CONFIRM" />
      <div>
        <h1 className="text-xl font-semibold">確認預約</h1>
        <p className="text-sm text-muted-foreground">請確認以下資訊並填寫預約人資料</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>分店：{branch.name}</p>
          <p>時間：{formatDateTimeTaipei(startTime)}</p>
          <p>時長：{service.durationMinutes} 分鐘</p>
          {technician && <p>指定美甲師：{technician.name}</p>}
          <p>價格：NT$ {service.price.toLocaleString("zh-TW")}</p>
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
        serviceId={serviceId}
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
