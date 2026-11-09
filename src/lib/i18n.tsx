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
  "palette.groups": "Famílias de tons",
  "palette.group.neutral": "Neutros",
  "palette.group.warm": "Quentes",
  "palette.group.nature": "Natureza",
  "palette.group.cool": "Frios",
  "map.label": "Mapa-múndi interativo de pixels",
  "map.loading": "Carregando o mundo…",
  "map.zoomPaint": "Aproxime mais para pintar",
  "map.zoomProtect": "Aproxime mais para proteger",
  "map.protectHint": "Clique para selecionar um bloco de proteção 16 × 16",
  "map.stylusHint": "Para maior precisão, use uma caneta capacitiva.",
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
  "cell.report": "Denunciar",
  "modal.close": "Fechar",
  "login.label": "Entrar no World Pixel",
  "login.eyebrow": "ENTRE NA COMUNIDADE",
  "login.title": "Sua marca no mundo começa aqui.",
  "login.description": "Entre para pintar, proteger seus pixels e acompanhar suas criações.",
  "login.email": "Seu e-mail",
  "login.placeholder": "voce@exemplo.com",
  "login.loading": "Entrando…",
  "login.continue": "Continuar com e-mail",
  "login.prototype": "Enviaremos um link seguro para entrar, sem necessidade de senha.",
  "help.label": "Como funciona",
  "help.eyebrow": "COMO FUNCIONA",
  "help.title": "O mundo é a sua tela.",
  "help.zoomTitle": "Aproxime",
  "help.zoomText": "Dê zoom até enxergar a grade.",
  "help.paintTitle": "Escolha e pinte",
  "help.paintText": "Selecione uma cor e toque em uma área terrestre.",
  "help.protectTitle": "Proteja",
  "help.protectText": "Selecione um bloco 16 × 16 e proteja a área por 30 dias.",
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
  "report.label": "Denunciar pixel",
  "report.eyebrow": "DENÚNCIA",
  "report.title": "Enviar para análise",
  "report.description": "Informe por que este pixel deve ser analisado pela moderação.",
  "report.category": "Categoria",
  "report.categoryPlaceholder": "Selecione uma categoria",
  "report.reason": "Descrição",
  "report.reasonPlaceholder": "Descreva o problema encontrado",
  "report.counter": "{count}/500 caracteres",
  "report.cancel": "Cancelar",
  "report.submit": "Enviar denúncia",
  "report.submitting": "Enviando…",
  "report.retry": "Tentar novamente",
  "report.category.explicitSexual": "Conteúdo sexual explícito",
  "report.category.hateExtremism": "Ódio ou extremismo",
  "report.category.racismDiscrimination": "Racismo ou discriminação",
  "report.category.harassment": "Assédio",
  "report.category.violenceThreat": "Violência ou ameaça",
  "report.category.spamVandalism": "Spam ou vandalismo",
  "report.category.other": "Outro",
  "report.error.category": "Selecione uma categoria.",
  "report.error.reason": "A descrição deve ter entre 3 e 500 caracteres.",
  "report.error.validation": "Confira a categoria e a descrição.",
  "report.error.expired": "Sua sessão expirou. Entre novamente.",
  "report.error.rateLimited": "Você enviou muitas denúncias. Tente novamente mais tarde.",
  "report.error.generic": "Não foi possível enviar a denúncia. Tente novamente.",
  "toast.loginToPaint": "Entre para pintar este pixel.",
  "toast.loginToProtect": "Entre para proteger uma área.",
  "toast.protectedBy": "Área protegida por {name}.",
  "toast.pixelPainted": "Pixel pintado!",
  "toast.paintFailed": "Não foi possível pintar agora.",
  "toast.areaUnavailable": "Área indisponível.",
  "toast.areaProtected": "Área protegida por 30 dias!",
  "toast.loggedOut": "Você saiu da conta.",
  "toast.welcome": "Olá, {name}!",
  "toast.checkEmail": "Confira seu e-mail para concluir o acesso.",
  "toast.loginFailed": "Não foi possível enviar o link de acesso.",
  "toast.reportLogin": "Entre para denunciar este pixel.",
  "toast.reportSent": "Denúncia enviada para análise.",
  "preview.selectedArea": "Área selecionada",
  "error.UNAUTHENTICATED": "Entre para continuar.",
  "error.RATE_LIMITED": "Muitas ações em pouco tempo. Tente novamente em instantes.",
  "error.CELL_NOT_LAND": "Este pixel fica no oceano.",
  "error.AREA_PROTECTED": "Esta área está protegida.",
  "error.INSUFFICIENT_CREDITS": "Saldo insuficiente.",
  "error.AREA_CONFLICT": "Este bloco já está protegido.",
  "error.IDEMPOTENCY_CONFLICT": "Esta ação entrou em conflito. Tente novamente.",
  "error.FORBIDDEN": "Você não tem acesso a esta ação.",
  "error.NOT_FOUND": "O recurso solicitado não foi encontrado.",
  "error.INTERNAL_ERROR": "O servidor encontrou um erro. Tente novamente.",
  "error.NETWORK_ERROR": "Não foi possível conectar ao servidor.",
  "error.CONFIGURATION_ERROR": "A aplicação ainda não foi configurada para acessar o servidor.",
  "error.VALIDATION_ERROR": "Os dados enviados não são válidos.",
} as const;

