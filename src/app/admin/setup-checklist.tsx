import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  label: string;
  done: boolean;
  href: string;
  cta: string;
}

export function SetupChecklist({ items }: { items: ChecklistItem[] }) {
  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  if (allDone) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>開店設定清單</CardTitle>
        <CardDescription>
          已完成 {doneCount} / {items.length} 項，完成後您的網站會更完整、更吸引顧客
        </CardDescription>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[var(--brand,var(--primary))] transition-all"
            style={{ width: `${(doneCount / items.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs",
                    item.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-transparent"
                  )}
                >
                  ✓
                </span>
                <span className={cn("text-sm", item.done && "text-muted-foreground line-through")}>
                  {item.label}
                </span>
              </div>
              {!item.done && (
                <Link href={item.href} className="shrink-0 text-sm font-medium underline underline-offset-4">
                  {item.cta} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
