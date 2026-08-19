"use client";

import { useActionState, useState } from "react";
import { confirmBookingAction, type ConfirmBookingState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const initialState: ConfirmBookingState = {};

interface ConfirmFormProps {
  slug: string;
  branchId: string;
  serviceId: string;
  technicianId?: string;
  date: string;
  time: string;
  rescheduleFrom?: string;
  depositRequired: boolean;
  loggedInCustomerName?: string;
}

type Mode = "member" | "guest" | "login" | "register";

export function ConfirmForm({
  slug,
  branchId,
  serviceId,
  technicianId,
  date,
  time,
  rescheduleFrom,
  depositRequired,
  loggedInCustomerName,
}: ConfirmFormProps) {
  const [state, formAction, pending] = useActionState(confirmBookingAction, initialState);
  const [mode, setMode] = useState<Mode>(loggedInCustomerName ? "member" : "guest");
  const [depositChecked, setDepositChecked] = useState(false);

  const submitDisabled = pending || (depositRequired && !depositChecked);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="serviceId" value={serviceId} />
      {technicianId && <input type="hidden" name="technicianId" value={technicianId} />}
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      {rescheduleFrom && <input type="hidden" name="rescheduleFrom" value={rescheduleFrom} />}
      <input type="hidden" name="identityMode" value={mode} />

      {mode === "member" && loggedInCustomerName ? (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <p className="text-sm">
            以會員身份預約：<span className="font-medium">{loggedInCustomerName}</span>
          </p>
          <button
            type="button"
            onClick={() => setMode("guest")}
            className="w-fit text-xs text-muted-foreground underline underline-offset-4"
          >
            不是本人？改用訪客身份預約
          </button>
        </div>
      ) : (
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="w-full">
            <TabsTrigger value="guest" className="flex-1">
              訪客預約
            </TabsTrigger>
            <TabsTrigger value="login" className="flex-1">
              會員登入
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              註冊會員
            </TabsTrigger>
          </TabsList>
          <TabsContent value="guest" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="guestName">姓名</Label>
              <Input id="guestName" name="guestName" maxLength={50} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guestPhone">手機號碼</Label>
              <Input id="guestPhone" name="guestPhone" placeholder="0912345678" />
            </div>
          </TabsContent>
          <TabsContent value="login" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email">電子郵件</Label>
              <Input id="login-email" name="email" type="email" autoComplete="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-password">密碼</Label>
              <Input id="login-password" name="password" type="password" autoComplete="current-password" />
            </div>
          </TabsContent>
          <TabsContent value="register" className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-name">姓名</Label>
              <Input id="register-name" name="name" maxLength={50} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-phone">手機號碼</Label>
              <Input id="register-phone" name="phone" placeholder="0912345678" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-email">電子郵件</Label>
              <Input id="register-email" name="email" type="email" autoComplete="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-password">密碼</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {depositRequired && (
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            name="depositAcknowledged"
            checked={depositChecked}
            onCheckedChange={(checked) => setDepositChecked(checked === true)}
          />
          我了解此預約需支付訂金，並同意店家將另行與我確認付款方式
        </label>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={submitDisabled} className="bg-[var(--brand)] hover:opacity-90">
        {pending ? "送出中…" : "確認送出預約需求"}
      </Button>
      <p className="text-xs text-muted-foreground">
        送出後將進入待確認狀態，店家確認後即完成預約。
      </p>
    </form>
  );
}
