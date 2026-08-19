"use client";

import { useActionState } from "react";
import { updateBranchInfoAction, type BranchActionState } from "@/app/admin/branches/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Branch } from "@/generated/prisma/client";

const initialState: BranchActionState = {};

export function BranchInfoForm({ branch }: { branch: Branch }) {
  const [state, formAction, pending] = useActionState(updateBranchInfoAction, initialState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <input type="hidden" name="branchId" value={branch.id} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">分店名稱</Label>
        <Input id="name" name="name" required maxLength={50} defaultValue={branch.name} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">地址</Label>
        <Input id="address" name="address" required maxLength={200} defaultValue={branch.address} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">電話</Label>
        <Input id="phone" name="phone" required maxLength={20} defaultValue={branch.phone} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="assignmentMode">美甲師指定方式</Label>
        <Select name="assignmentMode" defaultValue={branch.assignmentMode}>
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
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "儲存中…" : "儲存"}
      </Button>
    </form>
  );
}
