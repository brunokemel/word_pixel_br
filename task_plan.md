# World Pixel Front-end

## Goal
Construir no repositório atual um front-end funcional, responsivo e validado para o mapa colaborativo World Pixel, seguindo `prompt-front.txt`.

## Next Step
Entregar o esquema trilíngue concluído e documentado.

## Current Phase
Concluído.

### Phase 1 — Fundação e arquitetura
**Status:** complete
- [x] Criar projeto Next.js/TypeScript/Tailwind e contratos tipados
- [x] Implementar adaptador mock e utilitários de grade

### Phase 2 — Experiência do mapa
**Status:** complete
- [x] Integrar MapLibre e camada eficiente de pixels
- [x] Implementar modos navegar, pintar e proteger

### Phase 3 — Interface e fluxos
**Status:** complete
- [x] Criar header, paleta, painéis, modais e toasts
- [x] Garantir responsividade e acessibilidade

### Phase 4 — Qualidade e entrega
**Status:** complete
- [x] Adicionar testes essenciais
- [x] Executar typecheck, testes e build
- [x] Fazer QA de resposta HTTP e documentar integração (QA visual indisponível por ausência de navegador)

### Phase 5 — Internacionalização
**Status:** complete
- [x] Criar infraestrutura tipada de i18n com pt, en e es
- [x] Traduzir interface, acessibilidade, erros e formatação monetária
- [x] Adicionar seletor persistente de idioma
- [x] Testar troca de idioma, typecheck e build

## Decisions Made
| Decision | Rationale |
|---|---|
| Next.js + TypeScript + MapLibre | Stack solicitada no prompt e adequada para futura integração Supabase |
| Adaptador mock em memória | Permite experiência completa sem acoplar o front à API ainda inexistente |
| GeoJSON em layers do MapLibre | Evita um elemento DOM por pixel e mantém interação acoplada ao mapa |
| Catálogo local tipado com React Context | Evita dependência adicional e deixa a futura migração para rotas localizadas opcional |

## Errors Encountered
| Error | Attempt | Resolution |
|---|---|---|
| `git diff --stat` falhou porque o diretório ainda não é um repositório Git | 1 | Registrado; validação continuará por arquivos e comandos do projeto |
| Typecheck: MapLibre v6 não possui export default e eventos perderam inferência | 1 | Alterado para import namespace e tipos explícitos de `MapMouseEvent` |
| Prévia visual não pôde abrir porque nenhum navegador estava disponível no ambiente | 1 | Confirmada resposta HTTP 200; limitação registrada para o handoff |
