"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createOwnerSession,
  destroyOwnerSession,
  getCurrentUser,
} from "@/lib/auth/session";
import {
  issueAndSendVerificationEmail,
  issueAndSendPasswordResetEmail,
  findValidPasswordResetToken,
} from "@/lib/auth/verify";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

export interface AuthActionState {
  error?: string;
  message?: string;
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }
  const { email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "此電子郵件已被註冊，請直接登入" };
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({ data: { email, passwordHash } });

  await issueAndSendVerificationEmail(user.id, user.email);
  await createOwnerSession(user.id);

  redirect("/admin");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "電子郵件或密碼錯誤" };
  }

  await createOwnerSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyOwnerSession();
  redirect("/login");
}

export async function resendVerificationAction(
  _prevState: AuthActionState,
  _formData: FormData
): Promise<AuthActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerified) {
    return { message: "您的信箱已完成驗證" };
  }
  await issueAndSendVerificationEmail(user.id, user.email);
  return { message: "驗證信已重新寄出，請至信箱查收" };
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    await issueAndSendPasswordResetEmail(user.id, user.email);
  }

  // Always respond the same way whether or not the email exists, to avoid
  // leaking which addresses have an account.
  return { message: "若該電子郵件已註冊，我們已寄出重設密碼的連結" };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  const record = await findValidPasswordResetToken(parsed.data.token);
  if (!record) {
    return { error: "重設連結無效或已過期，請重新申請" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Resetting a password is a security-sensitive action: sign the account
    // out everywhere so a leaked-then-changed password can't still be used
    // via an old session.
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  await createOwnerSession(record.userId);
  redirect("/admin");
}
