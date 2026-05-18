import { useQuery } from "@tanstack/react-query";
import { useWorkspaceId } from "@/hooks/useWorkspace";
import { getDashboardData, getReportsData } from "@/services/reports.service";

export function useDashboardData() {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["dashboard", workspaceId], queryFn: () => getDashboardData(workspaceId as string), enabled: Boolean(workspaceId) });
}

export function useReportsData() {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["reports", workspaceId], queryFn: () => getReportsData(workspaceId as string), enabled: Boolean(workspaceId) });
}
