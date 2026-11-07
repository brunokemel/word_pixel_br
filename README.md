# World Pixel — front-end

Protótipo funcional de um mapa-múndi colaborativo. O usuário pode navegar, dar zoom, entrar com uma sessão local, pintar células terrestres e proteger um bloco 16×16 por 30 dias usando créditos simulados.

A interface está disponível em português, inglês e espanhol. O seletor no header salva a escolha no navegador; na primeira visita, o idioma é detectado pelas preferências do dispositivo.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Verificação

```bash
npm run typecheck
npm test
npm run build
```

## Arquitetura

- `src/components/map-board.tsx`: MapLibre, viewport, layers GeoJSON e eventos do mapa.
- `src/components/world-pixel-app.tsx`: estado da experiência e fluxos otimistas.
- `src/components/ui.tsx`: header, ferramentas, modais e detalhes do pixel.
- `src/lib/types.ts`: contratos compartilhados do domínio e da API.
- `src/lib/grid.ts`: conversão coordenada↔célula, chunks e seleção 16×16.
- `src/lib/mock-api.ts`: implementação local substituível de `WorldPixelApi`.
- `src/lib/i18n.tsx`: catálogos tipados, provider, detecção e persistência do idioma.

## Integração com Supabase

Substitua `worldPixelApi` por outro adaptador que implemente `WorldPixelApi`. Os pontos de integração já estão isolados em `src/lib/mock-api.ts`; componentes não fazem `fetch` diretamente. Configure apenas chaves públicas em `.env.local`, tomando `.env.example` como referência. Nunca exponha a chave `service_role`.

O mapa usa tiles públicos CARTO/OpenStreetMap para o protótipo. Em produção, escolha um provedor com contrato e limites compatíveis com o tráfego esperado. A máscara terrestre atual é deliberadamente simplificada e deverá ser substituída pela validação autoritativa da API/PostGIS.
