"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const locales = ["pt", "en", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

const pt = {
  "language.label": "Idioma",
  "header.live": "AO VIVO",
  "header.help": "Como funciona",
  "header.balance": "saldo",
  "header.logout": "Sair",
  "header.login": "Entrar",
  "tools.label": "Ferramentas do mapa",
  "tools.navigate": "Navegar",
  "tools.paint": "Pintar",
  "tools.protect": "Proteger",
  "palette.label": "Paleta de cores",
  "palette.select": "Selecionar cor {color}",
  "map.label": "Mapa-múndi interativo de pixels",
  "map.loading": "Carregando o mundo…",
  "map.zoomPaint": "Aproxime mais para pintar",
  "map.zoomProtect": "Aproxime mais para proteger",
  "map.protectHint": "Segure Ctrl + botão esquerdo e arraste · máximo 256 pixels",
  "hero.eyebrow": "UM MAPA · MILHÕES DE HISTÓRIAS",
  "hero.titleStart": "Deixe sua marca",
  "hero.titleEnd": "no mundo.",
  "hero.description": "Aproxime, escolha uma cor e transforme um pixel em parte de algo gigante.",
  "legend.free": "livre",
  "legend.protected": "protegido",
  "connection.reconnecting": "Reconectando ao mapa…",
  "cell.label": "Detalhes do pixel",
  "cell.close": "Fechar detalhes",
  "cell.selected": "PIXEL SELECIONADO",
  "cell.lastPaint": "Última pintura",
  "cell.unpainted": "Ainda sem pintura",
  "cell.coordinate": "Coordenada",
  "cell.protectedBy": "Protegido por",
  "cell.daysRemaining": "{days} dias restantes",
  "modal.close": "Fechar",
  "login.label": "Entrar no World Pixel",
  "login.eyebrow": "ENTRE NA COMUNIDADE",
  "login.title": "Sua marca no mundo começa aqui.",
  "login.description": "Entre para pintar, proteger seus pixels e acompanhar suas criações.",
  "login.email": "Seu e-mail",
  "login.placeholder": "voce@exemplo.com",
  "login.loading": "Entrando…",
  "login.continue": "Continuar com e-mail",
  "login.prototype": "Protótipo: qualquer e-mail válido cria uma sessão local.",
  "help.label": "Como funciona",
  "help.eyebrow": "COMO FUNCIONA",
  "help.title": "O mundo é a sua tela.",
  "help.zoomTitle": "Aproxime",
  "help.zoomText": "Dê zoom até enxergar a grade.",
  "help.paintTitle": "Escolha e pinte",
  "help.paintText": "Selecione uma cor e toque em uma área terrestre.",
  "help.protectTitle": "Proteja",
  "help.protectText": "Arraste para selecionar até 256 pixels e proteja a área por 30 dias.",
  "help.rulesTitle": "Regras da comunidade",
  "help.rulesText": "Crie com respeito. Conteúdo ofensivo pode ser removido e contas podem ser bloqueadas.",
  "protection.label": "Proteger área",
  "protection.confirmedEyebrow": "ÁREA PROTEGIDA",
  "protection.confirmedTitle": "Este pedaço do mundo é seu.",
  "protection.confirmedText": "Seu bloco ficará protegido contra alterações por 30 dias.",
  "protection.back": "Voltar ao mapa",
  "protection.eyebrow": "PROTEÇÃO DE ÁREA",
  "protection.title": "Guarde sua criação.",
  "protection.description": "Ninguém poderá alterar este bloco enquanto a proteção estiver ativa.",
  "protection.area": "Área",
  "protection.pixels": "{width} × {height} · {count} pixels",
  "protection.duration": "Duração",
  "protection.days": "30 dias",
  "protection.coordinate": "Coordenada",
  "protection.total": "Total",
  "protection.error": "Não foi possível concluir. Confira seu saldo e tente novamente.",
  "protection.processing": "Protegendo…",
  "protection.confirm": "Confirmar proteção",
  "toast.loginToPaint": "Entre para pintar este pixel.",
  "toast.loginToProtect": "Entre para proteger uma área.",
  "toast.protectedBy": "Área protegida por {name}.",
  "toast.pixelPainted": "Pixel pintado!",
  "toast.paintFailed": "Não foi possível pintar agora.",
  "toast.areaUnavailable": "Área indisponível.",
  "toast.areaProtected": "Área protegida por 30 dias!",
  "toast.loggedOut": "Você saiu da conta.",
  "toast.welcome": "Olá, {name}!",
  "preview.selectedArea": "Área selecionada",
  "error.UNAUTHENTICATED": "Entre para continuar.",
  "error.RATE_LIMITED": "Muitas ações em pouco tempo. Tente novamente em instantes.",
  "error.CELL_NOT_LAND": "Este pixel fica no oceano.",
  "error.AREA_PROTECTED": "Esta área está protegida.",
  "error.INSUFFICIENT_CREDITS": "Saldo insuficiente.",
  "error.CONFLICT": "Este bloco já está protegido.",
  "error.VALIDATION_ERROR": "Os dados enviados não são válidos.",
} as const;

