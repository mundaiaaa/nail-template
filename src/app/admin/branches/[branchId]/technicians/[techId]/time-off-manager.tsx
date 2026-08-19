"use client";

import { useActionState } from "react";
import {
  addTimeOffAction,
  removeTimeOffAction,
  type TechnicianActionState,
} from "@/app/admin/branches/[branchId]/technicians/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { todayDateStringInTaiwan } from "@/lib/days";
import type { TechnicianTimeOff } from "@/generated/prisma/client";

const initialState: TechnicianActionState = {};

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function TimeOffManager({
  branchId,
  technicianId,
  timeOff,
}: {
  branchId: string;
  technicianId: string;
  timeOff: TechnicianTimeOff[];
}) {
  const [state, formAction, pending] = useActionState(addTimeOffAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex items-end gap-2">
        <input type="hidden" name="branchId" value={branchId} />
        <input type="hidden" name="technicianId" value={technicianId} />
        <div className="flex flex-col gap-2">
          <Input type="date" name="date" min={todayDateStringInTaiwan()} required className="w-44" />
        </div>
        <Button type="submit" disabled={pending} variant="outline">
          {pending ? "新增中…" : "新增休假日"}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      {timeOff.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚未設定任何休假日</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {timeOff
            .slice()
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((off) => (
              <li key={off.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{formatDate(off.date)}</span>
                <form action={removeTimeOffAction}>
                  <input type="hidden" name="branchId" value={branchId} />
                  <input type="hidden" name="technicianId" value={technicianId} />
                  <input type="hidden" name="timeOffId" value={off.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    移除
                  </Button>
                </form>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
