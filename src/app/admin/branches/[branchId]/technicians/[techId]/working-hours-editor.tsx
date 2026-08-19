"use client";

import { useActionState, useState } from "react";
import {
  updateTechnicianWorkingHoursAction,
  type TechnicianActionState,
} from "@/app/admin/branches/[branchId]/technicians/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { WEEKDAY_LABELS_ZH, ALL_WEEKDAYS } from "@/lib/days";
import type { TechnicianWorkingHour } from "@/generated/prisma/client";

const initialState: TechnicianActionState = {};

export function WorkingHoursEditor({
  branchId,
  technicianId,
  hours,
}: {
  branchId: string;
  technicianId: string;
  hours: TechnicianWorkingHour[];
}) {
  const [state, formAction, pending] = useActionState(updateTechnicianWorkingHoursAction, initialState);
  const [offDays, setOffDays] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(ALL_WEEKDAYS.map((d) => [d, hours.find((h) => h.dayOfWeek === d)?.isOff ?? false]))
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="technicianId" value={technicianId} />
      <div className="flex flex-col divide-y rounded-lg border">
        {ALL_WEEKDAYS.map((day) => {
          const hour = hours.find((h) => h.dayOfWeek === day);
          const off = offDays[day];
          return (
            <div key={day} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <span className="w-12 shrink-0 text-sm font-medium">{WEEKDAY_LABELS_ZH[day]}</span>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  name={`isOff_${day}`}
                  checked={off}
                  onCheckedChange={(checked) => setOffDays((prev) => ({ ...prev, [day]: checked === true }))}
                />
                休假
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  name={`startTime_${day}`}
                  defaultValue={hour?.startTime ?? "10:00"}
                  disabled={off}
                  className="w-32"
                />
                <span className="text-muted-foreground">至</span>
                <Input
                  type="time"
                  name={`endTime_${day}`}
                  defaultValue={hour?.endTime ?? "19:00"}
                  disabled={off}
                  className="w-32"
                />
              </div>
            </div>
          );
        })}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "儲存中…" : "儲存班表"}
      </Button>
    </form>
  );
}
