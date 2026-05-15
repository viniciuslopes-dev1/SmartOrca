export class AppServiceError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AppServiceError";
    this.code = code;
  }
}

export function normalizeSupabaseError(error: { message?: string; code?: string } | null) {
  if (!error) return new AppServiceError("Erro inesperado ao acessar os dados.");
  return new AppServiceError(error.message ?? "Erro inesperado ao acessar os dados.", error.code);
}
