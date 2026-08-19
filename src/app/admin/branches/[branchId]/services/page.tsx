import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceDialog } from "./service-dialog";
import { DeleteServiceButton } from "./delete-service-button";

export default async function ServicesPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { shop } = await requireShop();
  const { branchId } = await params;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) notFound();

  const services = await db.service.findMany({ where: { branchId }, orderBy: { createdAt: "asc" } });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>服務項目</CardTitle>
          <CardDescription>此分店提供的美甲服務與價格</CardDescription>
        </div>
        <ServiceDialog branchId={branchId} trigger={<Button>新增服務</Button>} />
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">尚未新增任何服務項目</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服務名稱</TableHead>
                <TableHead>價格</TableHead>
                <TableHead>時長</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>NT$ {service.price.toLocaleString("zh-TW")}</TableCell>
                  <TableCell>{service.durationMinutes} 分鐘</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <ServiceDialog
                      branchId={branchId}
                      service={service}
                      trigger={
                        <Button variant="outline" size="sm">
                          編輯
                        </Button>
                      }
                    />
                    <DeleteServiceButton branchId={branchId} serviceId={service.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
