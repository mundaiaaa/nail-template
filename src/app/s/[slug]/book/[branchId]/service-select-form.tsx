"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { sumDurationRange, formatDurationRange, formatServiceDuration } from "@/lib/booking/duration";
import type { Service } from "@/generated/prisma/client";

interface ServiceSelectFormProps {
  slug: string;
  branchId: string;
  mainServices: Service[];
  addonServices: Service[];
  nextStep: "technician" | "slot";
  rescheduleFrom?: string;
  preselectedIds?: string[];
}

export function ServiceSelectForm({
  slug,
  branchId,
  mainServices,
  addonServices,
  nextStep,
  rescheduleFrom,
  preselectedIds = [],
}: ServiceSelectFormProps) {
  const router = useRouter();
  const [selectedMain, setSelectedMain] = useState<Set<string>>(
    () => new Set(mainServices.filter((s) => preselectedIds.includes(s.id)).map((s) => s.id))
  );
  const [selectedAddon, setSelectedAddon] = useState<Set<string>>(
    () => new Set(addonServices.filter((s) => preselectedIds.includes(s.id)).map((s) => s.id))
  );
  const hasMain = selectedMain.size > 0;

  function toggleMain(id: string, checked: boolean) {
    setSelectedMain((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      // Add-ons only make sense alongside a main service — clear them if
      // the customer unchecks every main item.
      if (next.size === 0) setSelectedAddon(new Set());
      return next;
    });
  }

  function toggleAddon(id: string, checked: boolean) {
    setSelectedAddon((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const selected = useMemo(() => {
    const ids = [...selectedMain, ...selectedAddon];
    return [...mainServices, ...addonServices].filter((s) => ids.includes(s.id));
  }, [selectedMain, selectedAddon, mainServices, addonServices]);

  const totalPrice = selected.reduce((sum, s) => sum + s.price, 0);
  const duration = sumDurationRange(selected);

  function handleContinue() {
    const ids = [...selectedMain, ...selectedAddon];
    const qs = new URLSearchParams({ serviceIds: ids.join(",") });
    if (rescheduleFrom) qs.set("rescheduleFrom", rescheduleFrom);
    router.push(`/s/${slug}/book/${branchId}/${nextStep}?${qs.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">主項目</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {mainServices.map((service) => (
            <label
              key={service.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedMain.has(service.id)}
                  onCheckedChange={(checked) => toggleMain(service.id, checked === true)}
                />
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{formatServiceDuration(service)}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium">NT$ {service.price.toLocaleString("zh-TW")}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {addonServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">加購項</CardTitle>
            {!hasMain && (
              <p className="text-xs text-muted-foreground">請先選擇至少一項主項目後，才能加選以下項目</p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {addonServices.map((service) => (
              <label
                key={service.id}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:not-aria-disabled:bg-muted"
                aria-disabled={!hasMain}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    disabled={!hasMain}
                    checked={selectedAddon.has(service.id)}
                    onCheckedChange={(checked) => toggleAddon(service.id, checked === true)}
                  />
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{formatServiceDuration(service)}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium">NT$ {service.price.toLocaleString("zh-TW")}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="text-sm">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">尚未選擇服務項目</span>
          ) : (
            <>
              <span className="font-medium">已選 {selected.length} 項</span>
              <span className="text-muted-foreground">
                {" "}
                · 預估 {formatDurationRange(duration.min, duration.max)} · NT$ {totalPrice.toLocaleString("zh-TW")}
              </span>
            </>
          )}
        </div>
        <Button
          disabled={!hasMain}
          onClick={handleContinue}
          className="shrink-0 bg-[var(--brand)] text-white hover:opacity-90"
        >
          下一步
        </Button>
      </div>
    </div>
  );
}
