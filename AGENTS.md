<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Galeria local de erros

Ao criar um novo código, componente ou apresentação visual de erro, adicione também uma demonstração selecionável em `/dev/error-states`. A galeria deve continuar restrita a `NODE_ENV=development` e não pode depender de chamadas reais à API.

## Internacionalização obrigatória

Todo texto novo visível na interface, incluindo rótulos, acessibilidade, mensagens, páginas auxiliares e ferramentas locais, deve ser adicionado simultaneamente aos catálogos `pt`, `en` e `es`. Não adicione texto visível fixo diretamente em JSX. Antes de concluir uma mudança, execute a auditoria de textos e os testes de completude do catálogo.
