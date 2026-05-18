"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkspaceForCurrentUser, getCurrentWorkspace, listWorkspaceMemberships } from "@/services/workspace.service";

export function useWorkspaceMemberships() {
  return useQuery({ queryKey: ["workspace-memberships"], queryFn: listWorkspaceMemberships });
}

export function useWorkspace() {
  return useQuery({ queryKey: ["current-workspace"], queryFn: getCurrentWorkspace });
}

export function useWorkspaceId() {
  const workspace = useWorkspace();
  return {
    ...workspace,
    workspaceId: workspace.data?.workspace_id ?? null,
    currentWorkspace: workspace.data?.workspaces ?? null,
    role: workspace.data?.role ?? null
  };
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkspaceForCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-memberships"] });
      queryClient.invalidateQueries({ queryKey: ["current-workspace"] });
    }
  });
}
