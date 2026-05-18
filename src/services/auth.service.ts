import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ForgotPasswordFormValues, LoginFormValues, RegisterFormValues } from "@/lib/validations/schemas";
import { normalizeSupabaseError } from "@/services/service-error";

export async function signInWithPassword(values: LoginFormValues) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password
  });
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function signUpWithPassword(values: RegisterFormValues) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.full_name,
        phone: values.phone || null,
        workspace_name: values.workspace_name
      }
    }
  });
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw normalizeSupabaseError(error);
}

export async function sendPasswordReset(values: ForgotPasswordFormValues) {
  const supabase = createSupabaseBrowserClient();
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
  const { data, error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo });
  if (error) throw normalizeSupabaseError(error);
  return data;
}
