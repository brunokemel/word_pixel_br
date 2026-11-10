# World Pixel

World Pixel é o front-end de um mapa-múndi colaborativo no qual visitantes podem explorar o planeta e usuários autenticados podem pintar células, acompanhar alterações em tempo real, consultar créditos e proteger blocos de 16 × 16 células por 30 dias.

A interface é responsiva e está disponível em português, inglês e espanhol. O idioma escolhido é salvo no navegador; na primeira visita, a preferência do dispositivo é usada como padrão.

## Funcionalidades

- navegação pelo mapa com zoom, arraste e suporte a toque;
- pintura de células terrestres a partir do zoom 10;
- feedback visual imediato enquanto o usuário desenha;
- atualização otimista dos pixels e sincronização com o backend;
- atualizações em tempo real pelo Supabase Realtime;
- autenticação por código enviado por e-mail (OTP);
- seleção e proteção de áreas fixas de 16 × 16 células;
- carteira de créditos, perfil e denúncias de conteúdo;
- interface internacionalizada em `pt-BR`, `en` e `es`.

## De onde vem o mapa

O mapa visível é formado por três partes independentes:

| Parte | Tecnologia/origem | Responsabilidade |
| --- | --- | --- |
| Renderização e interação | [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) | Exibe o mapa, controla câmera, zoom, eventos e camadas. |
| Fundo cartográfico | [OpenStreetMap](https://www.openstreetmap.org/) | Fornece os tiles raster com ruas, países e demais elementos geográficos. |
| Pixels colaborativos | API World Pixel | Retorna e persiste as células pintadas, proteções, perfil e carteira. |

### Tiles do OpenStreetMap

Atualmente, o protótipo carrega tiles diretamente de:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

Essa URL está configurada em `src/components/map-board.tsx`. Ela não exige chave de API, mas não é um serviço ilimitado: o uso deve respeitar a [política de utilização dos tiles do OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) e manter a atribuição aos colaboradores do projeto.

Para produção com tráfego relevante, use um provedor de tiles com contrato, cache, disponibilidade e limites adequados. Trocar o provedor normalmente exige apenas alterar a fonte `raster` do estilo do MapLibre. MapLibre não fornece os dados geográficos; ele apenas renderiza a fonte configurada.

### API World Pixel

Os pixels coloridos não vêm do OpenStreetMap. Eles são carregados da API própria definida pela variável:

```env
NEXT_PUBLIC_WORLD_PIXEL_API_URL=https://SUA-API.onrender.com
```

Ao mover ou ampliar o mapa, o cliente calcula o `bbox` visível, cancela a requisição anterior e consulta:

```http
GET /map/chunks?bbox=minLng,minLat,maxLng,maxLat&zoom=0..22
```

A API e o banco são a fonte autoritativa para validar se uma célula está em terra, impedir alterações em áreas protegidas, controlar créditos e persistir pixels. O cliente nunca deve ser considerado autoridade para essas regras.

## Arquitetura técnica

```text
Navegador
├── Next.js + React
├── MapLibre GL JS
│   └── tiles raster do OpenStreetMap
├── API World Pixel (HTTP/JSON)
│   └── mapa, pintura, proteções, perfil, carteira e denúncias
└── Supabase
    ├── Auth: sessão e OTP por e-mail
    └── Realtime: alterações na tabela pixel_cells
```

### Grade geográfica

O mundo é convertido em uma grade lógica de `65.536 × 32.768` células. As células são agrupadas em chunks de `64 × 64` para reduzir o volume de leitura e limitar as assinaturas em tempo real ao viewport atual.

- zoom mínimo para pintar ou proteger: `10`;
- bloco de proteção: `16 × 16` (`256` pixels);
- longitude suportada: `-180` a `180`;
- latitude suportada: `-90` a `90`.

As conversões entre longitude/latitude, célula e chunk estão em `src/lib/grid.ts`.

### Renderização dos pixels

O MapLibre renderiza o mapa base e as camadas GeoJSON de seleção e proteção. Durante um traço, um Canvas 2D sobreposto oferece resposta visual imediata. As células são interpoladas entre os eventos do ponteiro para evitar lacunas e depois são enviadas à API.

### Comunicação com a API

O cliente HTTP em `src/lib/http-api.ts`:

- envia e recebe JSON;
- adiciona `X-Request-Id` a cada chamada;
- usa timeout de 60 segundos;
- envia `Authorization: Bearer <access_token>` nas rotas autenticadas;
- tenta renovar a sessão uma vez após uma resposta `401`;
- cancela leituras antigas do mapa quando o viewport muda;
- converte os envelopes `{ ok, data }` e `{ ok, error }` em tipos da aplicação.

Principais rotas usadas pelo front-end:

| Método | Rota | Autenticação | Uso |
| --- | --- | --- | --- |
| `GET` | `/map/chunks` | pública | Carregar os pixels do viewport. |
| `POST` | `/pixels/paint` | Bearer | Pintar uma célula. |
| `POST` | `/protections/quote` | Bearer | Calcular o preço de uma proteção. |
| `POST` | `/protections/purchase` | Bearer | Comprar uma proteção. |
| `GET` | `/protections/:id` | Bearer | Consultar uma proteção. |
| `GET` | `/wallet` | Bearer | Consultar os créditos. |
| `GET` / `PATCH` | `/profile` | Bearer | Consultar ou atualizar o perfil. |
| `POST` | `/reports` | Bearer | Enviar uma denúncia. |

### Autenticação e tempo real

O login usa [Supabase Auth](https://supabase.com/docs/guides/auth) com OTP por e-mail. A sessão é persistida e renovada automaticamente pelo SDK. A chave `anon` é pública e pode estar no navegador, desde que o banco tenha políticas RLS corretas; a chave `service_role` nunca deve ser exposta no front-end.

Depois de carregar os chunks visíveis, o front assina mudanças da tabela `public.pixel_cells` pelo [Supabase Realtime](https://supabase.com/docs/guides/realtime). Ao trocar o viewport, a assinatura anterior é removida e uma nova é criada para os chunks relevantes.

## Tecnologias

- [Next.js](https://nextjs.org/docs) e React;
- TypeScript;
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/);
- [OpenStreetMap](https://www.openstreetmap.org/about/);
- [Supabase JavaScript](https://supabase.com/docs/reference/javascript/introduction);
- Tailwind CSS/PostCSS;
- Vitest e Testing Library;
- Lucide React.

## Estrutura principal

| Caminho | Responsabilidade |
| --- | --- |
| `src/components/map-board.tsx` | MapLibre, viewport, eventos, layers GeoJSON e Canvas do pincel. |
| `src/components/world-pixel-app.tsx` | Estado principal, pintura otimista e fluxos do produto. |
| `src/components/ui.tsx` | Cabeçalho, ferramentas, modais e detalhes do pixel. |
| `src/lib/http-api.ts` | Cliente HTTP tipado da API World Pixel. |
| `src/lib/supabase.ts` | Cliente, sessão e renovação do Supabase. |
| `src/lib/grid.ts` | Coordenadas, grade, chunks e seleção 16 × 16. |
| `src/lib/types.ts` | Contratos do domínio e interface da API. |
| `src/lib/palette.ts` | Paleta estável das 32 cores aceitas pela API. |
| `src/lib/i18n.tsx` | Traduções, detecção e persistência do idioma. |

## Configuração local

### Requisitos

- Node.js compatível com a versão atual do Next.js;
- npm;
- uma API World Pixel acessível;
- um projeto Supabase configurado para autenticação e Realtime.

### Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_WORLD_PIXEL_API_URL=https://SUA-API.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_ANON
```

Todas as variáveis prefixadas com `NEXT_PUBLIC_` ficam disponíveis no navegador. Não coloque nelas `service_role`, `DATABASE_URL`, segredos de webhook ou qualquer credencial privada.

### Instalação e execução

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera o build de produção. |
| `npm start` | Executa o build de produção. |
| `npm run lint` | Executa o ESLint. |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos. |
| `npm test` | Executa os testes com Vitest. |

Antes de publicar, execute:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Publicação

No serviço que hospeda o front-end, configure as três variáveis `NEXT_PUBLIC_*` antes do build. No backend, permita a origem exata do site na configuração de CORS (`WORLD_PIXEL_ORIGINS`).

Também verifique:

- URLs de redirecionamento permitidas no Supabase Auth;
- RLS e permissões da tabela usada pelo Realtime;
- atribuição visível do OpenStreetMap;
- política, cota e custo do provedor de tiles escolhido;
- HTTPS tanto no front-end quanto na API.

## Referências

- [Documentação do MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Especificação de estilos do MapLibre](https://maplibre.org/maplibre-style-spec/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Política de tiles do OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
- [Diretrizes de atribuição do OpenStreetMap](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript](https://supabase.com/docs/reference/javascript/introduction)

## Observações de produção

Os tiles públicos do OpenStreetMap são adequados para desenvolvimento e protótipos de baixo tráfego, mas não representam um SLA comercial. A adoção de um provedor apropriado, o cache correto e o monitoramento de custos devem fazer parte da preparação para produção.

Da mesma forma, validações críticas devem permanecer no backend. A experiência otimista do front-end melhora a sensação de velocidade, mas o resultado confirmado pela API/PostGIS é sempre o estado definitivo.
