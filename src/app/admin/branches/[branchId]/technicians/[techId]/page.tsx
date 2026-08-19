import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkingHoursEditor } from "./working-hours-editor";
import { TimeOffManager } from "./time-off-manager";
import { DeleteTechnicianButton } from "./delete-technician-button";

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ branchId: string; techId: string }>;
}) {
  const { shop } = await requireShop();
  const { branchId, techId } = await params;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) notFound();

  const technician = await db.technician.findFirst({
    where: { id: techId, branchId },
    include: {
      workingHours: { orderBy: { dayOfWeek: "asc" } },
      timeOff: true,
    },
  });
  if (!technician) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/admin/branches/${branchId}/technicians`}
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            ← 返回美甲師列表
          </Link>
          <h1 className="text-2xl font-semibold">{technician.name}</h1>
          <div className="mt-1 flex flex-wrap gap-1">
            {technician.specialties.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <DeleteTechnicianButton branchId={branchId} technicianId={techId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>每週上班時間</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkingHoursEditor branchId={branchId} technicianId={techId} hours={technician.workingHours} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>休假日</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeOffManager branchId={branchId} technicianId={techId} timeOff={technician.timeOff} />
        </CardContent>
      </Card>
    </div>
  );
}
