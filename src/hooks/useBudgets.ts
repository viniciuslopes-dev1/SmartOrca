import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceId } from "@/hooks/useWorkspace";
import { changeBudgetStatus, createBudget, duplicateBudget, getBudgetById, getBudgetStatusHistory, listBudgets, updateBudget } from "@/services/budgets.service";
import type { BudgetStatus } from "@/types/database.types";

export function useBudgets(params: { search?: string; status?: BudgetStatus | "all" } = {}) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["budgets", workspaceId, params], queryFn: () => listBudgets(workspaceId as string, params), enabled: Boolean(workspaceId) });
}

export function useBudget(id: string) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["budget", workspaceId, id], queryFn: () => getBudgetById(workspaceId as string, id), enabled: Boolean(workspaceId && id) });
}

export function useBudgetStatusHistory(id: string) {
  return useQuery({ queryKey: ["budget-history", id], queryFn: () => getBudgetStatusHistory(id), enabled: Boolean(id) });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof createBudget>[1]) => createBudget(workspaceId as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] })
  });
}

export function useUpdateBudget(id: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateBudget>[2]) => updateBudget(workspaceId as string, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", id] });
    }
  });
}

export function useChangeBudgetStatus() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: BudgetStatus; notes?: string }) => changeBudgetStatus(workspaceId as string, id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["budget-history", variables.id] });
    }
  });
}

export function useDuplicateBudget() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (id: string) => duplicateBudget(workspaceId as string, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] })
  });
}
