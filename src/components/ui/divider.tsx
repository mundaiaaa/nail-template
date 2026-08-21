import { cn } from "@/lib/utils";

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full max-w-56 items-center gap-2.5", className)}>
      <span className="h-0 flex-1 border-t border-dashed border-foreground/20" />
      <span className="size-1.5 shrink-0 rotate-45 rounded-[1px] bg-primary-foreground" />
      <span className="h-0 flex-1 border-t border-dashed border-foreground/20" />
    </div>
  );
}
