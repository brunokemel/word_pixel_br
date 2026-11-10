// @vitest-environment jsdom

import { beforeAll, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
  verifyOtp: vi.fn().mockResolvedValue({ data: { session: { access_token: "token" } }, error: null }),
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

describe("cliente Supabase OTP", () => {
  const api = new HttpWorldPixelApi("https://api.example.test");

  it("solicita OTP sem revelar conta existente", async () => {
    await api.requestOtp("  Pessoa@Exemplo.COM ");
    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: "pessoa@exemplo.com", options: { shouldCreateUser: true } });
  });

  it("confirma OTP de e-mail e restaura a sessão", async () => {
    await api.verifyOtp("pessoa@exemplo.com", "123 456");
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: "pessoa@exemplo.com", token: "123456", type: "email" });
    await expect(getSession()).resolves.toMatchObject({ access_token: "restored-token" });
  });

  it("faz logout pelo Supabase", async () => {
    await api.signOut();
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});
