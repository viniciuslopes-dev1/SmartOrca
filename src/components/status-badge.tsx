import { Badge } from "@/components/ui/badge";
import { budgetStatusLabels, projectStatusLabels } from "@/lib/labels";
import type { BudgetStatus, ProjectStatus } from "@/types/database.types";

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  const tone = status === "approved" ? "green" : status === "sent" ? "blue" : status === "rejected" || status === "cancelled" ? "red" : status === "expired" ? "amber" : "slate";
  return <Badge tone={tone}>{budgetStatusLabels[status]}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const tone = status === "approved" || status === "finished" ? "green" : status === "estimating" || status === "in_progress" ? "blue" : status === "waiting_approval" ? "amber" : status === "cancelled" ? "red" : "slate";
  return <Badge tone={tone}>{projectStatusLabels[status]}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "green" : "slate"}>{active ? "Ativo" : "Inativo"}</Badge>;
}
