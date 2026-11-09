// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { I18nProvider } from "../lib/i18n";
import type { GridCell } from "../lib/types";
import { CellCard, ReportModal } from "./ui";

const cell: GridCell = { x: 32768, y: 16384, lng: 0, lat: 0, color: "#e50000" };

function translated(children: ReactNode) {
  return render(<I18nProvider>{children}</I18nProvider>);
}

afterEach(cleanup);

describe("denúncia de pixel", () => {
  it("abre pelo cartão e fecha por cancelar ou Escape", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return <><CellCard cell={cell} onClose={() => undefined} onReport={() => setOpen(true)} />{open && <ReportModal cell={cell} submitting={false} submitError={null} onClose={() => setOpen(false)} onSubmit={() => undefined} />}</>;
    }
    translated(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Denunciar" }));
    expect(screen.getByRole("dialog", { name: "Denunciar pixel" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Categoria"));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Denunciar" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("valida categoria e motivo entre 3 e 500 caracteres", () => {
    translated(<ReportModal cell={cell} submitting={false} submitError={null} onClose={() => undefined} onSubmit={() => undefined} />);
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "ab" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar denúncia" }));
    expect(screen.getByText("Selecione uma categoria.")).toBeTruthy();
    expect(screen.getByText("A descrição deve ter entre 3 e 500 caracteres.")).toBeTruthy();
  });

  it("envia a categoria correta e remove espaços externos do motivo", () => {
    const onSubmit = vi.fn();
    translated(<ReportModal cell={cell} submitting={false} submitError={null} onClose={() => undefined} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "hate_extremism" } });
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "  Conteúdo ofensivo  " } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar denúncia" }));
    expect(onSubmit).toHaveBeenCalledWith("hate_extremism", "Conteúdo ofensivo");
  });

  it("desabilita o formulário e impede envio duplicado", () => {
    const onSubmit = vi.fn();
    function Harness() {
      const [submitting, setSubmitting] = useState(false);
      return <ReportModal cell={cell} submitting={submitting} submitError={null} onClose={() => undefined} onSubmit={(category, reason) => { onSubmit(category, reason); setSubmitting(true); }} />;
    }
    translated(<Harness />);
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "spam_vandalism" } });
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Vandalismo repetido" } });
    const submit = screen.getByRole("button", { name: "Enviar denúncia" });
    fireEvent.click(submit);
    fireEvent.click(screen.getByRole("button", { name: /Enviando/ }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Enviando/ }).hasAttribute("disabled")).toBe(true);
  });
});