export type TranslationKey = keyof typeof pt;
type Catalog = Record<TranslationKey, string>;

const en: Catalog = {
  "language.label": "Language", "header.live": "LIVE", "header.help": "How it works", "header.balance": "balance", "header.logout": "Log out", "header.login": "Log in",
  "tools.label": "Map tools", "tools.navigate": "Explore", "tools.paint": "Paint", "tools.protect": "Protect", "palette.label": "Color palette", "palette.select": "Select color {color}",
  "map.label": "Interactive world pixel map", "map.loading": "Loading the world…", "map.zoomPaint": "Zoom in to paint", "map.zoomProtect": "Zoom in to protect", "map.protectHint": "Hold Ctrl + left button and drag · maximum 256 pixels",
  "hero.eyebrow": "ONE MAP · MILLIONS OF STORIES", "hero.titleStart": "Leave your mark", "hero.titleEnd": "on the world.", "hero.description": "Zoom in, choose a color and turn one pixel into part of something huge.",
  "legend.free": "available", "legend.protected": "protected", "connection.reconnecting": "Reconnecting to the map…",
  "cell.label": "Pixel details", "cell.close": "Close details", "cell.selected": "SELECTED PIXEL", "cell.lastPaint": "Last painted", "cell.unpainted": "Not painted yet", "cell.coordinate": "Coordinates", "cell.protectedBy": "Protected by", "cell.daysRemaining": "{days} days remaining",
  "modal.close": "Close", "login.label": "Log in to World Pixel", "login.eyebrow": "JOIN THE COMMUNITY", "login.title": "Your mark on the world starts here.", "login.description": "Log in to paint, protect your pixels and follow your creations.", "login.email": "Your email", "login.placeholder": "you@example.com", "login.loading": "Logging in…", "login.continue": "Continue with email", "login.prototype": "Prototype: any valid email creates a local session.",
  "help.label": "How it works", "help.eyebrow": "HOW IT WORKS", "help.title": "The world is your canvas.", "help.zoomTitle": "Zoom in", "help.zoomText": "Zoom until you can see the grid.", "help.paintTitle": "Choose and paint", "help.paintText": "Pick a color and tap a land area.", "help.protectTitle": "Protect", "help.protectText": "Drag to select up to 256 pixels and protect the area for 30 days.", "help.rulesTitle": "Community rules", "help.rulesText": "Create respectfully. Offensive content may be removed and accounts may be blocked.",
  "protection.label": "Protect area", "protection.confirmedEyebrow": "AREA PROTECTED", "protection.confirmedTitle": "This piece of the world is yours.", "protection.confirmedText": "Your block will be protected from changes for 30 days.", "protection.back": "Back to map", "protection.eyebrow": "AREA PROTECTION", "protection.title": "Keep your creation safe.", "protection.description": "No one can change this block while protection is active.", "protection.area": "Area", "protection.pixels": "{width} × {height} · {count} pixels", "protection.duration": "Duration", "protection.days": "30 days", "protection.coordinate": "Coordinates", "protection.total": "Total", "protection.error": "We couldn't complete this. Check your balance and try again.", "protection.processing": "Protecting…", "protection.confirm": "Confirm protection",
  "toast.loginToPaint": "Log in to paint this pixel.", "toast.loginToProtect": "Log in to protect an area.", "toast.protectedBy": "Area protected by {name}.", "toast.pixelPainted": "Pixel painted!", "toast.paintFailed": "Unable to paint right now.", "toast.areaUnavailable": "Area unavailable.", "toast.areaProtected": "Area protected for 30 days!", "toast.loggedOut": "You have logged out.", "toast.welcome": "Hello, {name}!", "preview.selectedArea": "Selected area",
  "error.UNAUTHENTICATED": "Log in to continue.", "error.RATE_LIMITED": "Too many actions. Try again in a moment.", "error.CELL_NOT_LAND": "This pixel is in the ocean.", "error.AREA_PROTECTED": "This area is protected.", "error.INSUFFICIENT_CREDITS": "Insufficient balance.", "error.CONFLICT": "This block is already protected.", "error.VALIDATION_ERROR": "The submitted data is not valid.",
};

