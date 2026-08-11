import { CatMascot } from "@/components/CatMascot";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border p-8 text-center text-sm text-foreground/60">
      <CatMascot className="h-14 w-14 text-muted" expression="closed" />
      {message}
    </div>
  );
}
