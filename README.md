# TaskFlow

Aplicativo web/PWA de gerenciamento de tarefas com autenticacao Firebase e dados por usuario no Firestore.

## Como rodar localmente

Recomendado usar um servidor local para evitar problemas com modulos ES, Firebase e service worker:

```bash
python -m http.server 3000
```

Depois acesse:

```text
http://localhost:3000
```

## Estrutura principal

```text
index.html        Tela de login e cadastro Firebase
app.html          Painel principal do usuario
sw.js             Service worker do PWA
manifest.json     Manifesto do app
firestore.rules   Regras recomendadas para o Firestore
```

## Autenticacao

O app usa Firebase Authentication por email e senha. Nao ha usuario ou senha padrao no codigo.

Funcionalidades atuais:

- Login com mensagem generica para reduzir enumeracao de contas.
- Cadastro com validacao de email, nome, senha forte e confirmacao de senha.
- Bloqueio local temporario apos muitas tentativas de login.
- Painel de conta para alterar nome, email e senha.
- Envio de email de verificacao.

## Firestore

Os dados sao salvos em:

```text
users/{uid}/paineis
users/{uid}/tarefas
```

Use `firestore.rules` como base de seguranca no console/projeto Firebase para garantir que cada usuario acesse somente os proprios dados.

## Tarefas

O painel suporta:

- Paineis por area/projeto.
- Tarefas com dia, prioridade e status concluido/pendente.
- Busca dentro do painel.
- Filtros por status, prioridade e dia.
- Agrupamento por dia, status ou prioridade.
