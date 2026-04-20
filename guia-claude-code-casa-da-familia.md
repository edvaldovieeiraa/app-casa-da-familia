# 🏠 Casa da Família — Guia Claude Code
### Do zero ao app funcionando, passo a passo

---

## PRÉ-REQUISITOS

Antes de começar, garanta que você tem:

```bash
node --version   # precisa ser v18+
npm --version    # vem junto com o node
```

Se não tiver Node, baixe em: https://nodejs.org

---

## ETAPA 0 — Instalar o Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Depois autentique:

```bash
claude
```

Vai abrir o browser para login com sua conta Anthropic. Faça o login e volte ao terminal.

---

## ETAPA 1 — Configurar o MCP do Google Stitch

> ⚠️  Gere uma nova API Key no Stitch antes. A key anterior foi exposta.
> Acesse: https://stitch.google.com → Settings → API Keys → Create Key

Com a nova key em mãos, adicione o MCP do Stitch:

```bash
claude mcp add stitch \
  --transport http \
  https://stitch.googleapis.com/mcp \
  --header "X-Goog-Api-Key: SUA_NOVA_KEY_AQUI" \
  --scope user
```

Verifique se conectou:

```bash
claude mcp list
```

Deve aparecer `stitch` na lista com status conectado.

---

## ETAPA 2 — Criar o Projeto Next.js

```bash
# Crie a pasta e entre nela
mkdir casa-da-familia
cd casa-da-familia

# Crie o projeto Next.js
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Responda as perguntas assim:
- Would you like to use Turbopack? → **No**
- (resto aceita padrão)

---

## ETAPA 3 — Instalar Dependências

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  framer-motion \
  lucide-react \
  next-pwa \
  @google/stitch-sdk
```

---

## ETAPA 4 — Criar o CLAUDE.md

Este arquivo é o "cérebro" do projeto. O Claude Code lê ele automaticamente em toda sessão.

Crie na raiz do projeto:

```bash
touch CLAUDE.md
```

Cole o conteúdo abaixo no arquivo:

---

```markdown
# Casa da Família — Contexto do Projeto

## O que é
PWA mobile-first para gerenciamento familiar: imóveis, documentos, contatos, feiras e contas.
Usuários principais são pessoas sem intimidade com tecnologia (pais idosos).

## Stack
- Next.js 14+ App Router
- TypeScript (sem `any`)
- Tailwind CSS
- Supabase (auth + database)
- Lucide React (ícones)
- Framer Motion (animações)
- Google Stitch MCP (geração de interfaces)

## Design System — Paleta Maximus
Cores por módulo:
- Imóveis     → #E53935 (vermelho)
- Documentos  → #F5C842 (amarelo) — texto escuro #333
- Contatos    → #4CAF50 (verde)
- Feiras      → #2196F3 (azul)
- Contas      → gradient(#E53935, #F5C842)
- Config      → #1A1A2E (escuro)

Cores de suporte:
- Background  → #F8F9FA
- Cards       → #FFFFFF
- Texto       → #333333
- Texto suave → #666666

Tipografia: Nunito (400, 600, 700, 800)
Border radius: cards=16px, botões=12px, inputs=10px
Touch targets: mínimo 48px
Animações: Framer Motion (tap → scale 0.95, listas → stagger fadeUp)

## Regras de UX
1. Botões grandes, espaçados, mínimo 48px altura
2. Textos simples sem jargão técnico
3. Toast de feedback em todas as ações
4. Confirmação modal antes de deletar
5. Copiar campo com um toque + toast "Copiado!"
6. Empty state em toda lista vazia
7. Skeleton loading enquanto carrega dados
8. Cada módulo usa sua cor em 100% dos elementos

## Estrutura de Pastas
app/
  (auth)/login/       → tela de login
  (app)/              → páginas protegidas
    page.tsx          → Home com grid de módulos
    imoveis/          → lista, [id], novo, [id]/editar
    documentos/
    contatos/
    feiras/
    contas/
    config/
components/
  ui/                 → Button, Input, Card, Modal, Toast...
  modules/            → componentes específicos de cada módulo
lib/
  supabase/           → client.ts, server.ts
types/
  database.ts         → interfaces TypeScript

## Como Usar o Stitch MCP
Quando precisar criar uma nova tela, SEMPRE:
1. Chame o Stitch com prompt detalhado em português
2. Especifique: mobile-first, paleta Maximus, Nunito, touch targets 48px
3. Pegue o HTML gerado e converta para componente React/Tailwind
4. Adapte as cores para as variáveis do Tailwind config

## Banco de Dados (Supabase)
Tabelas principais:
- familia_membros
- imoveis (campos: nome, apelido, endereco_completo, cep, unidade_consumidora, cpf_conta_luz, matricula_imovel, codigo_iptu, matricula_agua, sequencial, observacoes, foto_url, favorito)
- documentos
- contatos
- feiras + feira_itens + feira_historico
- contas
- acessos_sistemas

## Padrão de Código
- Sempre TypeScript estrito
- Sempre loading + error states
- Sempre empty state nas listas
- Sempre aria-labels nos botões
- Sempre toast de feedback
- Nunca `any`
- Nunca inline styles quando existe classe Tailwind
```

