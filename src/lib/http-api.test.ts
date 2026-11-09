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
});
