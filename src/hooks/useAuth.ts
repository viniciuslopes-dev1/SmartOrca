"use client";

import type { User } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { sendPasswordReset, signInWithPassword, signOut, signUpWithPassword } from "@/services/auth.service";

export function useAuth() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async (): Promise<User | null> => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth-user"], data.user ?? null);
      void queryClient.invalidateQueries({ queryKey: ["current-workspace"] });
      void queryClient.invalidateQueries({ queryKey: ["workspace-memberships"] });
    }
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signUpWithPassword,
    onSuccess: () => queryClient.invalidateQueries()
  });
}

export function usePasswordReset() {
  return useMutation({ mutationFn: sendPasswordReset });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.clear()
  });
}
