# Prompt para adaptar a API — login por e-mail e senha

Adapte a API do World Pixel para trabalhar com o novo fluxo de autenticação do frontend. Leia o código existente antes de alterar qualquer arquivo e preserve todas as rotas e regras atuais de mapa, pintura, carteira, proteção, perfil e denúncias.

## Objetivo

O Supabase Auth será a autoridade de identidade. O frontend agora usa:

- `supabase.auth.signInWithPassword({ email, password })` para login;
- `supabase.auth.signUp({ email, password })` para cadastro;
- `supabase.auth.resetPasswordForEmail(email, { redirectTo })` para recuperação;
- `supabase.auth.updateUser({ password })` para definir a nova senha;
- o mesmo JWT Supabase em `Authorization: Bearer <access_token>` ao acessar a API World Pixel.

A API própria não deve receber, armazenar, registrar nem validar senhas. Ela deve apenas validar o JWT emitido pelo Supabase, como já faz nas rotas autenticadas.

## Requisitos da API

1. Preserve a autenticação Bearer atual e valide assinatura, expiração, issuer e audience do JWT Supabase.
2. Continue usando o `sub` do JWT como ID autoritativo do usuário.
3. Não crie endpoints próprios de login, cadastro, recuperação ou troca de senha.
4. Não use `service_role` no frontend e nunca devolva essa chave em respostas ou logs.
5. Garanta que o primeiro acesso de um usuário criado com senha produza ou encontre seu registro de perfil e carteira de forma idempotente.
6. `GET /profile`, `PATCH /profile`, `GET /wallet` e todas as mutações existentes devem continuar aceitando o novo JWT sem depender do método usado para gerar a sessão.
7. Se hoje houver lógica que exige identidade OTP, remova essa suposição; aceite qualquer sessão Supabase válida do provedor `email`.
8. Preserve os envelopes atuais `{ ok, data, request_id }` e `{ ok: false, error }`.
9. Em token ausente, inválido ou expirado, responda `401` com código `UNAUTHENTICATED`.
10. Não revele em nenhuma resposta pública se determinado e-mail existe.

## Configuração obrigatória no Supabase

Documente no README da API os passos manuais abaixo:

1. Em `Authentication > Sign In / Providers > Email`, habilitar login por e-mail e senha.
2. Durante a fase provisória, desabilitar `Confirm email`, permitindo cadastro sem disparar mensagem. Deixar claro que isso deve ser reavaliado antes da produção definitiva.
3. Configurar SMTP próprio para recuperação de senha.
4. Configurar `Site URL` com a URL oficial do frontend.
5. Adicionar URLs local, preview e produção em `Redirect URLs`, pois o link de recuperação volta ao frontend.
6. Configurar o template de recuperação de senha usando a URL de confirmação fornecida pelo Supabase.
7. Em `Authentication > Rate Limits`, manter no mínimo 60 segundos entre pedidos de recuperação do mesmo usuário e limites por IP adequados.
8. Respeitar também a cota do provedor SMTP e recomendar CAPTCHA se houver abuso.

## Proteção adicional opcional

Se a API já possuir um gateway ou endpoint intermediário para recuperação, aplique limite persistente de no máximo 5 pedidos por e-mail por hora e 20 por IP por hora. Normalize o e-mail antes de gerar a chave, armazene apenas hash/HMAC do endereço e sempre devolva uma resposta neutra. Não crie esse endpoint se o frontend continuar chamando diretamente o Supabase, pois o rate limit nativo do Supabase deve ser a fonte de verdade nesse desenho.

## Banco e perfil

- Verifique se existe trigger ou criação idempotente para perfil/carteira ao inserir em `auth.users`.
- O fluxo deve funcionar tanto para usuários novos com senha quanto para usuários existentes.
- Não apague usuários OTP existentes.
- Se usuários antigos ainda não tiverem senha, documente que precisarão usar recuperação de senha para defini-la.
- Preserve RLS e garanta que cada usuário só acesse os próprios dados privados.

## Testes mínimos

- JWT válido de usuário com senha acessa `GET /profile` e `GET /wallet`;
- JWT ausente, inválido e expirado retorna `401 UNAUTHENTICATED`;
- criação de perfil/carteira é idempotente;
- usuário existente não recebe registros duplicados;
- nenhuma resposta ou log contém senha, token completo, chave `service_role` ou informação sobre existência de e-mail;
- todas as rotas e testes anteriores continuam funcionando.

Ao terminar, execute lint, testes e build/typecheck da API. Informe arquivos alterados, migrações necessárias, variáveis de ambiente e cada configuração manual pendente no Supabase. Não altere contratos não relacionados.