---

## ETAPA 5 — Iniciar o Claude Code no Projeto

```bash
# Dentro da pasta do projeto
claude
```

Ao entrar, rode:

```
/init
```

Isso faz o Claude Code ler o CLAUDE.md e entender o projeto.

---

## ETAPA 6 — Sequência de Prompts para Construir o App

Cole os prompts abaixo **um de cada vez** no Claude Code.
Espere cada etapa terminar antes de ir para a próxima.

---

### PROMPT 1 — Configurar Tailwind e Globals

```
Configure o Tailwind CSS completo para o Casa da Família:

1. Atualize tailwind.config.ts com todas as cores do design system (paleta Maximus), fonte Nunito, border radius e shadows personalizados

2. Atualize app/globals.css com:
   - Import do Nunito via Google Fonts
   - Classes utilitárias: .btn-primary, .btn-secondary, .input, .card
   - CSS para o background gradient do módulo Contas
   - Reset de tap highlight no mobile

3. Atualize app/layout.tsx com:
   - Meta tags PWA (theme-color, viewport, apple-mobile-web-app)
   - Fonte Nunito carregada
   - Background #F8F9FA

Forneça os 3 arquivos completos.
```

---

### PROMPT 2 — Criar Tipos TypeScript

```
Crie o arquivo types/database.ts com as interfaces TypeScript completas para:
- FamiliaMembro
- Imovel (todos os campos do CLAUDE.md)
- Documento
- Contato
- Feira, FeiraItem, FeiraHistorico
- Conta
- AcessoSistema

Também crie types/ui.ts com tipos auxiliares:
- ModuleConfig (id, label, color, gradient, icon, href)
- ToastType
- LoadingState

Arquivo completo, sem any.
```

---

### PROMPT 3 — Setup Supabase

```
Configure o Supabase para o projeto:

1. Crie lib/supabase/client.ts — cliente para componentes do browser
2. Crie lib/supabase/server.ts — cliente para Server Components e API Routes
3. Crie lib/supabase/middleware.ts — refresh de sessão
4. Atualize middleware.ts na raiz para proteger as rotas (app) e redirecionar não autenticados para /login

Use @supabase/ssr. As env vars são:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Crie também .env.local.example com as vars necessárias.
```

---

### PROMPT 4 — Componentes Base (UI Kit)

