import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, removeWorkspaceLogo, updateSettings, uploadWorkspaceLogo, type WorkspaceLogoSlot } from "@/services/settings.service";
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
    mutationFn: ({ file, slot = "cover" }: { file: File; slot?: WorkspaceLogoSlot }) => uploadWorkspaceLogo(workspaceId as string, file, slot),
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
    mutationFn: ({ logoPath, slot = "cover" }: { logoPath?: string | null; slot?: WorkspaceLogoSlot }) => removeWorkspaceLogo(workspaceId as string, logoPath, slot),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] })
  });
}
