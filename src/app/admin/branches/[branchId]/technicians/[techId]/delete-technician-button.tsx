"use client";

import { deleteTechnicianAction } from "@/app/admin/branches/[branchId]/technicians/actions";
import { Button } from "@/components/ui/button";

export function DeleteTechnicianButton({ branchId, technicianId }: { branchId: string; technicianId: string }) {
  return (
    <form
      action={deleteTechnicianAction}
      onSubmit={(e) => {
        if (!confirm("確定要刪除此美甲師嗎？相關預約紀錄中的美甲師欄位將被清空。")) e.preventDefault();
      }}
    >
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="technicianId" value={technicianId} />
      <Button type="submit" variant="destructive" size="sm">
        刪除美甲師
      </Button>
    </form>
  );
}
