import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, deactivateClient, getClientById, getClientRelations, listClients, updateClient } from "@/services/clients.service";
import { useWorkspaceId } from "@/hooks/useWorkspace";

export function useClients(search = "") {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["clients", workspaceId, search], queryFn: () => listClients(workspaceId as string, search), enabled: Boolean(workspaceId) });
}

export function useClient(id: string) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["client", workspaceId, id], queryFn: () => getClientById(workspaceId as string, id), enabled: Boolean(workspaceId && id) });
}

export function useClientRelations(id: string) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["client-relations", workspaceId, id], queryFn: () => getClientRelations(workspaceId as string, id), enabled: Boolean(workspaceId && id) });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof createClient>[1]) => createClient(workspaceId as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] })
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateClient>[2]) => updateClient(workspaceId as string, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
    }
  });
}

export function useDeactivateClient() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (id: string) => deactivateClient(workspaceId as string, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] })
  });
}