```
Crie a biblioteca de componentes em components/ui/:

1. Button.tsx — variantes: primary, secondary, danger, ghost; tamanhos: sm, md, lg; props: loading, disabled, fullWidth, icon; animação whileTap scale 0.95

2. Input.tsx — label, error, hint, icon esquerda, variante search

3. Card.tsx — variantes: elevated (shadow), outlined (border), filled (bg colorido)

4. Modal.tsx — overlay com blur sutil, animação slideUp, tamanhos: sm/md/lg/full; prop onClose

5. Toast.tsx + useToast.ts — tipos: success/error/warning/info; animação slide da direita; auto-dismiss 3s

6. EmptyState.tsx — ícone, título, descrição, botão de ação opcional

7. Skeleton.tsx — variantes: text, card, avatar

8. Avatar.tsx — foto ou iniciais coloridas (cor baseada no nome)

9. Badge.tsx — status: pendente(amarelo), pago(verde), vencido(vermelho), ativo(azul)

10. BottomSheet.tsx — sheet que sobe do bottom, overlay, handle bar

11. CopyButton.tsx — copia texto, muda ícone para check por 2s, dispara toast "Copiado!"

Crie index.ts exportando tudo.
Todos com TypeScript estrito, animações Framer Motion, Lucide React.
```

---

### PROMPT 5 — Gerar Interfaces com Stitch

```
Use o Stitch MCP para gerar as interfaces visuais do app. Para cada tela, chame o Stitch com o prompt abaixo:

TELA 1 - Home:
"Mobile app home screen, family management app called Casa da Família. Dark navy header (#1A1A2E) with house icon and greeting text. 2x3 grid of large colorful module cards below: Imóveis (red #E53935), Documentos (yellow #F5C842), Contatos (green #4CAF50), Feiras (blue #2196F3), Contas (red-to-yellow gradient), Configurações (dark). Each card has large icon, module name in white (dark text on yellow), subtle item count. Background #F8F9FA. Font: Nunito. Rounded corners 16px. Clean, simple, high contrast. Mobile 375px wide."

TELA 2 - Lista de Imóveis:
"Mobile app screen, list of real estate properties. Red header (#E53935) with 'Imóveis' title, back arrow, search bar (white/translucent). List of property cards below: each card white, rounded 16px, property photo thumbnail (60px), property name bold, address in gray, star icon for favorite. Red floating action button (+) bottom right. Background #F8F9FA. Font Nunito. Clean, mobile-first."

TELA 3 - Detalhes do Imóvel:
"Mobile app screen, property details. Red header with property name and edit button. Content cards with sections: Endereço, Energia (unidade consumidora, CPF), Água (matrícula), Documentação (IPTU, matrícula). Each field shows label in gray small text + value in bold + copy icon button on the right. Clean white cards, rounded 16px, well spaced. Font Nunito."

TELA 4 - Formulário de Imóvel:
"Mobile app form screen, add new property. Red header 'Novo Imóvel'. Large input fields with labels: Nome, CEP (with search button), Endereço, Número, Bairro, Cidade, Estado. Second section: Unidade Consumidora, CPF Conta de Luz, Matrícula Imóvel, Código IPTU. Large red save button at bottom. Scrollable. Font Nunito. Clean, accessible, 48px tap targets."

Após gerar cada tela com o Stitch, pegue o HTML/CSS retornado e converta para componente React com Tailwind CSS, seguindo o design system do CLAUDE.md. Salve em components/screens/.
```

---

### PROMPT 6 — Layout e Navegação

```
Crie os componentes de layout do app:

1. components/layout/Header.tsx
   - Props: title, color (cor do módulo), showBack, actions (ReactNode)
   - Botão voltar com router.back()
   - Cor de fundo dinâmica conforme o módulo

2. components/layout/BottomNav.tsx
   - 5 itens: Imóveis, Docs, Contatos, Feiras, Config
   - Ícones Lucide de 24px + label 12px
   - Item ativo destacado com a cor do módulo
   - Fixed bottom, safe area padding

3. components/layout/PageContainer.tsx
   - Wrapper padrão: padding, pb-24 para não cobrir o BottomNav
   - Max width 480px centralizado

4. app/(app)/layout.tsx
   - Inclui BottomNav
   - Verifica autenticação com Supabase

5. Constante lib/modules.ts com configuração dos 6 módulos:
   { id, label, href, color, gradient, icon, description }
```

