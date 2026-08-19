"use client";

import { useActionState, useState } from "react";
import { createServiceAction, updateServiceAction, type ServiceActionState } from "./actions";
import { useCloseOnSuccess } from "@/lib/use-close-on-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  trigger: React.ReactElement;
}

export function ServiceDialog({ branchId, service, trigger }: ServiceDialogProps) {
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
          <DialogDescription>設定服務名稱、價格與所需時長</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          {service && <input type="hidden" name="serviceId" value={service.id} />}
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
            <Label htmlFor="durationMinutes">所需時長（分鐘）</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={5}
              step={5}
              required
              defaultValue={service?.durationMinutes}
              placeholder="60"
            />
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
