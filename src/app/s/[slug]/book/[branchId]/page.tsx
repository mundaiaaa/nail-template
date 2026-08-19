import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";

export default async function SelectServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; branchId: string }>;
  searchParams: Promise<{ rescheduleFrom?: string }>;
}) {
  const { slug, branchId } = await params;
  const { rescheduleFrom } = await searchParams;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const branch = await db.branch.findFirst({
    where: { id: branchId, shopId: shop.id },
    include: { services: { orderBy: { createdAt: "asc" } } },
  });
  if (!branch) notFound();

  const qs = rescheduleFrom ? `?rescheduleFrom=${rescheduleFrom}` : "";
  const nextStep = branch.assignmentMode === "CUSTOMER_CHOICE" ? "technician" : "slot";

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <PageDecorations shopId={shop.id} page="SERVICE_SELECT" />
      <div>
        <h1 className="text-xl font-semibold">選擇服務項目</h1>
        <p className="text-sm text-muted-foreground">步驟 2 / 4 · {branch.name}</p>
      </div>

      {branch.services.length === 0 ? (
        <p className="text-sm text-muted-foreground">此分店目前尚無可預約的服務項目</p>
      ) : (
        <div className="flex flex-col gap-3">
          {branch.services.map((service) => (
            <Link key={service.id} href={`/s/${slug}/book/${branchId}/${service.id}/${nextStep}${qs}`}>
              <Card className="transition-colors hover:border-foreground/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{service.name}</CardTitle>
                  <span className="text-sm font-medium">NT$ {service.price.toLocaleString("zh-TW")}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{service.durationMinutes} 分鐘</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