---

### PROMPT 7 — Página Home

```
Crie a página Home completa em app/(app)/page.tsx:

- Header escuro #1A1A2E com logo 🏠 e "Olá, [nome do usuário]!"
- Buscar contadores reais do Supabase (count de cada tabela) com Promise.all
- Grid 2x3 de ModuleCard, cada card com:
  - Cor de fundo do módulo
  - Ícone Lucide 32px branco (exceto Documentos: #333)
  - Nome do módulo
  - Contador "X cadastrados"
  - Link para a rota do módulo
- Animação staggered: cards aparecem um a um com fadeUp
- Estado de loading: skeleton dos cards
- Usar os dados de lib/modules.ts

Componente ModuleCard em components/modules/ModuleCard.tsx.
```

---

### PROMPT 8 — Módulo Imóveis Completo

```
Crie o módulo de Imóveis completo (este será o modelo para os outros módulos):

1. app/(app)/imoveis/page.tsx — Lista
   - Header vermelho com busca integrada
   - Buscar imoveis do Supabase ordenado por favorito desc, nome asc
   - Filtro por busca em tempo real (nome + endereço)
   - ImovelCard para cada item
   - FAB (+) vermelho para adicionar
   - Empty state se lista vazia

2. app/(app)/imoveis/[id]/page.tsx — Detalhes
   - Header vermelho com nome do imóvel + botão editar
   - Foto da fachada (ou placeholder)
   - Seções colapsáveis: Localização, Energia, Água, Documentação, Acessos
   - CopyField para cada campo importante
   - Botão "Excluir imóvel" no final (vermelho, com confirmação modal)

3. app/(app)/imoveis/novo/page.tsx — Criar
   - Usar ImovelForm

4. app/(app)/imoveis/[id]/editar/page.tsx — Editar
   - Carregar dados do Supabase
   - Usar ImovelForm preenchido

5. components/modules/imoveis/ImovelCard.tsx
   - Foto/ícone placeholder, nome, endereço resumido, estrela de favorito

6. components/modules/imoveis/ImovelForm.tsx
   - Todos os campos do schema
   - Busca automática de CEP via ViaCEP
   - Upload de foto (Supabase Storage)
   - Validação e submit

7. hooks/useImoveis.ts
   - CRUD completo com Supabase
   - Estados: loading, error, data

Cor: #E53935 em todos os elementos do módulo.
```

---

### PROMPT 9 — Módulo Contas

```
Seguindo exatamente o padrão do módulo de Imóveis, crie o módulo de Contas:

Cor do módulo: gradient linear-gradient(135deg, #E53935, #F5C842)
Ícone: Wallet (Lucide)

Campos da conta:
- Descrição (obrigatório)
- Tipo: luz/água/gás/internet/IPTU/condomínio/seguro/outro
- Imóvel relacionado (select dos imóveis cadastrados)
- Valor
- Data de vencimento (obrigatório)
- Recorrente? (toggle) → se sim: frequência (mensal/anual/etc)
- Código de barras
- PIX copia e cola
- Status: pendente/pago/vencido (calculado automaticamente)

Funcionalidades especiais:
- Filtro por mês (mês atual por padrão)
- Filtro por status
- Card mostra: descrição, valor, data vencimento, badge de status colorido
- Botão "Marcar como pago" no card e nos detalhes
- Alerta visual para contas vencidas (borda vermelha no card)
- Resumo no topo: total do mês, total pago, total pendente
```

---

### PROMPT 10 — Módulo Feiras