const es: Catalog = {
  "language.label": "Idioma", "header.live": "EN VIVO", "header.help": "Cómo funciona", "header.balance": "saldo", "header.logout": "Salir", "header.login": "Entrar",
  "tools.label": "Herramientas del mapa", "tools.navigate": "Explorar", "tools.paint": "Pintar", "tools.protect": "Proteger", "palette.label": "Paleta de colores", "palette.select": "Seleccionar color {color}",
  "map.label": "Mapamundi interactivo de píxeles", "map.loading": "Cargando el mundo…", "map.zoomPaint": "Acércate para pintar", "map.zoomProtect": "Acércate para proteger", "map.protectHint": "Mantén Ctrl + botón izquierdo y arrastra · máximo 256 píxeles",
  "hero.eyebrow": "UN MAPA · MILLONES DE HISTORIAS", "hero.titleStart": "Deja tu huella", "hero.titleEnd": "en el mundo.", "hero.description": "Acércate, elige un color y convierte un píxel en parte de algo enorme.",
  "legend.free": "libre", "legend.protected": "protegido", "connection.reconnecting": "Reconectando al mapa…",
  "cell.label": "Detalles del píxel", "cell.close": "Cerrar detalles", "cell.selected": "PÍXEL SELECCIONADO", "cell.lastPaint": "Última pintura", "cell.unpainted": "Aún sin pintar", "cell.coordinate": "Coordenadas", "cell.protectedBy": "Protegido por", "cell.daysRemaining": "{days} días restantes",
  "modal.close": "Cerrar", "login.label": "Entrar en World Pixel", "login.eyebrow": "ÚNETE A LA COMUNIDAD", "login.title": "Tu huella en el mundo comienza aquí.", "login.description": "Entra para pintar, proteger tus píxeles y seguir tus creaciones.", "login.email": "Tu correo", "login.placeholder": "tu@ejemplo.com", "login.loading": "Entrando…", "login.continue": "Continuar con correo", "login.prototype": "Prototipo: cualquier correo válido crea una sesión local.",
  "help.label": "Cómo funciona", "help.eyebrow": "CÓMO FUNCIONA", "help.title": "El mundo es tu lienzo.", "help.zoomTitle": "Acércate", "help.zoomText": "Haz zoom hasta ver la cuadrícula.", "help.paintTitle": "Elige y pinta", "help.paintText": "Elige un color y toca una zona terrestre.", "help.protectTitle": "Protege", "help.protectText": "Arrastra para seleccionar hasta 256 píxeles y protege el área durante 30 días.", "help.rulesTitle": "Reglas de la comunidad", "help.rulesText": "Crea con respeto. El contenido ofensivo puede eliminarse y las cuentas pueden bloquearse.",
  "protection.label": "Proteger área", "protection.confirmedEyebrow": "ÁREA PROTEGIDA", "protection.confirmedTitle": "Este pedazo del mundo es tuyo.", "protection.confirmedText": "Tu bloque estará protegido contra cambios durante 30 días.", "protection.back": "Volver al mapa", "protection.eyebrow": "PROTECCIÓN DE ÁREA", "protection.title": "Guarda tu creación.", "protection.description": "Nadie podrá cambiar este bloque mientras la protección esté activa.", "protection.area": "Área", "protection.pixels": "{width} × {height} · {count} píxeles", "protection.duration": "Duración", "protection.days": "30 días", "protection.coordinate": "Coordenadas", "protection.total": "Total", "protection.error": "No pudimos completar la operación. Revisa tu saldo e inténtalo de nuevo.", "protection.processing": "Protegiendo…", "protection.confirm": "Confirmar protección",
  "toast.loginToPaint": "Entra para pintar este píxel.", "toast.loginToProtect": "Entra para proteger un área.", "toast.protectedBy": "Área protegida por {name}.", "toast.pixelPainted": "¡Píxel pintado!", "toast.paintFailed": "No se puede pintar ahora.", "toast.areaUnavailable": "Área no disponible.", "toast.areaProtected": "¡Área protegida durante 30 días!", "toast.loggedOut": "Has cerrado la sesión.", "toast.welcome": "¡Hola, {name}!", "preview.selectedArea": "Área seleccionada",
  "error.UNAUTHENTICATED": "Entra para continuar.", "error.RATE_LIMITED": "Demasiadas acciones. Inténtalo de nuevo en unos instantes.", "error.CELL_NOT_LAND": "Este píxel está en el océano.", "error.AREA_PROTECTED": "Esta área está protegida.", "error.INSUFFICIENT_CREDITS": "Saldo insuficiente.", "error.CONFLICT": "Este bloque ya está protegido.", "error.VALIDATION_ERROR": "Los datos enviados no son válidos.",
};

const catalogs: Record<Locale, Catalog> = { pt, en, es };
const storageKey = "world-pixel-locale";

export function translate(locale: Locale, key: TranslationKey, params?: Record<string, string | number>) {
  let value: string = catalogs[locale][key];
  if (params) Object.entries(params).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, String(replacement)); });
  return value;
}

function detectLocale(): Locale {
  const saved = window.localStorage.getItem(storageKey);
  if (saved && locales.includes(saved as Locale)) return saved as Locale;
  const browserLocale = window.navigator.language.toLowerCase();
  if (browserLocale.startsWith("es")) return "es";
  if (browserLocale.startsWith("en")) return "en";
  return "pt";
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatCurrency: (cents: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => { setLocaleState(detectLocale()); }, []);
  useEffect(() => { document.documentElement.lang = locale === "pt" ? "pt-BR" : locale; }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    return translate(locale, key, params);
  }, [locale]);

  const formatCurrency = useCallback((cents: number) => new Intl.NumberFormat(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { style: "currency", currency: "BRL" },
  ).format(cents / 100), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t, formatCurrency }), [locale, setLocale, t, formatCurrency]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
