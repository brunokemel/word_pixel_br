// @vitest-environment jsdom

import type { Session } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpWorldPixelApi } from "./http-api";
import { ApiError } from "./types";

const session = { access_token: "supabase-access-token" } as Session;
const payload = {
  targetType: "pixel" as const,
  targetId: "32768:16384",
  category: "explicit_sexual" as const,
  reason: "Conteúdo sexual explícito",
};

function response(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("HttpWorldPixelApi.submitReport", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("envia Bearer, categoria e targetId cellX:cellY e aceita sucesso 201", async () => {
    vi.mocked(fetch).mockResolvedValue(response(201, { ok: true, data: { report: { id: "report-id", category: "explicit_sexual", status: "open", created_at: "2026-11-08T12:00:00.000Z" } }, request_id: "request-id" }));
    const api = new HttpWorldPixelApi("https://api.example.test", async () => session, async () => null);
    const report = await api.submitReport(payload);
    expect(report).toMatchObject({ id: "report-id", category: "explicit_sexual", status: "open" });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(url).toBe("https://api.example.test/reports");
    expect(init?.method).toBe("POST");
    expect(headers.get("Authorization")).toBe("Bearer supabase-access-token");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Accept")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it("não envia sem sessão", async () => {
    const api = new HttpWorldPixelApi("https://api.example.test", async () => null, async () => null);
    await expect(api.submitReport(payload)).rejects.toMatchObject({ code: "UNAUTHENTICATED", status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    [400, "VALIDATION_ERROR"],
    [401, "UNAUTHENTICATED"],
    [429, "RATE_LIMITED"],
  ])("preserva erro HTTP %i e request_id", async (status, code) => {
    vi.mocked(fetch).mockResolvedValue(response(status, { ok: false, error: { code, message: "Falha", request_id: `request-${status}` } }));
    const api = new HttpWorldPixelApi("https://api.example.test", async () => session, async () => null);
    const error = await api.submitReport(payload).catch((caught) => caught) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code, status, requestId: `request-${status}` });
  });

  it("não repete mutação quando o serviço está indisponível", async () => {
    vi.mocked(fetch).mockResolvedValue(response(503, { ok: false, error: { code: "SERVICE_UNAVAILABLE", retryable: true, message: "raw" } }));
    const api = new HttpWorldPixelApi("https://api.example.test", async () => session, async () => null);
    await expect(api.submitReport(payload)).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", retryable: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("perfil autenticado", () => {
  beforeEach(() => { window.localStorage.clear(); vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => vi.unstubAllGlobals());

  it("busca e atualiza o perfil real com Bearer e trim já validado", async () => {
    const apiProfile = { id: "user-id", username: "pixelista", display_name: "Pixelista", avatar_url: null, email: "pessoa@exemplo.com", email_confirmed_at: "2026-11-09T00:00:00Z", created_at: "2026-11-09T00:00:00Z", updated_at: "2026-11-09T00:00:00Z" };
    vi.mocked(fetch).mockResolvedValueOnce(response(200, { ok: true, data: { user: apiProfile } })).mockResolvedValueOnce(response(200, { ok: true, data: { user: apiProfile } }));
    const api = new HttpWorldPixelApi("https://api.example.test", async () => session, async () => null);
    await expect(api.getProfile()).resolves.toMatchObject({ id: "user-id", displayName: "Pixelista" });
    await api.updateProfile({ username: "Novo_User", displayName: "Pixelista" });
    const [, profileInit] = vi.mocked(fetch).mock.calls[0];
    const [patchUrl, patchInit] = vi.mocked(fetch).mock.calls[1];
    expect(new Headers(profileInit?.headers).get("Authorization")).toBe("Bearer supabase-access-token");
    expect(patchUrl).toBe("https://api.example.test/user");
    expect(patchInit?.method).toBe("PATCH");
    expect(JSON.parse(String(patchInit?.body))).toEqual({ username: "novo_user", display_name: "Pixelista" });
  });

  it("renova uma vez no 401 e não entra em loop", async () => {
    vi.mocked(fetch).mockImplementation(async () => response(401, { ok: false, error: { code: "UNAUTHENTICATED", message: "expired" } }));
    const refresh = vi.fn().mockResolvedValue(session);
    const api = new HttpWorldPixelApi("https://api.example.test", async () => session, refresh);
    await expect(api.getProfile()).rejects.toMatchObject({ code: "UNAUTHENTICATED", status: 401 });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("valida username antes do envio e preserva conflito 409", async () => {
    const api = new HttpWorldPixelApi("https://api.example.test", async () => session, async () => null);
    await expect(api.updateProfile({ username: "Inválido!" })).rejects.toMatchObject({ code: "VALIDATION_ERROR", status: 400 });
    expect(fetch).not.toHaveBeenCalled();

    vi.mocked(fetch).mockResolvedValue(response(409, { ok: false, error: { code: "USERNAME_TAKEN", message: "taken" } }));
    await expect(api.updateProfile({ username: "usuario_valido" })).rejects.toMatchObject({ code: "USERNAME_TAKEN", status: 409 });
  });

  it("repete GET no máximo duas vezes em gateway indisponível e preserva request id", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("gateway", { status: 502, headers: { "X-Request-Id": "gateway-id" } }));
    const api = new HttpWorldPixelApi("https://api.example.test", async () => session, async () => null);
    await expect(api.getWallet()).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", requestId: "gateway-id" });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
