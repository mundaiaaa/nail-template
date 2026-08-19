"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createCustomerSession, destroyCustomerSession } from "@/lib/auth/customer-session";
import { customerRegisterSchema, customerLoginSchema } from "@/lib/validation/customer";

export interface CustomerActionState {
  error?: string;
}

export async function registerCustomerAction(
  _prevState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const slug = formData.get("slug") as string;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop) return { error: "找不到此商店" };

  const parsed = customerRegisterSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  const existing = await db.customer.findUnique({
    where: { shopId_email: { shopId: shop.id, email: parsed.data.email } },
  });
  if (existing) {
    return { error: "此電子郵件已被註冊，請直接登入" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const customer = await db.customer.create({
    data: {
      shopId: shop.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      passwordHash,
    },
  });

  await createCustomerSession(customer.id);
  redirect(`/s/${slug}/account`);
}

export async function loginCustomerAction(
  _prevState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const slug = formData.get("slug") as string;
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop) return { error: "找不到此商店" };

  const parsed = customerLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  const customer = await db.customer.findUnique({
    where: { shopId_email: { shopId: shop.id, email: parsed.data.email } },
  });
  if (!customer || !(await verifyPassword(parsed.data.password, customer.passwordHash))) {
    return { error: "電子郵件或密碼錯誤" };
  }

  await createCustomerSession(customer.id);
  redirect(`/s/${slug}/account`);
}

export async function logoutCustomerAction(formData: FormData) {
  const slug = formData.get("slug") as string;
  await destroyCustomerSession();
  redirect(`/s/${slug}`);
}
