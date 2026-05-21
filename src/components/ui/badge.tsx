import { cn } from "@/lib/utils";

type BadgeTone = "slate" | "blue" | "green" | "amber" | "red";

const tones: Record<BadgeTone, string> = {
  slate: "border-slate-300 bg-slate-100 text-slate-700",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-800"
};

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-wide", tones[tone])}>{children}</span>;
}
