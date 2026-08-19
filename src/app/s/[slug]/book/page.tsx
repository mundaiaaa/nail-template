import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";

export default async function SelectBranchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rescheduleFrom?: string }>;
}) {
  const { slug } = await params;
  const { rescheduleFrom } = await searchParams;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  const branches = await db.branch.findMany({
    where: { shopId: shop.id, services: { some: {} } },
    orderBy: { createdAt: "asc" },
  });

  const qs = rescheduleFrom ? `?rescheduleFrom=${rescheduleFrom}` : "";

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <PageDecorations shopId={shop.id} page="BRANCH_SELECT" />
      <div>
        <h1 className="text-xl font-semibold">選擇分店</h1>
        <p className="text-sm text-muted-foreground">步驟 1 / 4</p>
      </div>

      {branches.length === 0 ? (
        <p className="text-sm text-muted-foreground">目前尚無可預約的分店</p>
      ) : (
        <div className="flex flex-col gap-3">
          {branches.map((branch) => (
            <Link key={branch.id} href={`/s/${slug}/book/${branch.id}${qs}`}>
              <Card className="transition-colors hover:border-foreground/30">
                <CardHeader>
                  <CardTitle>{branch.name}</CardTitle>
                  <CardDescription>{branch.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{branch.phone}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
