"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hhmmToMinutes, minutesSinceMidnightTaipei, minutesToHHmm } from "@/lib/booking/time-of-day";
import { acceptBookingAction, rejectBookingAction } from "@/app/admin/bookings/actions";
import type {
  Technician,
  TechnicianWorkingHour,
  TechnicianTimeOff,
  Booking,
  Customer,
  BookingService,
  Service,
} from "@/generated/prisma/client";

const PIXELS_PER_MINUTE = 1.4;
const STATUS_LABELS: Record<string, string> = { PENDING: "待確認", CONFIRMED: "已確認" };

type TechnicianWithSchedule = Technician & { workingHours: TechnicianWorkingHour[]; timeOff: TechnicianTimeOff[] };
type BookingWithRelations = Booking & {
  customer: Customer | null;
  technician: Technician | null;
  services: (BookingService & { service: Service })[];
};

interface ScheduleGridProps {
  date: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  technicians: TechnicianWithSchedule[];
  bookings: BookingWithRelations[];
}

function formatDateTimeTaipei(d: Date): string {
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function ScheduleGrid({ date, dayOfWeek, openTime, closeTime, technicians, bookings }: ScheduleGridProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);

  const gridStart = hhmmToMinutes(openTime);
  const gridEnd = hhmmToMinutes(closeTime);
  const gridHeight = (gridEnd - gridStart) * PIXELS_PER_MINUTE;
  const hourMarks: number[] = [];
  for (let m = Math.ceil(gridStart / 60) * 60; m <= gridEnd; m += 60) hourMarks.push(m);

  return (
    <>
      <div className="flex overflow-x-auto rounded-lg border bg-card">
        <div className="w-12 shrink-0 border-r">
          <div className="h-10 border-b" />
          <div className="relative" style={{ height: gridHeight }}>
            {hourMarks.map((m) => (
              <div
                key={m}
                className="absolute right-1 -translate-y-1/2 text-xs text-muted-foreground"
                style={{ top: (m - gridStart) * PIXELS_PER_MINUTE }}
              >
                {minutesToHHmm(m)}
              </div>
            ))}
          </div>
        </div>

        {technicians.map((tech) => {
          const workingHour = tech.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
          const hasTimeOff = tech.timeOff.some((t) => t.date.toISOString().slice(0, 10) === date);
          const isOff = !workingHour || workingHour.isOff || !workingHour.startTime || !workingHour.endTime || hasTimeOff;
          const workStart = !isOff ? Math.max(gridStart, hhmmToMinutes(workingHour!.startTime!)) : null;
          const workEnd = !isOff ? Math.min(gridEnd, hhmmToMinutes(workingHour!.endTime!)) : null;

          const techBookings = bookings.filter((b) => b.technicianId === tech.id);

          return (
            <div key={tech.id} className="w-40 shrink-0 border-r last:border-r-0">
              <div className="flex h-10 items-center gap-2 border-b px-2">
                {tech.imageKey ? (
                  <Image src={tech.imageKey} alt="" width={20} height={20} className="rounded-full object-cover" />
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px]">
                    {tech.name.slice(0, 1)}
                  </div>
                )}
                <span className="truncate text-sm font-medium">{tech.name}</span>
              </div>
              <div className="relative" style={{ height: gridHeight }}>
                {isOff ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_8px,transparent_8px,transparent_16px)]">
                    <span className="rounded bg-card px-2 py-1 text-xs text-muted-foreground">休假</span>
                  </div>
                ) : (
                  <>
                    {workStart! > gridStart && (
                      <div
                        className="absolute inset-x-0 top-0 bg-muted/60"
                        style={{ height: (workStart! - gridStart) * PIXELS_PER_MINUTE }}
                      />
                    )}
                    {workEnd! < gridEnd && (
                      <div
                        className="absolute inset-x-0 bottom-0 bg-muted/60"
                        style={{ height: (gridEnd - workEnd!) * PIXELS_PER_MINUTE }}
                      />
                    )}
                  </>
                )}
                {hourMarks.map((m) => (
                  <div key={m} className="absolute inset-x-0 border-t border-dashed" style={{ top: (m - gridStart) * PIXELS_PER_MINUTE }} />
                ))}
                {techBookings.map((booking) => {
                  const startMin = minutesSinceMidnightTaipei(booking.startTime);
                  const endMin = minutesSinceMidnightTaipei(booking.endTime);
                  const top = (startMin - gridStart) * PIXELS_PER_MINUTE;
                  const height = Math.max((endMin - startMin) * PIXELS_PER_MINUTE, 22);
                  const who = booking.customer?.name ?? booking.guestName ?? "訪客";

                  return (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={cn(
                        "absolute inset-x-0.5 overflow-hidden rounded-md border px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm transition-opacity hover:opacity-90",
                        booking.status === "PENDING"
                          ? "border-secondary-foreground/20 bg-secondary text-secondary-foreground"
                          : "border-transparent bg-[var(--brand,var(--primary))] text-white"
                      )}
                      style={{ top, height }}
                    >
                      <div className="truncate font-medium">{who}</div>
                      <div className="truncate opacity-90">
                        {booking.services.map((bs) => bs.service.name).join("、")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBooking.services.map((bs) => bs.service.name).join("、")}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedBooking.status === "PENDING" ? "secondary" : "default"}>
                    {STATUS_LABELS[selectedBooking.status] ?? selectedBooking.status}
                  </Badge>
                </div>
                <p>時間：{formatDateTimeTaipei(selectedBooking.startTime)}</p>
                <p>美甲師：{selectedBooking.technician?.name ?? "—"}</p>
                <p>
                  預約人：{selectedBooking.customer?.name ?? selectedBooking.guestName}（
                  {selectedBooking.customer?.phone ?? selectedBooking.guestPhone}）
                  {selectedBooking.customer ? " · 會員" : " · 訪客"}
                </p>
                <p>
                  總價：NT${" "}
                  {selectedBooking.services.reduce((sum, bs) => sum + bs.service.price, 0).toLocaleString("zh-TW")}
                </p>
                {selectedBooking.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <form action={acceptBookingAction} onSubmit={() => setSelectedBooking(null)}>
                      <input type="hidden" name="bookingId" value={selectedBooking.id} />
                      <Button type="submit" size="sm">
                        確認預約
                      </Button>
                    </form>
                    <form action={rejectBookingAction} onSubmit={() => setSelectedBooking(null)}>
                      <input type="hidden" name="bookingId" value={selectedBooking.id} />
                      <Button type="submit" size="sm" variant="outline">
                        婉拒
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
