import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceDialog } from "./service-dialog";
import { DeleteServiceButton } from "./delete-service-button";
import type { Service } from "@/generated/prisma/client";

function durationLabel(service: Pick<Service, "durationMinMinutes" | "durationMaxMinutes">) {
  return service.durationMinMinutes === service.durationMaxMinutes
    ? `${service.durationMinMinutes} 分鐘`
    : `${service.durationMinMinutes}–${service.durationMaxMinutes} 分鐘`;
}

function ServiceTable({ branchId, services }: { branchId: string; services: Service[] }) {
  if (services.length === 0) {
    return <p className="text-sm text-muted-foreground">尚未新增任何服務項目</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>服務名稱</TableHead>
          <TableHead>價格</TableHead>
          <TableHead>時長</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell>
              {service.imageKey ? (
                <Image
                  src={service.imageKey}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-md border object-cover"
                />
              ) : (
                <div className="size-10 rounded-md border bg-muted" />
              )}
            </TableCell>
            <TableCell>{service.name}</TableCell>
            <TableCell>NT$ {service.price.toLocaleString("zh-TW")}</TableCell>
            <TableCell>{durationLabel(service)}</TableCell>
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
  );
}

export default async function ServicesPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { shop } = await requireShop();
  const { branchId } = await params;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) notFound();

  const services = await db.service.findMany({ where: { branchId }, orderBy: { createdAt: "asc" } });
  const mainServices = services.filter((s) => s.category === "MAIN");
  const addonServices = services.filter((s) => s.category === "ADDON");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>主項目</CardTitle>
            <CardDescription>顧客預約時必須先選擇至少一項主項目</CardDescription>
          </div>
          <ServiceDialog branchId={branchId} defaultCategory="MAIN" trigger={<Button>新增主項目</Button>} />
        </CardHeader>
        <CardContent>
          <ServiceTable branchId={branchId} services={mainServices} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>加購項</CardTitle>
            <CardDescription>需先選擇主項目後才能加選，可複選</CardDescription>
          </div>
          <ServiceDialog branchId={branchId} defaultCategory="ADDON" trigger={<Button>新增加購項</Button>} />
        </CardHeader>
        <CardContent>
          <ServiceTable branchId={branchId} services={addonServices} />
        </CardContent>
      </Card>
    </div>
  );
}
