# World Pixel — front-end

Front-end funcional de um mapa-múndi colaborativo conectado à API World Pixel. O usuário pode navegar, entrar por magic link do Supabase, pintar células terrestres, consultar créditos e proteger um bloco 16×16 por 30 dias.

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
- `src/lib/http-api.ts`: cliente HTTP tipado para a API World Pixel no Render.
- `src/lib/supabase.ts`: sessão, autenticação e perfil derivados do Supabase Auth.
- `src/lib/palette.ts`: mapeamento estável das 32 cores aceitas pela API.
- `src/lib/i18n.tsx`: catálogos tipados, provider, detecção e persistência do idioma.

## Integração com Render e Supabase

O front usa a API HTTP configurada por `NEXT_PUBLIC_WORLD_PIXEL_API_URL` e autenticação Supabase com token Bearer. Copie `.env.example` para `.env.local` e informe a URL pública da API, a URL do projeto Supabase e a chave pública/anon. Nunca exponha `service_role`, `DATABASE_URL` ou segredos de webhook no frontend.

No Render, inclua as origens exatas do frontend em `WORLD_PIXEL_ORIGINS`. Na Vercel, cadastre as três variáveis `NEXT_PUBLIC_*` antes do build. Login é feito por magic link enviado ao e-mail.

O mapa usa tiles públicos OpenStreetMap para o protótipo. Em produção, escolha um provedor com contrato e limites compatíveis com o tráfego esperado. A API/PostGIS é autoritativa para validar terra, proteções e alterações de pixels.
