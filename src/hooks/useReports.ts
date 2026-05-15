import { useQuery } from "@tanstack/react-query";
import { getDashboardData, getReportsData } from "@/services/reports.service";

export function useDashboardData() {
  return useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
}

export function useReportsData() {
  return useQuery({ queryKey: ["reports"], queryFn: getReportsData });
}
