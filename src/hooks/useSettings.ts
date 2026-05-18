import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/services/settings.service";
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
