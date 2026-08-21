import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";

const FEATURES = [
  { title: "多分店管理", desc: "每間分店獨立設定服務項目、價格與美甲師班表" },
  { title: "彈性預約規則", desc: "顧客指定美甲師、系統隨機或依專長自動指派" },
  { title: "動態時段計算", desc: "依服務時長自動計算可預約時段，不需手動排班" },
  { title: "外觀客製化", desc: "上傳標誌、字型與貼圖，打造專屬品牌風格" },
];

export default function PlatformLandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section
        className="flex min-h-[78vh] flex-col items-center justify-center gap-3.5 bg-cover bg-center px-4 py-16 text-center"
        style={{ backgroundImage: "url(/brand/hero-wallpaper.jpg)" }}
      >
        <p className="text-xs font-medium tracking-[0.28em] text-muted-foreground">NAIL SALON</p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          製作只專屬於你的美甲預約系統！
        </h1>
        <Divider />
        <p className="max-w-xl text-lg text-muted-foreground">
          幾分鐘內建立線上預約系統，管理分店、服務項目與美甲師排班
        </p>
        <div className="flex gap-3">
          <Button size="lg" render={<Link href="/register" />} nativeButton={false}>
            免費開始使用
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />} nativeButton={false}>
            登入
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 px-4 pt-20 pb-24 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <CardTitle className="text-base">{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
