"use client";

import { useActionState, useState } from "react";
import { createBranchAction, type BranchActionState } from "./actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: BranchActionState = {};

export function CreateBranchDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createBranchAction, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>新增分店</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增分店</DialogTitle>
          <DialogDescription>建立分店後即可設定服務項目與美甲師</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">分店名稱</Label>
            <Input id="name" name="name" required maxLength={50} placeholder="例如：台北信義店" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">地址</Label>
            <Input id="address" name="address" required maxLength={200} placeholder="台北市信義區…" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">電話</Label>
            <Input id="phone" name="phone" required maxLength={20} placeholder="02-1234-5678" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="assignmentMode">美甲師指定方式</Label>
            <Select name="assignmentMode" defaultValue="CUSTOMER_CHOICE">
              <SelectTrigger id="assignmentMode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER_CHOICE">顧客自行指定美甲師</SelectItem>
                <SelectItem value="RANDOM">系統隨機指派</SelectItem>
                <SelectItem value="SKILL_MATCH">系統依專長與檔期自動指派</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "建立中…" : "建立分店"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
