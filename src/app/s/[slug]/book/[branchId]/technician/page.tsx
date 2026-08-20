import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";
import { parseServiceIds } from "@/lib/booking/query";

export default async function SelectTechnicianPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; branchId: string }>;
  searchParams: Promise<{ serviceIds?: string; rescheduleFrom?: string }>;
}) {
  const { slug, branchId } = await params;
  const { serviceIds: rawServiceIds, rescheduleFrom } = await searchParams;
  const serviceIds = parseServiceIds(rawServiceIds);
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  if (serviceIds.length === 0) {
    redirect(`/s/${slug}/book/${branchId}`);
  }

  const branch = await db.branch.findFirst({
    where: { id: branchId, shopId: shop.id },
    include: { technicians: true },
  });
  const services = await db.service.findMany({ where: { id: { in: serviceIds }, branchId } });
  if (!branch || services.length !== serviceIds.length) notFound();

  const serviceIdsQs = `serviceIds=${rawServiceIds}`;
  const qs = rescheduleFrom ? `&rescheduleFrom=${rescheduleFrom}` : "";

  if (branch.assignmentMode !== "CUSTOMER_CHOICE") {
    redirect(`/s/${slug}/book/${branchId}/slot?${serviceIdsQs}${qs}`);
  }

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <PageDecorations shopId={shop.id} page="TECHNICIAN_SELECT" />
      <div>
        <h1 className="text-xl font-semibold">選擇美甲師</h1>
        <p className="text-sm text-muted-foreground">
          步驟 3 / 4 · {services.map((s) => s.name).join("、")}
        </p>
      </div>

      {branch.technicians.length === 0 ? (
        <p className="text-sm text-muted-foreground">此分店目前尚無可預約的美甲師</p>
      ) : (
        <div className="flex flex-col gap-3">
          {branch.technicians.map((tech) => (
            <Link
              key={tech.id}
              href={`/s/${slug}/book/${branchId}/slot?${serviceIdsQs}&technicianId=${tech.id}${qs}`}
            >
              <Card className="transition-colors hover:border-foreground/30">
                <CardHeader>
                  <CardTitle>{tech.name}</CardTitle>
                </CardHeader>
                {tech.specialties.length > 0 && (
                  <CardContent className="flex flex-wrap gap-1">
                    {tech.specialties.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
