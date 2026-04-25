# 📖 Guia do Desenvolvedor — Casa da Família
### Como retomar, trabalhar e evoluir o projeto

---

## 1. COMO ENCERRAR O PROJETO HOJE

No PowerShell onde está o Claude Code rodando:

```
/exit
```

Ou simplesmente feche a janela do PowerShell. Não tem problema nenhum — todo o código já está salvo no GitHub.

---

## 2. COMO REABRIR O PROJETO NA PRÓXIMA VEZ

### Passo a passo completo:

**1. Abra o PowerShell**

**2. Vá até a pasta do projeto:**
```powershell
cd C:\VibeCoding\app-guia-da-casa-familia
```

**3. Inicie o servidor local (para ver o app no browser):**
```powershell
npm run dev
```
Acesse: http://localhost:3000

**4. Em outro PowerShell, abra o Claude Code:**
```powershell
cd C:\VibeCoding\app-guia-da-casa-familia
claude
```

**5. Dentro do Claude Code, inicialize o contexto:**
```
/init
```

Isso faz o Claude ler o CLAUDE.md e lembrar de tudo sobre o projeto.

**Pronto! Você está de volta.**

---

## 3. O CLAUDE CODE JÁ TEM CONTEXTO DO PROJETO?

**Sim!** O arquivo `CLAUDE.md` na raiz do projeto guarda todo o contexto:
- Design system (cores, tipografia)
- Stack (Next.js, Supabase, etc)
- Arquitetura de pastas
- Regras de UX
- Padrão de código

Toda vez que você rodar `/init`, o Claude Code lê esse arquivo e já sabe tudo sobre o projeto — não precisa explicar nada de novo.

---

## 4. COMO USAR NO VS CODE (COM EXTENSÃO)

Existe a extensão oficial do Claude Code para VS Code. É mais confortável que o terminal puro.

### Instalar:

1. Abra o VS Code
2. Clique no ícone de extensões (Ctrl+Shift+X)
3. Busque: **Claude Code**
4. Instale a extensão da Anthropic
5. Faça login com sua conta Anthropic

### Usar:

- Abre o VS Code na pasta do projeto
- No painel lateral aparece o Claude Code
- Você digita os prompts direto no VS Code
- O Claude vê os arquivos abertos e edita direto

### Diferença entre Terminal e VS Code:

| | Terminal (PowerShell) | VS Code (Extensão) |
|---|---|---|
| **Visualizar código** | Precisa abrir outro programa | Vê o código ao lado |
| **Aceitar edições** | Aperta Enter no terminal | Clica no botão na tela |
| **Conforto** | Mais técnico | Mais visual e amigável |
| **Funcionalidade** | 100% igual | 100% igual |
| **Recomendado para** | Comandos rápidos | Desenvolvimento longo |

**Resumo:** Mesma coisa, o VS Code é só mais confortável visualmente.

---

## 5. COMANDOS ESSENCIAIS DO DIA A DIA

### No PowerShell (fora do Claude Code):

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia o app em localhost:3000 |
| `npm run build` | Verifica se tem erros no código |
| `git add .` | Prepara todos os arquivos para salvar |
| `git commit -m "descrição"` | Salva as mudanças com uma descrição |
| `git push` | Envia para o GitHub (Vercel faz deploy) |
| `claude` | Abre o Claude Code |

### Dentro do Claude Code:

| Comando | O que faz |
|---------|-----------|
| `/init` | Lê o CLAUDE.md e inicializa o contexto |
| `/clear` | Limpa a conversa (libera memória) |
| `/cost` | Mostra quanto gastou na sessão |
| `/mcp` | Mostra os MCPs conectados (Stitch, etc) |
| `/exit` | Sai do Claude Code |

---

## 6. FLUXO DE TRABALHO RECOMENDADO

