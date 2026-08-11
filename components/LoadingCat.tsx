import { CatMascot } from "@/components/CatMascot";

export function LoadingCat() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-sm text-foreground/60">
      <CatMascot className="h-10 w-10 animate-bounce text-accent" />
      読み込み中...
    </div>
  );
}
