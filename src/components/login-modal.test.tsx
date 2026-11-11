// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";
import type { UserProfile } from "@/lib/types";
import { LoginModal, ProfileModal } from "./ui";

afterEach(() => { cleanup(); vi.useRealTimers(); });

function renderLogin(onSignIn = vi.fn().mockResolvedValue(undefined), onSignUp = vi.fn().mockResolvedValue(true), onRequestPasswordReset = vi.fn().mockResolvedValue(undefined)) {
  window.localStorage.setItem("world-pixel-locale", "pt");
  render(<I18nProvider><LoginModal onClose={vi.fn()} onSignIn={onSignIn} onSignUp={onSignUp} onRequestPasswordReset={onRequestPasswordReset} /></I18nProvider>);
  return { onSignIn, onSignUp, onRequestPasswordReset };
}

describe("login por senha", () => {
  it("valida, normaliza e faz login", async () => {
    const { onSignIn } = renderLogin();
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "invalido" } });
    fireEvent.submit(screen.getByLabelText("Seu e-mail").closest("form")!);
    expect(screen.getByText("Digite um e-mail válido.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "  Pessoa@Exemplo.COM " } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(onSignIn).toHaveBeenCalledWith("pessoa@exemplo.com", "senha-segura"));
  });

  it("cria conta com senha", async () => {
    const { onSignUp } = renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Criar uma conta" }));
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "pessoa@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(onSignUp).toHaveBeenCalledWith("pessoa@exemplo.com", "senha-segura"));
  });

  it("envia recuperação neutra e aplica cooldown", async () => {
    const recovery = vi.fn().mockResolvedValue(undefined);
    renderLogin(undefined, undefined, recovery);
    fireEvent.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "pessoa@exemplo.com" } });
    fireEvent.submit(screen.getByLabelText("Seu e-mail").closest("form")!);
    await waitFor(() => expect(recovery).toHaveBeenCalledWith("pessoa@exemplo.com"));
    expect(screen.getByText(/Se o e-mail estiver cadastrado/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Reenviar em 60s/ }).hasAttribute("disabled")).toBe(true);
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
