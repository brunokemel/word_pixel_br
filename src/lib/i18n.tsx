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
  "errorUx.UNAUTHENTICATED.title": "Sessão encerrada", "errorUx.UNAUTHENTICATED.message": "Sua sessão expirou. Entre novamente para continuar.",
  "errorUx.FORBIDDEN.title": "Acesso negado", "errorUx.FORBIDDEN.message": "Você não tem permissão para realizar esta ação.", "errorUx.NOT_FOUND.title": "Conteúdo indisponível", "errorUx.NOT_FOUND.message": "Este conteúdo não está mais disponível.",
  "errorUx.VALIDATION_ERROR.title": "Revise os dados", "errorUx.VALIDATION_ERROR.message": "Revise os dados informados.", "errorUx.CELL_NOT_LAND.title": "Área inválida", "errorUx.CELL_NOT_LAND.message": "Só é possível pintar em áreas terrestres.",
  "errorUx.INSUFFICIENT_CREDITS.title": "Créditos insuficientes", "errorUx.INSUFFICIENT_CREDITS.message": "Seu saldo não é suficiente para concluir esta proteção.", "errorUx.AREA_PROTECTED.title": "Área protegida", "errorUx.AREA_PROTECTED.message": "Esta área está protegida por outro usuário.",
  "errorUx.AREA_CONFLICT.title": "Área reservada", "errorUx.AREA_CONFLICT.message": "A área foi reservada enquanto você confirmava. Escolha outra região.", "errorUx.USERNAME_TAKEN.title": "Nome indisponível", "errorUx.USERNAME_TAKEN.message": "Este nome de usuário já está em uso.",
  "errorUx.IDEMPOTENCY_CONFLICT.title": "Operação alterada", "errorUx.IDEMPOTENCY_CONFLICT.message": "Esta operação mudou desde a primeira tentativa. Revise e confirme novamente.", "errorUx.RATE_LIMITED.title": "Muitas tentativas", "errorUx.RATE_LIMITED.message": "Muitas tentativas. Aguarde um momento.",
  "errorUx.PAYMENT_PROVIDER_UNAVAILABLE.title": "Pagamento indisponível", "errorUx.PAYMENT_PROVIDER_UNAVAILABLE.message": "O pagamento está temporariamente indisponível. Seus dados foram preservados.", "errorUx.SERVICE_UNAVAILABLE.title": "Instabilidade temporária", "errorUx.SERVICE_UNAVAILABLE.message": "Estamos com instabilidade temporária.",
  "errorUx.INTERNAL_ERROR.title": "Não foi possível concluir", "errorUx.INTERNAL_ERROR.message": "Não foi possível concluir esta ação.", "errorUx.NETWORK_ERROR.title": "Falha de conexão", "errorUx.NETWORK_ERROR.message": "Não foi possível conectar ao serviço.",
  "errorUx.OFFLINE.title": "Sem conexão", "errorUx.OFFLINE.message": "Você está sem conexão.", "errorUx.TIMEOUT.title": "Resposta demorada", "errorUx.TIMEOUT.message": "A resposta demorou mais que o esperado.",
  "errorUx.CANCELED.title": "Operação cancelada", "errorUx.CANCELED.message": "Operação cancelada.", "errorUx.CONFIGURATION_ERROR.title": "Serviço não configurado", "errorUx.CONFIGURATION_ERROR.message": "Este recurso ainda não está disponível.",
  "errorUi.supportCode": "Código para suporte: {requestId}", "errorUi.copyCode": "Copiar código do erro", "errorUi.retry": "Tentar novamente", "errorUi.back": "Voltar ao mapa", "errorUi.balanceCost": "Saldo: {balance} créditos · Custo: {cost} créditos", "errorUi.balance": "Saldo: {balance} créditos", "errorUi.buyCredits": "Comprar créditos",
  "errorUi.close": "Fechar erro", "credits.comingSoon": "A compra de créditos estará disponível em breve.", "help.legalLink": "Sobre, termos, privacidade e regras", "protection.credits": "{count} créditos",
  "gallery.eyebrow": "AMBIENTE LOCAL", "gallery.title": "Simulador de erros", "gallery.description": "Selecione o código e a apresentação. A demonstração abre isoladamente, sem chamar a API.", "gallery.configure": "Configurar demonstração", "gallery.code": "Código do erro", "gallery.surface": "Como abrir", "gallery.open": "Abrir demonstração", "gallery.recommended": "Recomendado: {surface}", "gallery.interactions": "Interações simuladas: {count}", "gallery.emptyTitle": "Nenhuma demonstração aberta", "gallery.emptyText": "Escolha as opções acima e clique em “Abrir demonstração”.", "gallery.preview": "Demonstração {code}", "gallery.close": "Fechar demonstração", "gallery.exampleField": "Campo de exemplo", "gallery.preservedValue": "valor_preservado", "gallery.surface.inline": "Campo inline", "gallery.surface.action": "Alerta de ação", "gallery.surface.banner": "Banner persistente", "gallery.surface.payment": "Painel de pagamento", "gallery.surface.page": "Página completa",
  "maintenance.alt": "Personagem trabalhando na manutenção do World Pixel", "maintenance.eyebrow": "AJUSTANDO ALGUNS PIXELS", "maintenance.title": "Voltamos em breve.", "maintenance.description": "Estamos fazendo melhorias para deixar o World Pixel mais estável e divertido. Tente novamente daqui a pouco.", "maintenance.progress": "Manutenção em andamento", "maintenance.inProgress": "Em andamento", "maintenance.note": "Você não precisa atualizar sem parar — estaremos de volta assim que tudo estiver pronto.",
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
  "login.prototype": "Nunca compartilhe seu código de acesso.",
  "login.sending": "Enviando código…",
  "login.codeTitle": "Digite o código recebido.",
  "login.neutralMessage": "Se o e-mail estiver disponível, enviaremos um código de acesso.",
  "login.code": "Código de 6 dígitos",
  "login.verifying": "Confirmando…",
  "login.confirm": "Confirmar código",
  "login.changeEmail": "Corrigir e-mail",
  "login.resend": "Reenviar código",
  "login.resendIn": "Reenviar em {seconds}s",
  "login.error.email": "Digite um e-mail válido.",
  "login.error.code": "Código inválido ou expirado. Solicite um novo código.",
  "login.error.rateLimit": "Muitas tentativas. Aguarde antes de tentar novamente.",
  "login.error.network": "Falha de conexão. Verifique sua internet e tente novamente.",
  "login.error.generic": "Não foi possível enviar o código. Tente novamente.",
  "login.loginTitle": "Entre na sua conta.",
  "login.loginDescription": "Use seu e-mail e sua senha para continuar.",
  "login.signupTitle": "Crie sua conta.",
  "login.signupDescription": "Cadastre-se para pintar e proteger seus pixels.",
  "login.recoveryTitle": "Recupere seu acesso.",
  "login.recoveryDescription": "Enviaremos instruções se o e-mail estiver cadastrado.",
  "login.password": "Senha", "login.signIn": "Entrar", "login.signUp": "Criar conta", "login.recover": "Enviar recuperação",
  "login.haveAccount": "Já tenho uma conta", "login.createAccount": "Criar uma conta", "login.forgotPassword": "Esqueci minha senha",
  "login.passwordHint": "Use pelo menos 8 caracteres.",
  "login.signupConfirmation": "Conta criada. Verifique seu e-mail para confirmar o acesso.",
  "login.recoverySent": "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.",
  "login.resetTitle": "Defina uma nova senha.", "login.resetDescription": "Escolha uma nova senha para sua conta.",
  "login.newPassword": "Nova senha", "login.confirmPassword": "Confirmar nova senha", "login.savePassword": "Salvar nova senha", "login.savingPassword": "Salvando…", "login.passwordUpdated": "Senha atualizada com sucesso.",
  "login.error.password": "A senha deve ter pelo menos 8 caracteres.", "login.error.passwordMatch": "As senhas não coincidem.", "login.error.credentials": "E-mail ou senha inválidos.",
  "profile.edit": "Editar perfil",
  "profile.onboardingLabel": "Escolher nome de artista",
  "profile.eyebrow": "SEU PERFIL",
  "profile.onboardingTitle": "Como devemos chamar você?",
  "profile.editTitle": "Edite seu perfil.",
  "profile.description": "Escolha um nome público para assinar suas pinturas.",
  "profile.name": "Nome de artista",
  "profile.username": "Nome de usuário",
  "profile.usernameHint": "Use de 3 a 30 letras minúsculas, números ou underscore.",
  "profile.email": "E-mail da conta",
  "profile.emailPrivate": "Privado: visível somente nas configurações da sua conta.",
  "profile.save": "Salvar perfil",
  "profile.saving": "Salvando…",
  "profile.saved": "Perfil atualizado.",
  "profile.error.name": "O nome deve ter entre 1 e 40 caracteres.",
  "profile.error.usernameValidation": "Use de 3 a 30 caracteres: apenas letras minúsculas, números e underscore.",
  "profile.error.usernameTaken": "Este nome de usuário já está em uso.",
  "profile.error.load": "Não foi possível carregar seu perfil. Tente novamente.",
  "profile.error.save": "Não foi possível salvar o perfil.",
  "profile.retry": "Tentar novamente",
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
  "errorUi.close": "Close error", "credits.comingSoon": "Credit purchases will be available soon.", "help.legalLink": "About, terms, privacy and rules", "protection.credits": "{count} credits", "gallery.eyebrow": "LOCAL ENVIRONMENT", "gallery.title": "Error simulator", "gallery.description": "Select the code and presentation. The demo opens in isolation without calling the API.", "gallery.configure": "Configure demo", "gallery.code": "Error code", "gallery.surface": "How to open", "gallery.open": "Open demo", "gallery.recommended": "Recommended: {surface}", "gallery.interactions": "Simulated interactions: {count}", "gallery.emptyTitle": "No demo open", "gallery.emptyText": "Choose the options above and click “Open demo”.", "gallery.preview": "{code} demo", "gallery.close": "Close demo", "gallery.exampleField": "Example field", "gallery.preservedValue": "preserved_value", "gallery.surface.inline": "Inline field", "gallery.surface.action": "Action alert", "gallery.surface.banner": "Persistent banner", "gallery.surface.payment": "Payment panel", "gallery.surface.page": "Full page", "maintenance.alt": "Character working on World Pixel maintenance", "maintenance.eyebrow": "ADJUSTING A FEW PIXELS", "maintenance.title": "We'll be back soon.", "maintenance.description": "We're making improvements to make World Pixel more stable and fun. Try again shortly.", "maintenance.progress": "Maintenance in progress", "maintenance.inProgress": "In progress", "maintenance.note": "You don't need to keep refreshing — we'll be back as soon as everything is ready.",
  "errorUx.UNAUTHENTICATED.title": "Session ended", "errorUx.UNAUTHENTICATED.message": "Your session expired. Log in again to continue.", "errorUx.FORBIDDEN.title": "Access denied", "errorUx.FORBIDDEN.message": "You do not have permission to perform this action.", "errorUx.NOT_FOUND.title": "Content unavailable", "errorUx.NOT_FOUND.message": "This content is no longer available.", "errorUx.VALIDATION_ERROR.title": "Review the data", "errorUx.VALIDATION_ERROR.message": "Review the information provided.", "errorUx.CELL_NOT_LAND.title": "Invalid area", "errorUx.CELL_NOT_LAND.message": "You can only paint on land areas.", "errorUx.INSUFFICIENT_CREDITS.title": "Insufficient credits", "errorUx.INSUFFICIENT_CREDITS.message": "Your balance is not enough to complete this protection.", "errorUx.AREA_PROTECTED.title": "Protected area", "errorUx.AREA_PROTECTED.message": "This area is protected by another user.", "errorUx.AREA_CONFLICT.title": "Area reserved", "errorUx.AREA_CONFLICT.message": "The area was reserved while you confirmed. Choose another region.", "errorUx.USERNAME_TAKEN.title": "Name unavailable", "errorUx.USERNAME_TAKEN.message": "This username is already in use.", "errorUx.IDEMPOTENCY_CONFLICT.title": "Operation changed", "errorUx.IDEMPOTENCY_CONFLICT.message": "This operation changed since the first attempt. Review and confirm again.", "errorUx.RATE_LIMITED.title": "Too many attempts", "errorUx.RATE_LIMITED.message": "Too many attempts. Please wait a moment.", "errorUx.PAYMENT_PROVIDER_UNAVAILABLE.title": "Payment unavailable", "errorUx.PAYMENT_PROVIDER_UNAVAILABLE.message": "Payment is temporarily unavailable. Your data was preserved.", "errorUx.SERVICE_UNAVAILABLE.title": "Temporary instability", "errorUx.SERVICE_UNAVAILABLE.message": "We are experiencing temporary instability.", "errorUx.INTERNAL_ERROR.title": "Unable to complete", "errorUx.INTERNAL_ERROR.message": "We could not complete this action.", "errorUx.NETWORK_ERROR.title": "Connection failure", "errorUx.NETWORK_ERROR.message": "Unable to connect to the service.", "errorUx.OFFLINE.title": "No connection", "errorUx.OFFLINE.message": "You are offline.", "errorUx.TIMEOUT.title": "Slow response", "errorUx.TIMEOUT.message": "The response took longer than expected.", "errorUx.CANCELED.title": "Operation canceled", "errorUx.CANCELED.message": "Operation canceled.", "errorUx.CONFIGURATION_ERROR.title": "Service not configured", "errorUx.CONFIGURATION_ERROR.message": "This feature is not available yet.", "errorUi.supportCode": "Support code: {requestId}", "errorUi.copyCode": "Copy error code", "errorUi.retry": "Try again", "errorUi.back": "Back to map", "errorUi.balanceCost": "Balance: {balance} credits · Cost: {cost} credits", "errorUi.balance": "Balance: {balance} credits", "errorUi.buyCredits": "Buy credits",
  "profile.username": "Username", "profile.usernameHint": "Use 3 to 30 lowercase letters, numbers, or underscores.", "profile.email": "Account email", "profile.emailPrivate": "Private: visible only in your account settings.", "profile.error.usernameValidation": "Use 3 to 30 characters: lowercase letters, numbers, and underscores only.", "profile.error.usernameTaken": "This username is already in use.",
  "language.label": "Language", "header.live": "LIVE", "header.help": "How it works", "header.balance": "balance", "header.logout": "Log out", "header.login": "Log in",
  "tools.label": "Map tools", "tools.navigate": "Explore", "tools.paint": "Paint", "tools.protect": "Protect", "palette.label": "Color palette", "palette.select": "Select color {color}", "palette.groups": "Tone families", "palette.group.neutral": "Neutrals", "palette.group.warm": "Warm", "palette.group.nature": "Nature", "palette.group.cool": "Cool",
  "map.label": "Interactive world pixel map", "map.loading": "Loading the world…", "map.zoomPaint": "Zoom in to paint", "map.zoomProtect": "Zoom in to protect", "map.protectHint": "Click to select a 16 × 16 protection block", "map.stylusHint": "For greater precision, use a capacitive stylus.",
  "hero.eyebrow": "ONE MAP · MILLIONS OF STORIES", "hero.titleStart": "Leave your mark", "hero.titleEnd": "on the world.", "hero.description": "Zoom in, choose a color and turn one pixel into part of something huge.",
  "legend.free": "available", "legend.protected": "protected", "connection.reconnecting": "Reconnecting to the map…",
  "cell.label": "Pixel details", "cell.close": "Close details", "cell.selected": "SELECTED PIXEL", "cell.lastPaint": "Last painted", "cell.unpainted": "Not painted yet", "cell.coordinate": "Coordinates", "cell.protectedBy": "Protected by", "cell.daysRemaining": "{days} days remaining", "cell.report": "Report",
  "modal.close": "Close", "login.label": "Log in to World Pixel", "login.eyebrow": "JOIN THE COMMUNITY", "login.title": "Your mark on the world starts here.", "login.description": "Log in to paint, protect your pixels and follow your creations.", "login.email": "Your email", "login.placeholder": "you@example.com", "login.loading": "Logging in…", "login.continue": "Continue with email", "login.prototype": "Never share your access code.", "login.sending": "Sending code…", "login.codeTitle": "Enter the code you received.", "login.neutralMessage": "If the email is available, we will send an access code.", "login.code": "6-digit code", "login.verifying": "Confirming…", "login.confirm": "Confirm code", "login.changeEmail": "Change email", "login.resend": "Resend code", "login.resendIn": "Resend in {seconds}s", "login.error.email": "Enter a valid email.", "login.error.code": "Invalid or expired code. Request a new code.", "login.error.rateLimit": "Too many attempts. Wait before trying again.", "login.error.network": "Connection failed. Check your internet and try again.", "login.error.generic": "Unable to send the code. Try again.", "profile.edit": "Edit profile", "profile.onboardingLabel": "Choose an artist name", "profile.eyebrow": "YOUR PROFILE", "profile.onboardingTitle": "What should we call you?", "profile.editTitle": "Edit your profile.", "profile.description": "Choose a public name to sign your paintings.", "profile.name": "Artist name", "profile.save": "Save profile", "profile.saving": "Saving…", "profile.saved": "Profile updated.", "profile.error.name": "The name must be between 1 and 40 characters.", "profile.error.load": "Unable to load your profile. Try again.", "profile.error.save": "Unable to save the profile.", "profile.retry": "Try again",
  "login.loginTitle": "Log in to your account.", "login.loginDescription": "Use your email and password to continue.", "login.signupTitle": "Create your account.", "login.signupDescription": "Sign up to paint and protect your pixels.", "login.recoveryTitle": "Recover your access.", "login.recoveryDescription": "We will send instructions if the email is registered.", "login.password": "Password", "login.signIn": "Log in", "login.signUp": "Create account", "login.recover": "Send recovery email", "login.haveAccount": "I already have an account", "login.createAccount": "Create an account", "login.forgotPassword": "Forgot my password", "login.passwordHint": "Use at least 8 characters.", "login.signupConfirmation": "Account created. Check your email to confirm access.", "login.recoverySent": "If the email is registered, we will send recovery instructions.", "login.resetTitle": "Set a new password.", "login.resetDescription": "Choose a new password for your account.", "login.newPassword": "New password", "login.confirmPassword": "Confirm new password", "login.savePassword": "Save new password", "login.savingPassword": "Saving…", "login.passwordUpdated": "Password updated successfully.", "login.error.password": "The password must be at least 8 characters.", "login.error.passwordMatch": "Passwords do not match.", "login.error.credentials": "Invalid email or password.",
  "help.label": "How it works", "help.eyebrow": "HOW IT WORKS", "help.title": "The world is your canvas.", "help.zoomTitle": "Zoom in", "help.zoomText": "Zoom until you can see the grid.", "help.paintTitle": "Choose and paint", "help.paintText": "Pick a color and tap a land area.", "help.protectTitle": "Protect", "help.protectText": "Select a 16 × 16 block and protect it for 30 days.", "help.rulesTitle": "Community rules", "help.rulesText": "Create respectfully. Offensive content may be removed and accounts may be blocked.",
  "protection.label": "Protect area", "protection.confirmedEyebrow": "AREA PROTECTED", "protection.confirmedTitle": "This piece of the world is yours.", "protection.confirmedText": "Your block will be protected from changes for 30 days.", "protection.back": "Back to map", "protection.eyebrow": "AREA PROTECTION", "protection.title": "Keep your creation safe.", "protection.description": "No one can change this block while protection is active.", "protection.area": "Area", "protection.pixels": "{width} × {height} · {count} pixels", "protection.duration": "Duration", "protection.days": "30 days", "protection.coordinate": "Coordinates", "protection.total": "Total", "protection.error": "We couldn't complete this. Check your balance and try again.", "protection.processing": "Protecting…", "protection.confirm": "Confirm protection",
  "report.label": "Report pixel", "report.eyebrow": "REPORT", "report.title": "Send for review", "report.description": "Tell us why this pixel should be reviewed by moderation.", "report.category": "Category", "report.categoryPlaceholder": "Select a category", "report.reason": "Description", "report.reasonPlaceholder": "Describe the issue you found", "report.counter": "{count}/500 characters", "report.cancel": "Cancel", "report.submit": "Send report", "report.submitting": "Sending…", "report.retry": "Try again",
  "report.category.explicitSexual": "Explicit sexual content", "report.category.hateExtremism": "Hate or extremism", "report.category.racismDiscrimination": "Racism or discrimination", "report.category.harassment": "Harassment", "report.category.violenceThreat": "Violence or threat", "report.category.spamVandalism": "Spam or vandalism", "report.category.other": "Other",
  "report.error.category": "Select a category.", "report.error.reason": "The description must be between 3 and 500 characters.", "report.error.validation": "Check the category and description.", "report.error.expired": "Your session has expired. Log in again.", "report.error.rateLimited": "You have sent too many reports. Try again later.", "report.error.generic": "Unable to send the report. Try again.",
  "toast.loginToPaint": "Log in to paint this pixel.", "toast.loginToProtect": "Log in to protect an area.", "toast.protectedBy": "Area protected by {name}.", "toast.pixelPainted": "Pixel painted!", "toast.paintFailed": "Unable to paint right now.", "toast.areaUnavailable": "Area unavailable.", "toast.areaProtected": "Area protected for 30 days!", "toast.loggedOut": "You have logged out.", "toast.welcome": "Hello, {name}!", "toast.checkEmail": "Check your email to finish signing in.", "toast.loginFailed": "We could not send the sign-in link.", "toast.reportLogin": "Log in to report this pixel.", "toast.reportSent": "Report sent for review.", "preview.selectedArea": "Selected area",
  "error.UNAUTHENTICATED": "Log in to continue.", "error.RATE_LIMITED": "Too many actions. Try again in a moment.", "error.CELL_NOT_LAND": "This pixel is in the ocean.", "error.AREA_PROTECTED": "This area is protected.", "error.INSUFFICIENT_CREDITS": "Insufficient balance.", "error.AREA_CONFLICT": "This block is already protected.", "error.IDEMPOTENCY_CONFLICT": "This action conflicted. Try again.", "error.FORBIDDEN": "You do not have access to this action.", "error.NOT_FOUND": "The requested resource was not found.", "error.INTERNAL_ERROR": "The server encountered an error. Try again.", "error.NETWORK_ERROR": "Unable to connect to the server.", "error.CONFIGURATION_ERROR": "The app has not been configured to access the server.", "error.VALIDATION_ERROR": "The submitted data is not valid.",
};

