import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, getProjectBudgets, getProjectById, listProjects, updateProject } from "@/services/projects.service";
import { useWorkspaceId } from "@/hooks/useWorkspace";
import type { ProjectStatus } from "@/types/database.types";

export function useProjects(params: { search?: string; clientId?: string; status?: ProjectStatus | "all" } = {}) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["projects", workspaceId, params], queryFn: () => listProjects(workspaceId as string, params), enabled: Boolean(workspaceId) });
}

export function useProject(id: string) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["project", workspaceId, id], queryFn: () => getProjectById(workspaceId as string, id), enabled: Boolean(workspaceId && id) });
}

export function useProjectBudgets(id: string) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["project-budgets", workspaceId, id], queryFn: () => getProjectBudgets(workspaceId as string, id), enabled: Boolean(workspaceId && id) });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof createProject>[1]) => createProject(workspaceId as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] })
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateProject>[2]) => updateProject(workspaceId as string, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    }
  });
}
