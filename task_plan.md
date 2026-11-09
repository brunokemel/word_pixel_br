# World Pixel Front-end

## Goal
Construir no repositório atual um front-end funcional, responsivo e validado para o mapa colaborativo World Pixel, seguindo `prompt-front.txt`.

## Next Step
Validar em aparelhos físicos após o próximo deploy e ajustar casos específicos, se encontrados.

## Current Phase
Concluído no código; pronto para commit e teste em dispositivos físicos.

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

### Phase 6 — Compra de área selecionável
**Status:** complete
- [x] Generalizar contratos, cotação e preço para retângulos de até 256 pixels
- [x] Implementar seleção por arraste e prévia visual no mapa
- [x] Exibir dimensões, quantidade de pixels e preço na confirmação
- [x] Validar conflitos, limite, typecheck, testes e build

### Phase 7 — Pincel contínuo estilo Paint
**Status:** complete
- [x] Criar camada Canvas responsiva sobre o MapLibre
- [x] Renderizar linha vetorial progressiva com suavização quadrática/Catmull-Rom
- [x] Interpolar amostras rápidas e manter espessura constante
- [x] Persistir as células atravessadas sem bloquear o feedback visual
- [x] Validar desempenho, typecheck, testes e build

### Phase 8 — Integração com API real no Render
**Status:** complete
- [x] Configurar Supabase Auth e cliente HTTP central com envelopes, timeout e request ID
- [x] Adaptar grade 65536×32768, chunks 64 e paleta fixa de 32 cores
- [x] Integrar mapa público, pintura autenticada, carteira e proteção fixa 16×16
- [x] Implementar restauração de sessão, logout e tratamento dos erros reais
- [x] Atualizar configuração, documentação, testes e checklist de implantação
- [x] Executar typecheck, testes e build de produção

### Phase 9 — Identidade visual oficial
**Status:** complete
- [x] Usar `logoMaior.png` no header responsivo
- [x] Usar `logoMenor.png` como ícone/fav icon do navegador
- [x] Validar transparência, typecheck, testes e build

### Phase 10 — Responsividade touch
**Status:** complete
- [x] Ajustar header, ferramentas, paleta, modais e painéis para telas pequenas e tablets
- [x] Respeitar safe areas, orientação paisagem e alvos de toque
- [x] Exibir orientação de caneta capacitiva apenas em dispositivos touch
- [x] Traduzir a orientação em português, inglês e espanhol
- [x] Executar typecheck, testes e build de produção

## Decisions Made
| Decision | Rationale |
|---|---|
| Next.js + TypeScript + MapLibre | Stack solicitada no prompt e adequada para futura integração Supabase |
| Adaptador mock em memória | Permite experiência completa sem acoplar o front à API ainda inexistente |
| GeoJSON em layers do MapLibre | Evita um elemento DOM por pixel e mantém interação acoplada ao mapa |
| Catálogo local tipado com React Context | Evita dependência adicional e deixa a futura migração para rotas localizadas opcional |
| Limite inicial de 256 pixels por compra | Preserva o teto econômico do bloco 16×16 atual, permitindo formatos retangulares livres |
| Canvas 2D separado para o traço ativo | Evita esperar React, MapLibre ou rede; o feedback aparece no mesmo frame e as células continuam sendo persistidas em paralelo |
| API HTTP no Render + Supabase Auth no navegador | Corresponde ao contrato real: a API recebe Bearer do Supabase e permanece autoritativa para dados do mapa |
| Proteção fixa 16×16 e paleta numérica de 32 cores | São invariantes validados pelo backend; o front não deve oferecer payloads que serão rejeitados |
| PNG horizontal no header e PNG quadrado nos metadados | Reutiliza os ativos oficiais, preserva transparência e deixa a otimização do header a cargo do Next Image |
| Media queries por largura, altura, orientação e tipo de ponteiro | Cobre celular, tablet, paisagem, safe areas e touch sem depender de detecção frágil por user agent |

## Errors Encountered
| Error | Attempt | Resolution |
|---|---|---|
| `git diff --stat` falhou porque o diretório ainda não é um repositório Git | 1 | Registrado; validação continuará por arquivos e comandos do projeto |
| Typecheck: MapLibre v6 não possui export default e eventos perderam inferência | 1 | Alterado para import namespace e tipos explícitos de `MapMouseEvent` |
| Prévia visual não pôde abrir porque nenhum navegador estava disponível no ambiente | 1 | Confirmada resposta HTTP 200; limitação registrada para o handoff |
| `npm run check` não existe no frontend | 1 | Executados separadamente `npm run typecheck`, `npm test` e `npm run build` |
| Comando combinado de commit e `git push` foi bloqueado pela política do ambiente | 1 | Nenhuma etapa executou; commit local será feito separadamente e o push ficará para o terminal do usuário |
| Navegador interno indisponível para QA visual do pincel | 1 | Mantidas validações automatizadas e solicitado teste visual local após o handoff |
| Checagem HTTP recusada porque o servidor dev estava parado | 1 | Iniciar instância temporária em porta isolada, validar e encerrar |
| Browser interno indisponível na QA final da integração | 1 | Servidor local validado por HTTP 200; inspeção visual permanece como teste manual recomendado |
| MapLibre falhou em produção durante `resize/_calcMatrices` | 1 | Removidas restrições de câmera incompatíveis e mantido clamp apenas no bbox enviado à API |
