import { getSupabaseClient } from "@/lib/supabase/client";
import { AppServiceError, normalizeSupabaseError } from "@/services/service-error";
import type { Database } from "@/types/database.types";

type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];
const LOGO_BUCKET = "workspace-branding";
const LOGO_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

function fileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function logoPath(workspaceId: string, extension: string) {
  const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${workspaceId}/logo-${uniqueId}.${extension}`;
}

function normalizeLogoUploadError(error: { message?: string; code?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  if (message.includes("bucket not found")) {
    return new AppServiceError(
      `Bucket de logos nao encontrado no Supabase. Crie/aplique a migration do bucket "${LOGO_BUCKET}" antes de enviar a logo.`,
      error?.code
    );
  }
  return normalizeSupabaseError(error);
}

export async function getSettings(workspaceId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("settings").select("*").eq("workspace_id", workspaceId).single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function updateSettings(workspaceId: string, input: SettingsUpdate) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("settings")
    .update(input)
    .eq("workspace_id", workspaceId)
    .select()
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export function validateLogoFile(file: File, options: { maxSizeBytes: number }) {
  const extension = fileExtension(file.name);
  if (!LOGO_EXTENSIONS.has(extension)) {
    throw new Error("Formato inválido. Use PNG, JPG, JPEG ou WEBP.");
  }
  if (file.size > options.maxSizeBytes) {
    throw new Error(`Arquivo maior que o limite de ${Math.round(options.maxSizeBytes / 1024 / 1024)}MB.`);
  }
}

export async function uploadWorkspaceLogo(workspaceId: string, file: File) {
  const supabase = getSupabaseClient();
  const extension = fileExtension(file.name);
  const currentSettings = await getSettings(workspaceId);
  const path = logoPath(workspaceId, extension);

  const upload = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    cacheControl: "0",
    upsert: false,
    contentType: file.type
  });
  if (upload.error) throw normalizeLogoUploadError(upload.error);

  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
  const updatedSettings = await updateSettings(workspaceId, {
    logo_path: path,
    logo_url: data.publicUrl
  });

  if (currentSettings.logo_path && currentSettings.logo_path !== path) {
    await supabase.storage.from(LOGO_BUCKET).remove([currentSettings.logo_path]);
  }

  return updatedSettings;
}

export async function removeWorkspaceLogo(workspaceId: string, logoPath?: string | null) {
  if (!logoPath) return;
  const supabase = getSupabaseClient();
  const deletion = await supabase.storage.from(LOGO_BUCKET).remove([logoPath]);
  if (deletion.error) throw normalizeSupabaseError(deletion.error);
  await updateSettings(workspaceId, { logo_path: null, logo_url: null });
}
