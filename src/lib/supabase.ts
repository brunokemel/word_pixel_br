import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { UserProfile } from "./types";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  client ??= createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}

export function userToProfile(user: User): UserProfile {
  const displayName = user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Artista";
  return { id: user.id, displayName, avatarUrl: user.user_metadata?.avatar_url };
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
