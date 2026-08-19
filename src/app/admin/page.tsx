import Link from "next/link";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const { shop } = await requireShop();

  const [branchCount, pendingCount, bookableBranchCount] = await Promise.all([
    db.branch.count({ where: { shopId: shop.id } }),
    db.booking.count({ where: { branch: { shopId: shop.id }, status: "PENDING" } }),
    db.branch.count({ where: { shopId: shop.id, services: { some: {} } } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">總覽</h1>
        <p className="text-sm text-muted-foreground">歡迎回來，{shop.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>分店數量</CardDescription>
            <CardTitle className="text-3xl">{branchCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>待確認預約</CardDescription>
            <CardTitle className="text-3xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>可預約分店</CardDescription>
            <CardTitle className="text-3xl">{bookableBranchCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {branchCount === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>開始設定您的分店</CardTitle>
            <CardDescription>新增分店、服務項目與美甲師，讓顧客可以開始預約</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/branches" className="text-sm font-medium underline underline-offset-4">
              前往分店管理 →
            </Link>
          </CardContent>
        </Card>
      )}

      {pendingCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>您有 {pendingCount} 筆待確認的預約</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/bookings" className="text-sm font-medium underline underline-offset-4">
              前往預約管理 →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
