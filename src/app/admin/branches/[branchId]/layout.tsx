import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { DeleteBranchButton } from "./delete-branch-button";
import { BranchTabsClient } from "./branch-tabs-client";

export default async function BranchDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ branchId: string }>;
}) {
  const { shop } = await requireShop();
  const { branchId } = await params;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/branches" className="text-sm text-muted-foreground underline underline-offset-4">
            ← 返回分店列表
          </Link>
          <h1 className="text-2xl font-semibold">{branch.name}</h1>
        </div>
        <DeleteBranchButton branchId={branch.id} />
      </div>
      <BranchTabsClient branchId={branchId} />
      {children}
    </div>
  );
}
