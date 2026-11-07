import { describe, expect, it } from "vitest";
import { localeLabels, locales, translate } from "./i18n";

describe("internacionalização", () => {
  it("oferece português, inglês e espanhol", () => {
    expect(locales).toEqual(["pt", "en", "es"]);
    expect(Object.keys(localeLabels)).toEqual(["pt", "en", "es"]);
  });

  it("traduz a mesma chave nos três idiomas", () => {
    expect(translate("pt", "header.login")).toBe("Entrar");
    expect(translate("en", "header.login")).toBe("Log in");
    expect(translate("es", "header.login")).toBe("Entrar");
  });

  it("interpola valores dinâmicos", () => {
    expect(translate("es", "toast.welcome", { name: "Luna" })).toBe("¡Hola, Luna!");
  });
});
