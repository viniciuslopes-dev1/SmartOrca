import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeBudgetStatus, createBudget, duplicateBudget, getBudgetById, getBudgetStatusHistory, listBudgets, updateBudget } from "@/services/budgets.service";
import type { BudgetStatus } from "@/types/database.types";

export function useBudgets(params: { search?: string; status?: BudgetStatus | "all" } = {}) {
  return useQuery({ queryKey: ["budgets", params], queryFn: () => listBudgets(params) });
}

export function useBudget(id: string) {
  return useQuery({ queryKey: ["budget", id], queryFn: () => getBudgetById(id), enabled: Boolean(id) });
}

export function useBudgetStatusHistory(id: string) {
  return useQuery({ queryKey: ["budget-history", id], queryFn: () => getBudgetStatusHistory(id), enabled: Boolean(id) });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] })
  });
}

export function useUpdateBudget(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateBudget>[1]) => updateBudget(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", id] });
    }
  });
}

export function useChangeBudgetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: BudgetStatus; notes?: string }) => changeBudgetStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["budget-history", variables.id] });
    }
  });
}

export function useDuplicateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] })
  });
}
