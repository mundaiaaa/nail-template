import "server-only";
import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { dayOfWeekForDateString } from "@/lib/days";
import type { AssignmentMode } from "@/generated/prisma/enums";
import type { PrismaTransactionClient } from "@/lib/db";

const TAIWAN_TZ = "Asia/Taipei";
const SLOT_GRANULARITY_MINUTES = 15;

export interface SlotOption {
  startTime: Date;
  endTime: Date;
  technicianIds: string[];
}

interface Interval {
  start: Date;
  end: Date;
}

function localToUtc(dateStr: string, hhmm: string): Date {
  return fromZonedTime(`${dateStr}T${hhmm}:00`, TAIWAN_TZ);
}

function intersect(a: Interval, b: Interval): Interval | null {
  const start = a.start > b.start ? a.start : b.start;
  const end = a.end < b.end ? a.end : b.end;
  if (start >= end) return null;
  return { start, end };
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

function matchesSkill(specialties: string[], serviceName: string): boolean {
  if (specialties.length === 0) return false;
  const service = serviceName.trim().toLowerCase();
  return specialties.some((s) => {
    const skill = s.trim().toLowerCase();
    return skill === service || service.includes(skill) || skill.includes(service);
  });
}

interface GetSlotsParams {
  branchId: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD", Taiwan calendar date
  technicianId?: string; // pre-selected technician (assignment mode: CUSTOMER_CHOICE)
}

type DbClient = typeof db | PrismaTransactionClient;

// Computes bookable start times for a given branch/service/date, honoring
// branch business hours, each candidate technician's recurring working
// hours, their blocked-off days, and existing PENDING/CONFIRMED bookings.
// For RANDOM / SKILL_MATCH branches (no technicianId given), slots are the
// union across all eligible technicians, each option carrying the list of
// technician ids still free at that time so a booking submission can pick one.
export async function getAvailableSlots(
  { branchId, serviceId, date, technicianId }: GetSlotsParams,
  client: DbClient = db
): Promise<SlotOption[]> {
  // Sequential, not Promise.all: when `client` is an interactive transaction
  // (see create-booking.ts), it holds a single reserved connection that
  // can't run two queries concurrently.
  const branch = await client.branch.findUniqueOrThrow({
    where: { id: branchId },
    include: { businessHours: true, technicians: { include: { workingHours: true, timeOff: true } } },
  });
  const service = await client.service.findUniqueOrThrow({ where: { id: serviceId } });

  if (branch.assignmentMode === "CUSTOMER_CHOICE" && !technicianId) {
    throw new Error("此分店需先選擇指定設計師");
  }

  const dayOfWeek = dayOfWeekForDateString(date);
  const businessHour = branch.businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);
  if (!businessHour || businessHour.isClosed || !businessHour.openTime || !businessHour.closeTime) {
    return [];
  }
  const branchWindow: Interval = {
    start: localToUtc(date, businessHour.openTime),
    end: localToUtc(date, businessHour.closeTime),
  };

  let candidates = branch.technicians;
  if (technicianId) {
    candidates = candidates.filter((t) => t.id === technicianId);
  } else if (branch.assignmentMode === ("SKILL_MATCH" satisfies AssignmentMode)) {
    candidates = candidates.filter((t) => matchesSkill(t.specialties, service.name));
  }

  const bookings = await client.booking.findMany({
    where: {
      branchId,
      status: { in: ["PENDING", "CONFIRMED"] },
      technicianId: { in: candidates.map((t) => t.id) },
      startTime: { gte: branchWindow.start, lt: branchWindow.end },
    },
    select: { technicianId: true, startTime: true, endTime: true },
  });

  const slotMap = new Map<number, Set<string>>(); // startTime epoch ms -> technician ids

  for (const tech of candidates) {
    const workingHour = tech.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
    if (!workingHour || workingHour.isOff || !workingHour.startTime || !workingHour.endTime) continue;

    const hasTimeOff = tech.timeOff.some(
      (off) => off.date.toISOString().slice(0, 10) === date
    );
    if (hasTimeOff) continue;

    const techWindow: Interval = {
      start: localToUtc(date, workingHour.startTime),
      end: localToUtc(date, workingHour.endTime),
    };
    const window = intersect(branchWindow, techWindow);
    if (!window) continue;

    const techBookings = bookings
      .filter((b) => b.technicianId === tech.id)
      .map((b) => ({ start: b.startTime, end: b.endTime }));

    for (
      let start = window.start;
      addMinutes(start, service.durationMinutes) <= window.end;
      start = addMinutes(start, SLOT_GRANULARITY_MINUTES)
    ) {
      const candidateInterval: Interval = { start, end: addMinutes(start, service.durationMinutes) };
      const conflict = techBookings.some((b) => overlaps(b, candidateInterval));
      if (conflict) continue;

      const key = start.getTime();
      if (!slotMap.has(key)) slotMap.set(key, new Set());
      slotMap.get(key)!.add(tech.id);
    }
  }

  return Array.from(slotMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([startMs, techIds]) => ({
      startTime: new Date(startMs),
      endTime: addMinutes(new Date(startMs), service.durationMinutes),
      technicianIds: Array.from(techIds),
    }));
}
