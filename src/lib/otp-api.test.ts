// @vitest-environment jsdom

import { beforeAll, describe, expect, it, vi } from "vitest";

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

describe("cliente Supabase com senha", () => {
  const api = new HttpWorldPixelApi("https://api.example.test");

  it("faz login e cadastro normalizando o e-mail", async () => {
    await api.signInWithPassword("  Pessoa@Exemplo.COM ", "senha-segura");
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "pessoa@exemplo.com", password: "senha-segura" });
    await expect(api.signUpWithPassword("Pessoa@Exemplo.COM", "senha-segura")).resolves.toBe(true);
    expect(auth.signUp).toHaveBeenCalledWith({ email: "pessoa@exemplo.com", password: "senha-segura" });
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
