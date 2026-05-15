import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCatalogItem, deactivateCatalogItem, getCatalogItemById, listCatalogItems, updateCatalogItem } from "@/services/catalog.service";
import type { CatalogItemType } from "@/types/database.types";

export function useCatalogItems(params: { search?: string; type?: CatalogItemType | "all"; activeOnly?: boolean } = {}) {
  return useQuery({ queryKey: ["catalog-items", params], queryFn: () => listCatalogItems(params) });
}

export function useCatalogItem(id: string) {
  return useQuery({ queryKey: ["catalog-item", id], queryFn: () => getCatalogItemById(id), enabled: Boolean(id) });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCatalogItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog-items"] })
  });
}

export function useUpdateCatalogItem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateCatalogItem>[1]) => updateCatalogItem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-items"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-item", id] });
    }
  });
}

export function useDeactivateCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateCatalogItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog-items"] })
  });
}
