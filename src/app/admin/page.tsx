import Link from "next/link";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SetupChecklist } from "./setup-checklist";

export default async function AdminDashboardPage() {
  const { shop } = await requireShop();

  const [
    branchCount,
    pendingCount,
    bookableBranchCount,
    firstBranch,
    serviceCount,
    technicianCount,
    servicesWithPhotoCount,
    techniciansWithPhotoCount,
  ] = await Promise.all([
    db.branch.count({ where: { shopId: shop.id } }),
    db.booking.count({ where: { branch: { shopId: shop.id }, status: "PENDING" } }),
    db.branch.count({ where: { shopId: shop.id, services: { some: {} } } }),
    db.branch.findFirst({ where: { shopId: shop.id }, orderBy: { createdAt: "asc" } }),
    db.service.count({ where: { branch: { shopId: shop.id } } }),
    db.technician.count({ where: { branch: { shopId: shop.id } } }),
    db.service.count({ where: { branch: { shopId: shop.id }, imageKey: { not: null } } }),
    db.technician.count({ where: { branch: { shopId: shop.id }, imageKey: { not: null } } }),
  ]);
  const hasAnyPhoto = servicesWithPhotoCount > 0 || techniciansWithPhotoCount > 0;

  const branchesOrFirstBranchServicesHref = firstBranch
    ? `/admin/branches/${firstBranch.id}/services`
    : "/admin/branches";
  const branchesOrFirstBranchTechniciansHref = firstBranch
    ? `/admin/branches/${firstBranch.id}/technicians`
    : "/admin/branches";

  const checklistItems = [
    { label: "建立第一間分店", done: branchCount > 0, href: "/admin/branches", cta: "新增分店" },
    { label: "新增服務項目", done: serviceCount > 0, href: branchesOrFirstBranchServicesHref, cta: "前往設定" },
    { label: "新增美甲師", done: technicianCount > 0, href: branchesOrFirstBranchTechniciansHref, cta: "前往設定" },
    { label: "上傳商店標誌", done: !!shop.logoKey, href: "/admin/shop/appearance", cta: "上傳標誌" },
    { label: "上傳服務或美甲師照片", done: hasAnyPhoto, href: branchesOrFirstBranchServicesHref, cta: "前往上傳" },
    { label: "網站已上線", done: shop.published, href: "/admin/shop", cta: "前往設定" },
  ];

  return (
    <div className="flex flex-col gap-4">
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

      <SetupChecklist items={checklistItems} />

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
