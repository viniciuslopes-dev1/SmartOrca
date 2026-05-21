import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, removeWorkspaceLogo, updateSettings, uploadWorkspaceLogo } from "@/services/settings.service";
import { useWorkspaceId } from "@/hooks/useWorkspace";

export function useSettings() {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["settings", workspaceId], queryFn: () => getSettings(workspaceId as string), enabled: Boolean(workspaceId) });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateSettings>[1]) => updateSettings(workspaceId as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] })
  });
}

export function useUploadWorkspaceLogo() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (file: File) => uploadWorkspaceLogo(workspaceId as string, file),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", workspaceId], data);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    }
  });
}

export function useRemoveWorkspaceLogo() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (logoPath?: string | null) => removeWorkspaceLogo(workspaceId as string, logoPath),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] })
  });
}
