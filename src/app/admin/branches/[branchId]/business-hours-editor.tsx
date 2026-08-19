"use client";

import { useActionState, useState } from "react";
import { updateBusinessHoursAction, type BranchActionState } from "@/app/admin/branches/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { WEEKDAY_LABELS_ZH, ALL_WEEKDAYS } from "@/lib/days";
import type { BusinessHour } from "@/generated/prisma/client";

const initialState: BranchActionState = {};

export function BusinessHoursEditor({ branchId, hours }: { branchId: string; hours: BusinessHour[] }) {
  const [state, formAction, pending] = useActionState(updateBusinessHoursAction, initialState);
  const [closedDays, setClosedDays] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(ALL_WEEKDAYS.map((d) => [d, hours.find((h) => h.dayOfWeek === d)?.isClosed ?? false]))
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="branchId" value={branchId} />
      <div className="flex flex-col divide-y rounded-lg border">
        {ALL_WEEKDAYS.map((day) => {
          const hour = hours.find((h) => h.dayOfWeek === day);
          const closed = closedDays[day];
          return (
            <div key={day} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <span className="w-12 shrink-0 text-sm font-medium">{WEEKDAY_LABELS_ZH[day]}</span>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  name={`isClosed_${day}`}
                  checked={closed}
                  onCheckedChange={(checked) =>
                    setClosedDays((prev) => ({ ...prev, [day]: checked === true }))
                  }
                />
                公休
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  name={`openTime_${day}`}
                  defaultValue={hour?.openTime ?? "10:00"}
                  disabled={closed}
                  className="w-32"
                />
                <span className="text-muted-foreground">至</span>
                <Input
                  type="time"
                  name={`closeTime_${day}`}
                  defaultValue={hour?.closeTime ?? "19:00"}
                  disabled={closed}
                  className="w-32"
                />
              </div>
            </div>
          );
        })}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "儲存中…" : "儲存營業時間"}
      </Button>
    </form>
  );
}