```
Seguindo o padrão dos outros módulos, crie o módulo de Feiras:

Cor: #2196F3 (azul)
Ícone: ShoppingCart

Funcionalidades:
1. Lista de feiras cadastradas por tipo
2. Calendário semanal horizontal (Dom-Sáb) mostrando dias com feira
3. Ao tocar num dia, expande mostrando as feiras daquele dia
4. Cada feira tem:
   - Nome, tipo, dia da semana, local
   - Lista de compras padrão (itens adicionáveis)
5. Botão "Registrar ida à feira" → modal com campo de valor gasto
6. Histórico dos últimos 4 registros com valor gasto
7. Total gasto no mês (soma dos registros)

Componentes:
- WeekCalendar.tsx — calendário horizontal scrollável
- FeiraCard.tsx — card da feira
- FeiraListaCompras.tsx — lista de itens com checkboxes grandes
- RegistrarFeiraModal.tsx — modal para registrar ida
```

---

### PROMPT 11 — Tela de Login + Auth

```
Crie o sistema de autenticação:

1. app/(auth)/login/page.tsx
   - Logo e nome do app no topo
   - Campo email + senha
   - Botão "Entrar" grande
   - Link "Esqueci minha senha"
   - Botão "Entrar com Magic Link" (email sem senha — mais fácil para os pais)
   - Design limpo com header #1A1A2E

2. app/(auth)/magic-link/page.tsx
   - Campo email
   - Botão enviar link
   - Mensagem de confirmação após envio

3. app/(auth)/callback/route.ts
   - Handler do OAuth callback do Supabase

4. Atualizar middleware.ts para:
   - Redirecionar / e /imoveis/* para /login se não autenticado
   - Redirecionar /login para / se já autenticado

Sem registro público — apenas o admin (você) cria contas no Supabase Dashboard.
```

---

### PROMPT 12 — PWA e Deploy

```
Configure o PWA e prepare para deploy:

1. public/manifest.json:
   - name: "Casa da Família"
   - short_name: "CasaFamília"
   - theme_color: "#1A1A2E"
   - background_color: "#F8F9FA"
   - display: "standalone"
   - orientation: "portrait"
   - icons em 72, 96, 128, 144, 152, 192, 384, 512px

2. next.config.js com next-pwa:
   - Cache de assets estáticos
   - Cache de rotas do app
   - Funcionar offline (mostrando dados em cache)

3. Crie public/icons/ com o ícone SVG do app em vários tamanhos

4. Adicione ao layout.tsx:
   - Link para o manifest
   - Meta tags: apple-mobile-web-app-capable, apple-touch-icon

5. Componente InstallPrompt.tsx:
   - Detecta se PWA pode ser instalado
   - Banner sutil no bottom
   - Botão "Instalar no celular"
   - Fecha e não aparece mais após instalar

6. Crie vercel.json com configurações de deploy

7. Crie README.md com instruções de setup:
   - Variáveis de ambiente necessárias
   - Comandos de setup do Supabase
   - Como fazer deploy no Vercel
```

---

## ETAPA 7 — Banco de Dados no Supabase

Após criar o projeto no Supabase (supabase.com):

1. Vá em **SQL Editor**
2. Cole e execute este SQL:

