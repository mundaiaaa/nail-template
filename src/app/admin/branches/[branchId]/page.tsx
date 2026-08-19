import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchInfoForm } from "./branch-info-form";
import { BusinessHoursEditor } from "./business-hours-editor";

export default async function BranchDetailPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { shop } = await requireShop();
  const { branchId } = await params;

  const branch = await db.branch.findFirst({
    where: { id: branchId, shopId: shop.id },
    include: { businessHours: { orderBy: { dayOfWeek: "asc" } } },
  });
  if (!branch) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>基本資料</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchInfoForm branch={branch} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>營業時間</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessHoursEditor branchId={branch.id} hours={branch.businessHours} />
        </CardContent>
      </Card>
    </div>
  );
}
