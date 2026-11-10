// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";
import { ApiError, type UserProfile } from "@/lib/types";
import { LoginModal, ProfileModal } from "./ui";

afterEach(() => { cleanup(); vi.useRealTimers(); });

function renderLogin(onRequestOtp = vi.fn().mockResolvedValue(undefined), onVerifyOtp = vi.fn().mockResolvedValue(undefined)) {
  window.localStorage.setItem("world-pixel-locale", "pt");
  render(<I18nProvider><LoginModal onClose={vi.fn()} onRequestOtp={onRequestOtp} onVerifyOtp={onVerifyOtp} /></I18nProvider>);
  return { onRequestOtp, onVerifyOtp };
}

describe("login por OTP", () => {
  it("valida, normaliza e solicita o código", async () => {
    const { onRequestOtp } = renderLogin();
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "invalido" } });
    fireEvent.submit(screen.getByLabelText("Seu e-mail").closest("form")!);
    expect(screen.getByText("Digite um e-mail válido.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "  Pessoa@Exemplo.COM " } });
    fireEvent.click(screen.getByRole("button", { name: "Continuar com e-mail" }));
    await waitFor(() => expect(onRequestOtp).toHaveBeenCalledWith("pessoa@exemplo.com"));
    expect(screen.getByLabelText("Código de 6 dígitos")).toBeTruthy();
  });

  it("aceita colagem do código, confirma e impede código incompleto", async () => {
    const { onVerifyOtp } = renderLogin();
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "pessoa@exemplo.com" } });
    fireEvent.submit(screen.getByLabelText("Seu e-mail").closest("form")!);
    const input = await screen.findByLabelText("Código de 6 dígitos");
    const confirm = screen.getByRole("button", { name: "Confirmar código" });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    fireEvent.change(input, { target: { value: "123 456" } });
    fireEvent.click(confirm);
    await waitFor(() => expect(onVerifyOtp).toHaveBeenCalledWith("pessoa@exemplo.com", "123456"));
  });

  it("bloqueia reenvio e mostra código inválido e rate limit", async () => {
    const request = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new ApiError("RATE_LIMITED", "rate", undefined, 429));
    const verify = vi.fn().mockRejectedValue(new ApiError("UNAUTHENTICATED", "expired", undefined, 400));
    renderLogin(request, verify);
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "pessoa@exemplo.com" } });
    fireEvent.submit(screen.getByLabelText("Seu e-mail").closest("form")!);
    const input = await screen.findByLabelText("Código de 6 dígitos");
    expect(screen.getByRole("button", { name: /Reenviar em 60s/ }).hasAttribute("disabled")).toBe(true);
    fireEvent.change(input, { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar código" }));
    expect(await screen.findByText(/Código inválido ou expirado/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Corrigir e-mail" }));
    fireEvent.submit(screen.getByLabelText("Seu e-mail").closest("form")!);
    expect(await screen.findByText(/Muitas tentativas/)).toBeTruthy();
  });
});

describe("perfil", () => {
  const profile: UserProfile = { id: "user-id", displayName: "Artista-1234ABCD" };
  it("abre onboarding para nome temporário e envia nome com trim", () => {
    window.localStorage.setItem("world-pixel-locale", "pt");
    const onSave = vi.fn();
    render(<I18nProvider><ProfileModal profile={profile} required saving={false} error={null} onClose={vi.fn()} onSave={onSave} /></I18nProvider>);
    fireEvent.change(screen.getByLabelText("Nome de artista"), { target: { value: "  Pixelista  " } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));
    expect(onSave).toHaveBeenCalledWith("Pixelista");
  });
});
