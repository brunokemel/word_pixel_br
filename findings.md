# Findings

- O repositório continha somente `prompt-front.txt` e `prompt-api-banco.txt`.
- Não existe código, package manager configurado ou repositório Git inicializado.
- O front precisa ser autocontido e usar uma API mock até o back-end Supabase existir.
- Next.js 16.4.5 gerou `AGENTS.md` automaticamente e o projeto segue App Router com componentes cliente apenas onde necessário.
- A rota local respondeu HTTP 200 e o build estático foi gerado com sucesso.
- Não havia navegador disponível na ferramenta de prévia, portanto a inspeção visual automatizada ficou indisponível; validações de código, build e resposta HTTP foram concluídas.
- Os textos visíveis estão concentrados em `ui.tsx`, `world-pixel-app.tsx`, `map-board.tsx` e mensagens do adaptador mock.
- Um catálogo local com chaves estáveis cobre o escopo atual sem alterar rotas ou adicionar dependências.
- A tipagem `Catalog = Record<TranslationKey, string>` garante em compilação que inglês e espanhol tenham todas as chaves do português.
- A escolha de idioma fica em `localStorage` e o atributo `lang` do documento acompanha a seleção.
- A proteção atual alinha a seleção automaticamente em blocos fixos 16×16 e a cotação recebe apenas uma célula.
- Para seleção livre, `ProtectionQuote` e `quoteProtection` precisam transportar origem, largura e altura; o limite inicial será 256 pixels.
- A seleção por arraste usa um retângulo proporcional limitado automaticamente a 256 pixels; o mock cobra R$ 0,01 por pixel.
- A cotação rejeita áreas que cruzam o oceano ou se sobrepõem a uma proteção ativa.