export type TranslationKey = keyof typeof pt;
type Catalog = Record<TranslationKey, string>;

const en: Catalog = {
  "language.label": "Language", "header.live": "LIVE", "header.help": "How it works", "header.balance": "balance", "header.logout": "Log out", "header.login": "Log in",
  "tools.label": "Map tools", "tools.navigate": "Explore", "tools.paint": "Paint", "tools.protect": "Protect", "palette.label": "Color palette", "palette.select": "Select color {color}", "palette.groups": "Tone families", "palette.group.neutral": "Neutrals", "palette.group.warm": "Warm", "palette.group.nature": "Nature", "palette.group.cool": "Cool",
  "map.label": "Interactive world pixel map", "map.loading": "Loading the world…", "map.zoomPaint": "Zoom in to paint", "map.zoomProtect": "Zoom in to protect", "map.protectHint": "Click to select a 16 × 16 protection block", "map.stylusHint": "For greater precision, use a capacitive stylus.",
  "hero.eyebrow": "ONE MAP · MILLIONS OF STORIES", "hero.titleStart": "Leave your mark", "hero.titleEnd": "on the world.", "hero.description": "Zoom in, choose a color and turn one pixel into part of something huge.",
  "legend.free": "available", "legend.protected": "protected", "connection.reconnecting": "Reconnecting to the map…",
  "cell.label": "Pixel details", "cell.close": "Close details", "cell.selected": "SELECTED PIXEL", "cell.lastPaint": "Last painted", "cell.unpainted": "Not painted yet", "cell.coordinate": "Coordinates", "cell.protectedBy": "Protected by", "cell.daysRemaining": "{days} days remaining", "cell.report": "Report",
  "modal.close": "Close", "login.label": "Log in to World Pixel", "login.eyebrow": "JOIN THE COMMUNITY", "login.title": "Your mark on the world starts here.", "login.description": "Log in to paint, protect your pixels and follow your creations.", "login.email": "Your email", "login.placeholder": "you@example.com", "login.loading": "Logging in…", "login.continue": "Continue with email", "login.prototype": "We will send you a secure passwordless sign-in link.",
  "help.label": "How it works", "help.eyebrow": "HOW IT WORKS", "help.title": "The world is your canvas.", "help.zoomTitle": "Zoom in", "help.zoomText": "Zoom until you can see the grid.", "help.paintTitle": "Choose and paint", "help.paintText": "Pick a color and tap a land area.", "help.protectTitle": "Protect", "help.protectText": "Select a 16 × 16 block and protect it for 30 days.", "help.rulesTitle": "Community rules", "help.rulesText": "Create respectfully. Offensive content may be removed and accounts may be blocked.",
  "protection.label": "Protect area", "protection.confirmedEyebrow": "AREA PROTECTED", "protection.confirmedTitle": "This piece of the world is yours.", "protection.confirmedText": "Your block will be protected from changes for 30 days.", "protection.back": "Back to map", "protection.eyebrow": "AREA PROTECTION", "protection.title": "Keep your creation safe.", "protection.description": "No one can change this block while protection is active.", "protection.area": "Area", "protection.pixels": "{width} × {height} · {count} pixels", "protection.duration": "Duration", "protection.days": "30 days", "protection.coordinate": "Coordinates", "protection.total": "Total", "protection.error": "We couldn't complete this. Check your balance and try again.", "protection.processing": "Protecting…", "protection.confirm": "Confirm protection",
  "report.label": "Report pixel", "report.eyebrow": "REPORT", "report.title": "Send for review", "report.description": "Tell us why this pixel should be reviewed by moderation.", "report.category": "Category", "report.categoryPlaceholder": "Select a category", "report.reason": "Description", "report.reasonPlaceholder": "Describe the issue you found", "report.counter": "{count}/500 characters", "report.cancel": "Cancel", "report.submit": "Send report", "report.submitting": "Sending…", "report.retry": "Try again",
  "report.category.explicitSexual": "Explicit sexual content", "report.category.hateExtremism": "Hate or extremism", "report.category.racismDiscrimination": "Racism or discrimination", "report.category.harassment": "Harassment", "report.category.violenceThreat": "Violence or threat", "report.category.spamVandalism": "Spam or vandalism", "report.category.other": "Other",
  "report.error.category": "Select a category.", "report.error.reason": "The description must be between 3 and 500 characters.", "report.error.validation": "Check the category and description.", "report.error.expired": "Your session has expired. Log in again.", "report.error.rateLimited": "You have sent too many reports. Try again later.", "report.error.generic": "Unable to send the report. Try again.",
  "toast.loginToPaint": "Log in to paint this pixel.", "toast.loginToProtect": "Log in to protect an area.", "toast.protectedBy": "Area protected by {name}.", "toast.pixelPainted": "Pixel painted!", "toast.paintFailed": "Unable to paint right now.", "toast.areaUnavailable": "Area unavailable.", "toast.areaProtected": "Area protected for 30 days!", "toast.loggedOut": "You have logged out.", "toast.welcome": "Hello, {name}!", "toast.checkEmail": "Check your email to finish signing in.", "toast.loginFailed": "We could not send the sign-in link.", "toast.reportLogin": "Log in to report this pixel.", "toast.reportSent": "Report sent for review.", "preview.selectedArea": "Selected area",
  "error.UNAUTHENTICATED": "Log in to continue.", "error.RATE_LIMITED": "Too many actions. Try again in a moment.", "error.CELL_NOT_LAND": "This pixel is in the ocean.", "error.AREA_PROTECTED": "This area is protected.", "error.INSUFFICIENT_CREDITS": "Insufficient balance.", "error.AREA_CONFLICT": "This block is already protected.", "error.IDEMPOTENCY_CONFLICT": "This action conflicted. Try again.", "error.FORBIDDEN": "You do not have access to this action.", "error.NOT_FOUND": "The requested resource was not found.", "error.INTERNAL_ERROR": "The server encountered an error. Try again.", "error.NETWORK_ERROR": "Unable to connect to the server.", "error.CONFIGURATION_ERROR": "The app has not been configured to access the server.", "error.VALIDATION_ERROR": "The submitted data is not valid.",
};