```sql
-- Rode no SQL Editor do Supabase

CREATE TABLE familia_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  parentesco TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  apelido TEXT,
  tipo TEXT,
  cep TEXT, logradouro TEXT, numero TEXT,
  complemento TEXT, bairro TEXT, cidade TEXT, estado TEXT,
  endereco_completo TEXT,
  sequencial TEXT,
  matricula_imovel TEXT,
  codigo_iptu TEXT,
  inscricao_imobiliaria TEXT,
  unidade_consumidora TEXT,
  cpf_conta_luz TEXT,
  distribuidora TEXT,
  matricula_agua TEXT,
  cpf_conta_agua TEXT,
  codigo_gas TEXT,
  codigo_cliente_internet TEXT,
  provedor_internet TEXT,
  observacoes TEXT,
  foto_url TEXT,
  favorito BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id UUID REFERENCES familia_membros(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  numero TEXT,
  orgao_emissor TEXT,
  data_emissao DATE,
  data_validade DATE,
  foto_frente_url TEXT,
  foto_verso_url TEXT,
  status TEXT DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  empresa TEXT,
  categoria TEXT NOT NULL,
  telefone_principal TEXT,
  telefone_secundario TEXT,
  whatsapp TEXT,
  email TEXT,
  endereco TEXT,
  relacionamento TEXT,
  imovel_id UUID REFERENCES imoveis(id) ON DELETE SET NULL,
  favorito BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  dia_semana INTEGER,
  frequencia TEXT DEFAULT 'semanal',
  horario_preferido TEXT,
  local TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  lembrete_ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feira_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feira_id UUID REFERENCES feiras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade DECIMAL(10,2),
  unidade TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feira_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feira_id UUID REFERENCES feiras(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_gasto DECIMAL(10,2),
  local TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES imoveis(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  tipo TEXT,
  valor DECIMAL(10,2),
  valor_pago DECIMAL(10,2),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia TEXT,
  codigo_barras TEXT,
  linha_digitavel TEXT,
  pix_copia_cola TEXT,
  foto_boleto_url TEXT,
  comprovante_url TEXT,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (obrigatório)
ALTER TABLE familia_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE feiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE feira_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE feira_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários autenticados acessam tudo
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'familia_membros','imoveis','documentos',
    'contatos','feiras','feira_itens','feira_historico','contas'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "auth_all" ON %I FOR ALL USING (auth.role() = ''authenticated'')', t
    );
  END LOOP;
END $$;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('imoveis', 'imoveis', false),
  ('documentos', 'documentos', false),
  ('boletos', 'boletos', false);
```

3. Adicione as variáveis ao `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

---

## ETAPA 8 — Rodar Localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## ETAPA 9 — Deploy no Vercel

```bash
# Instale a CLI do Vercel
npm install -g vercel

# Faça deploy
vercel

# Configure as env vars no painel do Vercel:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Ou conecte o repositório GitHub diretamente no vercel.com.

---

## DICAS DE USO DO CLAUDE CODE

### Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `/init` | Lê o CLAUDE.md e inicializa o contexto |
| `/mcp` | Abre painel de MCPs conectados |
| `/clear` | Limpa o contexto da conversa |
| `/cost` | Mostra quanto você gastou na sessão |

### Boas Práticas

- **Um prompt por vez** — não envie vários em sequência
- **Revise antes de aceitar** — o Claude Code pede confirmação para editar arquivos
- **Salve o que funciona** — se uma tela ficou boa, não mexa nela
- **Use `/clear` entre módulos** — libera contexto para a próxima tarefa
- **Se algo quebrar**, diga: "Algo quebrou, o erro é: [erro]. Corrija sem mudar o que já estava funcionando."

### Prompt para Corrigir Erros

```
Esse erro apareceu: [cole o erro completo]
Arquivo afetado: [nome do arquivo]
O que eu queria que funcionasse: [descreva]
Corrija sem alterar o que já estava funcionando.
```

### Prompt para Adicionar Funcionalidade

```
No módulo de [MÓDULO], adicione [FUNCIONALIDADE].
Siga exatamente o mesmo padrão de código dos outros módulos.
Use a cor [COR HEX] do módulo.
Não altere arquivos que não precisam ser modificados.
```

---

## ORDEM RECOMENDADA DE DESENVOLVIMENTO

```
Dia 1: Etapas 0-3 (instalar, configurar, criar projeto)
Dia 2: Prompts 1-4 (Tailwind, tipos, Supabase, componentes)
Dia 3: Prompts 5-7 (Stitch, layout, Home)
Dia 4: Prompt 8 (Imóveis completo — o mais importante)
Dia 5: Prompts 9-10 (Contas + Feiras)
Dia 6: Prompts 11-12 (Login + PWA + Deploy)
```

---

*Siga a ordem. Um prompt por vez. O app vai surgindo naturalmente.*
