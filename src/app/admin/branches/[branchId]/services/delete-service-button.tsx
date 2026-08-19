"use client";

import { deleteServiceAction } from "./actions";
import { Button } from "@/components/ui/button";

export function DeleteServiceButton({ branchId, serviceId }: { branchId: string; serviceId: string }) {
  return (
    <form
      action={deleteServiceAction}
      onSubmit={(e) => {
        if (!confirm("確定要刪除此服務項目嗎？")) e.preventDefault();
      }}
    >
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <Button type="submit" variant="destructive" size="sm">
        刪除
      </Button>
    </form>
  );
}
