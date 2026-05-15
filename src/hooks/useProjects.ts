import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, getProjectBudgets, getProjectById, listProjects, updateProject } from "@/services/projects.service";
import type { ProjectStatus } from "@/types/database.types";

export function useProjects(params: { search?: string; clientId?: string; status?: ProjectStatus | "all" } = {}) {
  return useQuery({ queryKey: ["projects", params], queryFn: () => listProjects(params) });
}

export function useProject(id: string) {
  return useQuery({ queryKey: ["project", id], queryFn: () => getProjectById(id), enabled: Boolean(id) });
}

export function useProjectBudgets(id: string) {
  return useQuery({ queryKey: ["project-budgets", id], queryFn: () => getProjectBudgets(id), enabled: Boolean(id) });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] })
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateProject>[1]) => updateProject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    }
  });
}
