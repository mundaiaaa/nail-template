import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";
import { ServiceSelectForm } from "./service-select-form";
import { parseServiceIds } from "@/lib/booking/query";

export default async function SelectServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; branchId: string }>;
  searchParams: Promise<{ rescheduleFrom?: string; preselect?: string }>;
}) {
  const { slug, branchId } = await params;
  const { rescheduleFrom, preselect } = await searchParams;
  const preselectedIds = parseServiceIds(preselect);
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const branch = await db.branch.findFirst({
    where: { id: branchId, shopId: shop.id },
    include: { services: { orderBy: { createdAt: "asc" } } },
  });
  if (!branch) notFound();

  const mainServices = branch.services.filter((s) => s.category === "MAIN");
  const addonServices = branch.services.filter((s) => s.category === "ADDON");
  const nextStep = branch.assignmentMode === "CUSTOMER_CHOICE" ? "technician" : "slot";

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <PageDecorations shopId={shop.id} page="SERVICE_SELECT" />
      <div>
        <h1 className="text-xl font-semibold">選擇服務項目</h1>
        <p className="text-sm text-muted-foreground">步驟 2 / 4 · {branch.name}</p>
      </div>

      {mainServices.length === 0 ? (
        <p className="text-sm text-muted-foreground">此分店目前尚無可預約的服務項目</p>
      ) : (
        <ServiceSelectForm
          slug={slug}
          branchId={branchId}
          mainServices={mainServices}
          addonServices={addonServices}
          nextStep={nextStep}
          rescheduleFrom={rescheduleFrom}
          preselectedIds={preselectedIds}
        />
      )}
    </div>
  );
}
