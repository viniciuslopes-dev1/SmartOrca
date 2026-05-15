import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, deactivateClient, getClientById, getClientRelations, listClients, updateClient } from "@/services/clients.service";

export function useClients(search = "") {
  return useQuery({ queryKey: ["clients", search], queryFn: () => listClients(search) });
}

export function useClient(id: string) {
  return useQuery({ queryKey: ["client", id], queryFn: () => getClientById(id), enabled: Boolean(id) });
}

export function useClientRelations(id: string) {
  return useQuery({ queryKey: ["client-relations", id], queryFn: () => getClientRelations(id), enabled: Boolean(id) });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] })
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateClient>[1]) => updateClient(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
    }
  });
}

export function useDeactivateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] })
  });
}
