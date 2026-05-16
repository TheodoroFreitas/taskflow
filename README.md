# TaskFlow — Sistema de Tarefas

## Como rodar no PC

### Opção 1 — Abrir diretamente (mais simples)
Basta abrir o arquivo `index.html` no navegador.
Funciona no Chrome, Edge, Firefox e outros navegadores modernos.

### Opção 2 — Servidor local (recomendado)
Se você tem Python instalado:

```bash
# Navegar até a pasta do projeto
cd taskflow-app

# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

Depois acesse: http://localhost:3000

Se tiver Node.js:
```bash
npx serve .
```

---

## Estrutura de arquivos

```
taskflow-app/
├── index.html        ← Tela de login
├── app.html          ← Painel principal (abre após login)
├── css/
│   ├── style.css     ← Estilos do login
│   └── app.css       ← Estilos do painel
└── js/
    ├── login.js      ← Lógica de autenticação
    └── app.js        ← Lógica principal do app
```

---

## Credenciais de acesso

| Email             | Senha |
|-------------------|-------|
| admin@gmail.com   | 1234  |

---

## Funcionalidades

- **Sidebar estilo Notion** com painéis criáveis
- **Criar painéis** com nome, emoji e cor personalizados
- **Visão Geral** — resumo de todos os painéis e estatísticas
- **Agenda Semanal** — todas as tarefas organizadas por dia da semana
- **Tarefas** com prioridade (Alta / Média / Baixa) e dia da semana
- **Filtros** por status, prioridade e dia
- **Renomear** painéis e tarefas diretamente na tela
- **Persistência** com localStorage — dados salvos mesmo fechando o navegador
- Sidebar recolhível

---

## Dados de exemplo

O app já vem com 3 painéis e 4 tarefas de exemplo para demonstração.
Todos os dados são salvos localmente no navegador (localStorage).
