import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TechnicianDialog } from "./technician-dialog";

export default async function TechniciansPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { shop } = await requireShop();
  const { branchId } = await params;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) notFound();

  const technicians = await db.technician.findMany({ where: { branchId }, orderBy: { createdAt: "asc" } });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>美甲師</CardTitle>
          <CardDescription>管理美甲師名單、專長與上班時間</CardDescription>
        </div>
        <TechnicianDialog branchId={branchId} trigger={<Button>新增美甲師</Button>} />
      </CardHeader>
      <CardContent>
        {technicians.length === 0 ? (
          <p className="text-sm text-muted-foreground">尚未新增任何美甲師</p>
        ) : (
          <div className="flex flex-col divide-y">
            {technicians.map((tech) => (
              <div key={tech.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <Link
                    href={`/admin/branches/${branchId}/technicians/${tech.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {tech.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tech.specialties.length === 0 ? (
                      <span className="text-xs text-muted-foreground">未設定專長</span>
                    ) : (
                      tech.specialties.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`/admin/branches/${branchId}/technicians/${tech.id}`}>
                    <Button variant="outline" size="sm">
                      班表設定
                    </Button>
                  </Link>
                  <TechnicianDialog
                    branchId={branchId}
                    technician={tech}
                    trigger={
                      <Button variant="outline" size="sm">
                        編輯
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
