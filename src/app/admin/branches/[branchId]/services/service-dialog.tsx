"use client";

import { useActionState, useState } from "react";
import { createServiceAction, updateServiceAction, type ServiceActionState } from "./actions";
import { useCloseOnSuccess } from "@/lib/use-close-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Service } from "@/generated/prisma/client";

const initialState: ServiceActionState = {};

interface ServiceDialogProps {
  branchId: string;
  service?: Service;
  defaultCategory?: "MAIN" | "ADDON";
  trigger: React.ReactElement;
}

export function ServiceDialog({ branchId, service, defaultCategory = "MAIN", trigger }: ServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const action = service ? updateServiceAction : createServiceAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseOnSuccess(pending, state?.error, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "編輯服務項目" : "新增服務項目"}</DialogTitle>
          <DialogDescription>設定服務名稱、分類、價格與所需時長區間</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          {service && <input type="hidden" name="serviceId" value={service.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">分類</Label>
            <Select name="category" defaultValue={service?.category ?? defaultCategory}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAIN">主項目</SelectItem>
                <SelectItem value="ADDON">加購項</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              加購項需先選擇至少一項主項目後，顧客才能加選
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">服務名稱</Label>
            <Input id="name" name="name" required maxLength={50} defaultValue={service?.name} placeholder="例如：光療凝膠美甲" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="price">價格（NT$）</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              defaultValue={service?.price}
              placeholder="800"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>所需時長區間（分鐘）</Label>
            <div className="flex items-center gap-2">
              <Input
                name="durationMinMinutes"
                type="number"
                min={5}
                step={5}
                required
                defaultValue={service?.durationMinMinutes}
                placeholder="最短，例如 60"
                aria-label="最短時長"
              />
              <span className="text-muted-foreground">至</span>
              <Input
                name="durationMaxMinutes"
                type="number"
                min={5}
                step={5}
                required
                defaultValue={service?.durationMaxMinutes}
                placeholder="最長，例如 90"
                aria-label="最長時長"
              />
            </div>
            <p className="text-xs text-muted-foreground">若時長固定，最短與最長可填寫相同數字</p>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "儲存中…" : "儲存"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