const es: Catalog = {
  "errorUi.close": "Cerrar error", "credits.comingSoon": "La compra de créditos estará disponible pronto.", "help.legalLink": "Acerca de, términos, privacidad y reglas", "protection.credits": "{count} créditos", "gallery.eyebrow": "ENTORNO LOCAL", "gallery.title": "Simulador de errores", "gallery.description": "Selecciona el código y la presentación. La demostración se abre de forma aislada sin llamar a la API.", "gallery.configure": "Configurar demostración", "gallery.code": "Código del error", "gallery.surface": "Cómo abrir", "gallery.open": "Abrir demostración", "gallery.recommended": "Recomendado: {surface}", "gallery.interactions": "Interacciones simuladas: {count}", "gallery.emptyTitle": "Ninguna demostración abierta", "gallery.emptyText": "Elige las opciones anteriores y haz clic en “Abrir demostración”.", "gallery.preview": "Demostración {code}", "gallery.close": "Cerrar demostración", "gallery.exampleField": "Campo de ejemplo", "gallery.preservedValue": "valor_conservado", "gallery.surface.inline": "Campo inline", "gallery.surface.action": "Alerta de acción", "gallery.surface.banner": "Banner persistente", "gallery.surface.payment": "Panel de pago", "gallery.surface.page": "Página completa", "maintenance.alt": "Personaje trabajando en el mantenimiento de World Pixel", "maintenance.eyebrow": "AJUSTANDO ALGUNOS PÍXELES", "maintenance.title": "Volvemos pronto.", "maintenance.description": "Estamos haciendo mejoras para que World Pixel sea más estable y divertido. Inténtalo de nuevo en breve.", "maintenance.progress": "Mantenimiento en curso", "maintenance.inProgress": "En curso", "maintenance.note": "No necesitas actualizar constantemente; volveremos en cuanto todo esté listo.",
  "errorUx.UNAUTHENTICATED.title": "Sesión finalizada", "errorUx.UNAUTHENTICATED.message": "Tu sesión caducó. Inicia sesión de nuevo para continuar.", "errorUx.FORBIDDEN.title": "Acceso denegado", "errorUx.FORBIDDEN.message": "No tienes permiso para realizar esta acción.", "errorUx.NOT_FOUND.title": "Contenido no disponible", "errorUx.NOT_FOUND.message": "Este contenido ya no está disponible.", "errorUx.VALIDATION_ERROR.title": "Revisa los datos", "errorUx.VALIDATION_ERROR.message": "Revisa la información ingresada.", "errorUx.CELL_NOT_LAND.title": "Área no válida", "errorUx.CELL_NOT_LAND.message": "Solo puedes pintar en áreas terrestres.", "errorUx.INSUFFICIENT_CREDITS.title": "Créditos insuficientes", "errorUx.INSUFFICIENT_CREDITS.message": "Tu saldo no es suficiente para completar esta protección.", "errorUx.AREA_PROTECTED.title": "Área protegida", "errorUx.AREA_PROTECTED.message": "Esta área está protegida por otro usuario.", "errorUx.AREA_CONFLICT.title": "Área reservada", "errorUx.AREA_CONFLICT.message": "El área fue reservada mientras confirmabas. Elige otra región.", "errorUx.USERNAME_TAKEN.title": "Nombre no disponible", "errorUx.USERNAME_TAKEN.message": "Este nombre de usuario ya está en uso.", "errorUx.IDEMPOTENCY_CONFLICT.title": "Operación modificada", "errorUx.IDEMPOTENCY_CONFLICT.message": "Esta operación cambió desde el primer intento. Revísala y confirma de nuevo.", "errorUx.RATE_LIMITED.title": "Demasiados intentos", "errorUx.RATE_LIMITED.message": "Demasiados intentos. Espera un momento.", "errorUx.PAYMENT_PROVIDER_UNAVAILABLE.title": "Pago no disponible", "errorUx.PAYMENT_PROVIDER_UNAVAILABLE.message": "El pago no está disponible temporalmente. Tus datos se conservaron.", "errorUx.SERVICE_UNAVAILABLE.title": "Inestabilidad temporal", "errorUx.SERVICE_UNAVAILABLE.message": "Estamos experimentando inestabilidad temporal.", "errorUx.INTERNAL_ERROR.title": "No se pudo completar", "errorUx.INTERNAL_ERROR.message": "No pudimos completar esta acción.", "errorUx.NETWORK_ERROR.title": "Fallo de conexión", "errorUx.NETWORK_ERROR.message": "No se pudo conectar al servicio.", "errorUx.OFFLINE.title": "Sin conexión", "errorUx.OFFLINE.message": "No tienes conexión.", "errorUx.TIMEOUT.title": "Respuesta lenta", "errorUx.TIMEOUT.message": "La respuesta tardó más de lo esperado.", "errorUx.CANCELED.title": "Operación cancelada", "errorUx.CANCELED.message": "Operación cancelada.", "errorUx.CONFIGURATION_ERROR.title": "Servicio no configurado", "errorUx.CONFIGURATION_ERROR.message": "Esta función aún no está disponible.", "errorUi.supportCode": "Código de soporte: {requestId}", "errorUi.copyCode": "Copiar código del error", "errorUi.retry": "Intentar de nuevo", "errorUi.back": "Volver al mapa", "errorUi.balanceCost": "Saldo: {balance} créditos · Coste: {cost} créditos", "errorUi.balance": "Saldo: {balance} créditos", "errorUi.buyCredits": "Comprar créditos",
  "profile.username": "Nombre de usuario", "profile.usernameHint": "Usa de 3 a 30 letras minúsculas, números o guiones bajos.", "profile.email": "Correo de la cuenta", "profile.emailPrivate": "Privado: visible solo en la configuración de tu cuenta.", "profile.error.usernameValidation": "Usa de 3 a 30 caracteres: solo letras minúsculas, números y guiones bajos.", "profile.error.usernameTaken": "Este nombre de usuario ya está en uso.",
  "language.label": "Idioma", "header.live": "EN VIVO", "header.help": "Cómo funciona", "header.balance": "saldo", "header.logout": "Salir", "header.login": "Entrar",
  "tools.label": "Herramientas del mapa", "tools.navigate": "Explorar", "tools.paint": "Pintar", "tools.protect": "Proteger", "palette.label": "Paleta de colores", "palette.select": "Seleccionar color {color}", "palette.groups": "Familias de tonos", "palette.group.neutral": "Neutros", "palette.group.warm": "Cálidos", "palette.group.nature": "Naturaleza", "palette.group.cool": "Fríos",
  "map.label": "Mapamundi interactivo de píxeles", "map.loading": "Cargando el mundo…", "map.zoomPaint": "Acércate para pintar", "map.zoomProtect": "Acércate para proteger", "map.protectHint": "Haz clic para seleccionar un bloque de protección 16 × 16", "map.stylusHint": "Para mayor precisión, usa un lápiz capacitivo.",
  "hero.eyebrow": "UN MAPA · MILLONES DE HISTORIAS", "hero.titleStart": "Deja tu huella", "hero.titleEnd": "en el mundo.", "hero.description": "Acércate, elige un color y convierte un píxel en parte de algo enorme.",
  "legend.free": "libre", "legend.protected": "protegido", "connection.reconnecting": "Reconectando al mapa…",
  "cell.label": "Detalles del píxel", "cell.close": "Cerrar detalles", "cell.selected": "PÍXEL SELECCIONADO", "cell.lastPaint": "Última pintura", "cell.unpainted": "Aún sin pintar", "cell.coordinate": "Coordenadas", "cell.protectedBy": "Protegido por", "cell.daysRemaining": "{days} días restantes", "cell.report": "Denunciar",
  "modal.close": "Cerrar", "login.label": "Entrar en World Pixel", "login.eyebrow": "ÚNETE A LA COMUNIDAD", "login.title": "Tu huella en el mundo comienza aquí.", "login.description": "Entra para pintar, proteger tus píxeles y seguir tus creaciones.", "login.email": "Tu correo", "login.placeholder": "tu@ejemplo.com", "login.loading": "Entrando…", "login.continue": "Continuar con correo", "login.prototype": "Nunca compartas tu código de acceso.", "login.sending": "Enviando código…", "login.codeTitle": "Introduce el código recibido.", "login.neutralMessage": "Si el correo está disponible, enviaremos un código de acceso.", "login.code": "Código de 6 dígitos", "login.verifying": "Confirmando…", "login.confirm": "Confirmar código", "login.changeEmail": "Corregir correo", "login.resend": "Reenviar código", "login.resendIn": "Reenviar en {seconds}s", "login.error.email": "Introduce un correo válido.", "login.error.code": "Código inválido o vencido. Solicita uno nuevo.", "login.error.rateLimit": "Demasiados intentos. Espera antes de volver a intentarlo.", "login.error.network": "Falló la conexión. Revisa tu internet e inténtalo de nuevo.", "login.error.generic": "No se pudo enviar el código. Inténtalo de nuevo.", "profile.edit": "Editar perfil", "profile.onboardingLabel": "Elegir nombre de artista", "profile.eyebrow": "TU PERFIL", "profile.onboardingTitle": "¿Cómo debemos llamarte?", "profile.editTitle": "Edita tu perfil.", "profile.description": "Elige un nombre público para firmar tus pinturas.", "profile.name": "Nombre de artista", "profile.save": "Guardar perfil", "profile.saving": "Guardando…", "profile.saved": "Perfil actualizado.", "profile.error.name": "El nombre debe tener entre 1 y 40 caracteres.", "profile.error.load": "No se pudo cargar tu perfil. Inténtalo de nuevo.", "profile.error.save": "No se pudo guardar el perfil.", "profile.retry": "Intentar de nuevo",
  "login.loginTitle": "Entra en tu cuenta.", "login.loginDescription": "Usa tu correo y contraseña para continuar.", "login.signupTitle": "Crea tu cuenta.", "login.signupDescription": "Regístrate para pintar y proteger tus píxeles.", "login.recoveryTitle": "Recupera tu acceso.", "login.recoveryDescription": "Enviaremos instrucciones si el correo está registrado.", "login.password": "Contraseña", "login.signIn": "Entrar", "login.signUp": "Crear cuenta", "login.recover": "Enviar recuperación", "login.haveAccount": "Ya tengo una cuenta", "login.createAccount": "Crear una cuenta", "login.forgotPassword": "Olvidé mi contraseña", "login.passwordHint": "Usa al menos 8 caracteres.", "login.signupConfirmation": "Cuenta creada. Revisa tu correo para confirmar el acceso.", "login.recoverySent": "Si el correo está registrado, enviaremos instrucciones de recuperación.", "login.resetTitle": "Define una nueva contraseña.", "login.resetDescription": "Elige una nueva contraseña para tu cuenta.", "login.newPassword": "Nueva contraseña", "login.confirmPassword": "Confirmar nueva contraseña", "login.savePassword": "Guardar nueva contraseña", "login.savingPassword": "Guardando…", "login.passwordUpdated": "Contraseña actualizada correctamente.", "login.error.password": "La contraseña debe tener al menos 8 caracteres.", "login.error.passwordMatch": "Las contraseñas no coinciden.", "login.error.credentials": "Correo o contraseña inválidos.",
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
