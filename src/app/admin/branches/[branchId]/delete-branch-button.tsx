"use client";

import { deleteBranchAction } from "@/app/admin/branches/actions";
import { Button } from "@/components/ui/button";

export function DeleteBranchButton({ branchId }: { branchId: string }) {
  return (
    <form
      action={deleteBranchAction}
      onSubmit={(e) => {
        if (!confirm("確定要刪除此分店嗎？分店的服務項目、美甲師與預約紀錄將一併刪除，此動作無法復原。")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="branchId" value={branchId} />
      <Button type="submit" variant="destructive" size="sm">
        刪除分店
      </Button>
    </form>
  );
}
