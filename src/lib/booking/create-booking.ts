import "server-only";
import { db } from "@/lib/db";
import { getAvailableSlots } from "@/lib/booking/slots";

export class SlotUnavailableError extends Error {
  constructor() {
    super("這個時段剛被預約走了，請重新選擇時間");
  }
}

interface CreateBookingParams {
  branchId: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  startTime: Date;
  technicianId?: string; // required when the branch's assignment mode is CUSTOMER_CHOICE
  customerId?: string;
  guestName?: string;
  guestPhone?: string;
  depositRequired: boolean;
}

// Re-derives availability for the exact requested slot inside a transaction
// (instead of trusting whatever the client saw a moment earlier) so two
// customers racing for the same slot can't both succeed, then — for
// RANDOM / SKILL_MATCH branches — picks one of the technicians still free.
export async function createBookingRequest(params: CreateBookingParams) {
  const service = await db.service.findUniqueOrThrow({ where: { id: params.serviceId } });
  const endTime = new Date(params.startTime.getTime() + service.durationMinutes * 60_000);

  return db.$transaction(async (tx) => {
    const branch = await tx.branch.findUniqueOrThrow({ where: { id: params.branchId } });

    const slots = await getAvailableSlots(
      {
        branchId: params.branchId,
        serviceId: params.serviceId,
        date: params.date,
        technicianId: params.technicianId,
      },
      tx
    );
    const match = slots.find((s) => s.startTime.getTime() === params.startTime.getTime());
    if (!match || match.technicianIds.length === 0) {
      throw new SlotUnavailableError();
    }

    const assignedTechnicianId =
      branch.assignmentMode === "CUSTOMER_CHOICE"
        ? (params.technicianId ?? null)
        : match.technicianIds[Math.floor(Math.random() * match.technicianIds.length)];

    return tx.booking.create({
      data: {
        branchId: params.branchId,
        serviceId: params.serviceId,
        technicianId: assignedTechnicianId,
        customerId: params.customerId,
        guestName: params.guestName,
        guestPhone: params.guestPhone,
        startTime: params.startTime,
        endTime,
        status: "PENDING",
        depositRequired: params.depositRequired,
        depositStatus: params.depositRequired ? "PENDING" : "NOT_REQUIRED",
      },
    });
  });
}
