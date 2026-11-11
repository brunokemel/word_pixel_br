// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ data: { session: { access_token: "token" } }, error: null }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  updateUser: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "restored-token" } }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ auth })) }));

import { HttpWorldPixelApi } from "./http-api";
import { getSession } from "./supabase";

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");
});

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, data: { user: { id: "user-id", username: "novo_user", display_name: "Pixelista", avatar_url: null, email: "pessoa@exemplo.com", email_confirmed_at: null, created_at: "2026-11-09T00:00:00Z", updated_at: "2026-11-09T00:00:00Z" } } }), { status: 200, headers: { "Content-Type": "application/json" } })));
});

describe("cliente Supabase com senha", () => {
  const api = new HttpWorldPixelApi("https://api.example.test");

  it("faz login e cadastro normalizando o e-mail", async () => {
    await api.signInWithPassword("  Pessoa@Exemplo.COM ", "senha-segura");
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "pessoa@exemplo.com", password: "senha-segura" });
    await expect(api.signUpWithPassword("Pessoa@Exemplo.COM", "senha-segura", "Pixelista", "Novo_User")).resolves.toBe(true);
    expect(auth.signUp).toHaveBeenCalledWith({ email: "pessoa@exemplo.com", password: "senha-segura", options: { data: { display_name: "Pixelista" } } });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://api.example.test/user");
    expect(JSON.parse(String(init?.body))).toEqual({ username: "novo_user" });
  });

  it("solicita recuperação, atualiza a senha e restaura a sessão", async () => {
    await api.requestPasswordReset("pessoa@exemplo.com");
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("pessoa@exemplo.com", { redirectTo: window.location.origin });
    await api.updatePassword("nova-senha");
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "nova-senha" });
    await expect(getSession()).resolves.toMatchObject({ access_token: "restored-token" });
  });

  it("faz logout pelo Supabase", async () => {
    await api.signOut();
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});
