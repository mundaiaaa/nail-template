import Link from "next/link";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateBranchDialog } from "./create-branch-dialog";

const ASSIGNMENT_MODE_LABELS: Record<string, string> = {
  CUSTOMER_CHOICE: "顧客自行指定",
  RANDOM: "系統隨機指派",
  SKILL_MATCH: "依專長自動指派",
};

export default async function BranchesPage() {
  const { shop } = await requireShop();
  const branches = await db.branch.findMany({
    where: { shopId: shop.id },
    include: { _count: { select: { services: true, technicians: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">分店管理</h1>
          <p className="text-sm text-muted-foreground">管理分店資訊、營業時間、服務項目與美甲師</p>
        </div>
        <CreateBranchDialog />
      </div>

      {branches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>尚未新增分店</CardTitle>
            <CardDescription>新增第一間分店以開始設定服務項目與美甲師</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Link key={branch.id} href={`/admin/branches/${branch.id}`}>
              <Card className="h-full transition-colors hover:border-foreground/30">
                <CardHeader>
                  <CardTitle>{branch.name}</CardTitle>
                  <CardDescription>{branch.address}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">{branch.phone}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{branch._count.services} 項服務</Badge>
                    <Badge variant="secondary">{branch._count.technicians} 位美甲師</Badge>
                    <Badge variant="outline">{ASSIGNMENT_MODE_LABELS[branch.assignmentMode]}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
