import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCatalogItem, deactivateCatalogItem, getCatalogItemById, importCatalogItems, listCatalogItems, updateCatalogItem } from "@/services/catalog.service";
import { useWorkspaceId } from "@/hooks/useWorkspace";
import type { CatalogItemType } from "@/types/database.types";

export function useCatalogItems(params: { search?: string; type?: CatalogItemType | "all"; activeOnly?: boolean } = {}) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["catalog-items", workspaceId, params], queryFn: () => listCatalogItems(workspaceId as string, params), enabled: Boolean(workspaceId) });
}

export function useCatalogItem(id: string) {
  const { workspaceId } = useWorkspaceId();
  return useQuery({ queryKey: ["catalog-item", workspaceId, id], queryFn: () => getCatalogItemById(workspaceId as string, id), enabled: Boolean(workspaceId && id) });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof createCatalogItem>[1]) => createCatalogItem(workspaceId as string, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog-items"] })
  });
}

export function useUpdateCatalogItem(id: string) {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateCatalogItem>[2]) => updateCatalogItem(workspaceId as string, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-item", id] });
    }
  });
}

export function useDeactivateCatalogItem() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (id: string) => deactivateCatalogItem(workspaceId as string, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog-items"] })
  });
}

export function useImportCatalogItems() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceId();
  return useMutation({
    mutationFn: (items: Parameters<typeof importCatalogItems>[1]) => importCatalogItems(workspaceId as string, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog-items"] })
  });
}