```
ABRIR O PROJETO
      ↓
Terminal 1: npm run dev
Terminal 2: claude → /init
      ↓
DESENVOLVER
      ↓
Digitar prompt no Claude Code
Aguardar → Aceitar edições (Enter)
Ver resultado em localhost:3000
      ↓
SALVAR E PUBLICAR
      ↓
git add .
git commit -m "o que foi feito"
git push
      ↓
Vercel faz deploy automático (~1 min)
App atualizado em produção!
```

---

## 7. COMO PEDIR MUDANÇAS AO CLAUDE CODE

### Para adicionar funcionalidade:
```
Adiciona [FUNCIONALIDADE] no módulo de [MÓDULO].
Siga o mesmo padrão dos outros módulos.
Use a cor [COR] do módulo.
```

### Para corrigir bug:
```
Esse erro apareceu: [cole o erro]
Arquivo: [nome do arquivo]
O que deveria fazer: [explique]
Corrija sem alterar o que já funcionava.
```

### Para criar nova tela:
```
Cria a tela de [NOME] seguindo o padrão do projeto.
Módulo: [qual módulo pertence]
Campos: [liste os campos]
Cor: [cor do módulo]
```

### Para ajustar visual:
```
Na tela [NOME], ajusta [O QUE MUDAR].
Mantém o design system do projeto.
```

---

## 8. INFORMAÇÕES IMPORTANTES DO PROJETO

### URLs
| Ambiente | URL |
|----------|-----|
| Local | http://localhost:3000 |
| Produção | https://app-guia-da-casa-familia.vercel.app |
| GitHub | https://github.com/edvaldovieeiraa/app-casa-da-familia |

### Módulos do App
| Módulo | Cor | Rota |
|--------|-----|------|
| 🏠 Imóveis | #E53935 | /imoveis |
| 📄 Documentos | #F5C842 | /documentos |
| 👥 Contatos | #4CAF50 | /contatos |
| 🛒 Feiras | #2196F3 | /feiras |
| 💰 Contas | gradiente | /contas |
| 👨‍👩‍👧 Família | #9C27B0 | /familia |
| 🐾 Pets | #FF6F00 | /pets |
| ⚙️ Config | #1A1A2E | /config |

### Arquivos Importantes
| Arquivo | Para que serve |
|---------|---------------|
| `CLAUDE.md` | Contexto do projeto para o Claude Code |
| `.env.local` | Credenciais do Supabase (nunca sobe pro GitHub) |
| `lib/modules.ts` | Configuração dos módulos |
| `types/database.ts` | Tipos TypeScript de tudo |

---

## 9. SE ALGO QUEBRAR

### App não abre em localhost:
```powershell
# Pare tudo (Ctrl+C) e rode:
npm install
npm run dev
```

### Erro de TypeScript:
```powershell
npm run build
# Leia o erro e descreva para o Claude Code
```

### Mudanças não aparecem na produção:
```powershell
git add .
git commit -m "fix: correção"
git push
# Aguarde 1-2 minutos e atualize o browser
```

### Claude Code não reconhece o projeto:
```
/init
```

### Perdeu o contexto no meio da conversa:
```
/clear
/init
```

---

## 10. PRÓXIMAS EVOLUÇÕES SUGERIDAS

Quando quiser evoluir o app, use estes prompts no Claude Code:

**Notificações de vencimento:**
```
Adiciona alertas visuais na Home para contas vencendo nos próximos 3 dias e documentos expirando em 30 dias.
```

**Relatório de gastos:**
```
Cria uma tela de relatório em /config/relatorio com gráfico de gastos mensais das contas por categoria.
```

**Busca global:**
```
Adiciona uma busca global no header da Home que pesquisa em imóveis, contatos e documentos ao mesmo tempo.
```

**Modo escuro:**
```
Implementa toggle de modo escuro/claro nas configurações, salvando a preferência no localStorage.
```

---

*Documentação criada em Abril de 2026.*
*Projeto: Casa da Família — PWA para gestão familiar.*
