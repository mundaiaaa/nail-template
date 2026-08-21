"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { createTechnicianAction, updateTechnicianAction, type TechnicianActionState } from "./actions";
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
import type { Technician } from "@/generated/prisma/client";

const initialState: TechnicianActionState = {};

interface TechnicianDialogProps {
  branchId: string;
  technician?: Technician;
  trigger: React.ReactElement;
}

export function TechnicianDialog({ branchId, technician, trigger }: TechnicianDialogProps) {
  const [open, setOpen] = useState(false);
  const action = technician ? updateTechnicianAction : createTechnicianAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  useCloseOnSuccess(pending, state?.error, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{technician ? "編輯美甲師" : "新增美甲師"}</DialogTitle>
          <DialogDescription>專長為選填，可留空</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          {technician && <input type="hidden" name="technicianId" value={technician.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" name="name" required maxLength={50} defaultValue={technician?.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="specialties">專長（選填，以逗號分隔）</Label>
            <Input
              id="specialties"
              name="specialties"
              maxLength={200}
              defaultValue={technician?.specialties.join(", ")}
              placeholder="例如：光療凝膠, 手繪, 法式美甲"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="image">照片（選填）</Label>
            {technician?.imageKey && (
              <div className="flex items-center gap-3">
                <Image
                  src={technician.imageKey}
                  alt=""
                  width={64}
                  height={64}
                  className="rounded-full border object-cover"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" name="clearImage" /> 移除此照片
                </label>
              </div>
            )}
            <Input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
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