const es: Catalog = {
  "language.label": "Idioma", "header.live": "EN VIVO", "header.help": "Cómo funciona", "header.balance": "saldo", "header.logout": "Salir", "header.login": "Entrar",
  "tools.label": "Herramientas del mapa", "tools.navigate": "Explorar", "tools.paint": "Pintar", "tools.protect": "Proteger", "palette.label": "Paleta de colores", "palette.select": "Seleccionar color {color}", "palette.groups": "Familias de tonos", "palette.group.neutral": "Neutros", "palette.group.warm": "Cálidos", "palette.group.nature": "Naturaleza", "palette.group.cool": "Fríos",
  "map.label": "Mapamundi interactivo de píxeles", "map.loading": "Cargando el mundo…", "map.zoomPaint": "Acércate para pintar", "map.zoomProtect": "Acércate para proteger", "map.protectHint": "Haz clic para seleccionar un bloque de protección 16 × 16", "map.stylusHint": "Para mayor precisión, usa un lápiz capacitivo.",
  "hero.eyebrow": "UN MAPA · MILLONES DE HISTORIAS", "hero.titleStart": "Deja tu huella", "hero.titleEnd": "en el mundo.", "hero.description": "Acércate, elige un color y convierte un píxel en parte de algo enorme.",
  "legend.free": "libre", "legend.protected": "protegido", "connection.reconnecting": "Reconectando al mapa…",
  "cell.label": "Detalles del píxel", "cell.close": "Cerrar detalles", "cell.selected": "PÍXEL SELECCIONADO", "cell.lastPaint": "Última pintura", "cell.unpainted": "Aún sin pintar", "cell.coordinate": "Coordenadas", "cell.protectedBy": "Protegido por", "cell.daysRemaining": "{days} días restantes", "cell.report": "Denunciar",
  "modal.close": "Cerrar", "login.label": "Entrar en World Pixel", "login.eyebrow": "ÚNETE A LA COMUNIDAD", "login.title": "Tu huella en el mundo comienza aquí.", "login.description": "Entra para pintar, proteger tus píxeles y seguir tus creaciones.", "login.email": "Tu correo", "login.placeholder": "tu@ejemplo.com", "login.loading": "Entrando…", "login.continue": "Continuar con correo", "login.prototype": "Te enviaremos un enlace seguro para entrar sin contraseña.",
  "help.label": "Cómo funciona", "help.eyebrow": "CÓMO FUNCIONA", "help.title": "El mundo es tu lienzo.", "help.zoomTitle": "Acércate", "help.zoomText": "Haz zoom hasta ver la cuadrícula.", "help.paintTitle": "Elige y pinta", "help.paintText": "Elige un color y toca una zona terrestre.", "help.protectTitle": "Protege", "help.protectText": "Selecciona un bloque 16 × 16 y protégelo durante 30 días.", "help.rulesTitle": "Reglas de la comunidad", "help.rulesText": "Crea con respeto. El contenido ofensivo puede eliminarse y las cuentas pueden bloquearse.",
  "protection.label": "Proteger área", "protection.confirmedEyebrow": "ÁREA PROTEGIDA", "protection.confirmedTitle": "Este pedazo del mundo es tuyo.", "protection.confirmedText": "Tu bloque estará protegido contra cambios durante 30 días.", "protection.back": "Volver al mapa", "protection.eyebrow": "PROTECCIÓN DE ÁREA", "protection.title": "Guarda tu creación.", "protection.description": "Nadie podrá cambiar este bloque mientras la protección esté activa.", "protection.area": "Área", "protection.pixels": "{width} × {height} · {count} píxeles", "protection.duration": "Duración", "protection.days": "30 días", "protection.coordinate": "Coordenadas", "protection.total": "Total", "protection.error": "No pudimos completar la operación. Revisa tu saldo e inténtalo de nuevo.", "protection.processing": "Protegiendo…", "protection.confirm": "Confirmar protección",
  "report.label": "Denunciar píxel", "report.eyebrow": "DENUNCIA", "report.title": "Enviar para revisión", "report.description": "Indica por qué este píxel debe ser revisado por moderación.", "report.category": "Categoría", "report.categoryPlaceholder": "Selecciona una categoría", "report.reason": "Descripción", "report.reasonPlaceholder": "Describe el problema encontrado", "report.counter": "{count}/500 caracteres", "report.cancel": "Cancelar", "report.submit": "Enviar denuncia", "report.submitting": "Enviando…", "report.retry": "Intentar de nuevo",
  "report.category.explicitSexual": "Contenido sexual explícito", "report.category.hateExtremism": "Odio o extremismo", "report.category.racismDiscrimination": "Racismo o discriminación", "report.category.harassment": "Acoso", "report.category.violenceThreat": "Violencia o amenaza", "report.category.spamVandalism": "Spam o vandalismo", "report.category.other": "Otro",
  "report.error.category": "Selecciona una categoría.", "report.error.reason": "La descripción debe tener entre 3 y 500 caracteres.", "report.error.validation": "Revisa la categoría y la descripción.", "report.error.expired": "Tu sesión ha caducado. Inicia sesión de nuevo.", "report.error.rateLimited": "Has enviado demasiadas denuncias. Inténtalo más tarde.", "report.error.generic": "No se pudo enviar la denuncia. Inténtalo de nuevo.",
  "toast.loginToPaint": "Entra para pintar este píxel.", "toast.loginToProtect": "Entra para proteger un área.", "toast.protectedBy": "Área protegida por {name}.", "toast.pixelPainted": "¡Píxel pintado!", "toast.paintFailed": "No se puede pintar ahora.", "toast.areaUnavailable": "Área no disponible.", "toast.areaProtected": "¡Área protegida durante 30 días!", "toast.loggedOut": "Has cerrado la sesión.", "toast.welcome": "¡Hola, {name}!", "toast.checkEmail": "Revisa tu correo para completar el acceso.", "toast.loginFailed": "No pudimos enviar el enlace de acceso.", "toast.reportLogin": "Inicia sesión para denunciar este píxel.", "toast.reportSent": "Denuncia enviada para revisión.", "preview.selectedArea": "Área seleccionada",
  "error.UNAUTHENTICATED": "Entra para continuar.", "error.RATE_LIMITED": "Demasiadas acciones. Inténtalo de nuevo en unos instantes.", "error.CELL_NOT_LAND": "Este píxel está en el océano.", "error.AREA_PROTECTED": "Esta área está protegida.", "error.INSUFFICIENT_CREDITS": "Saldo insuficiente.", "error.AREA_CONFLICT": "Este bloque ya está protegido.", "error.IDEMPOTENCY_CONFLICT": "Esta acción entró en conflicto. Inténtalo de nuevo.", "error.FORBIDDEN": "No tienes acceso a esta acción.", "error.NOT_FOUND": "No se encontró el recurso solicitado.", "error.INTERNAL_ERROR": "El servidor encontró un error. Inténtalo de nuevo.", "error.NETWORK_ERROR": "No se pudo conectar con el servidor.", "error.CONFIGURATION_ERROR": "La aplicación aún no está configurada para acceder al servidor.", "error.VALIDATION_ERROR": "Los datos enviados no son válidos.",
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

  useEffect(() => {
    const detection = window.setTimeout(() => setLocaleState(detectLocale()), 0);
    return () => window.clearTimeout(detection);
  }, []);
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
