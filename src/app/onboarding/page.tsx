import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await requireOwner();
  if (!user.emailVerified) redirect("/verify-email");

  const existingShop = await db.shop.findUnique({ where: { ownerId: user.id } });
  if (existingShop) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>設定您的美甲店</CardTitle>
          <CardDescription>只需兩個步驟，您的預約網站就能立即上線</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
