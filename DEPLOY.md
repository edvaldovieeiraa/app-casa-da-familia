# Deploy — Casa da Família

## 1. Supabase: criar o banco

Acesse o [Supabase Dashboard](https://supabase.com), crie um projeto e rode o SQL abaixo em **SQL Editor → New query**.

```sql
-- Habilitar extensão de UUID
create extension if not exists "uuid-ossp";

-- Membros da família
create table familia_membros (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  nome text not null,
  parentesco text,
  created_at timestamptz default now()
);
alter table familia_membros enable row level security;
create policy "owner" on familia_membros using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Imóveis
create table imoveis (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  nome text not null,
  apelido text,
  tipo text,
  endereco text,
  cep text,
  cidade text,
  estado text,
  area_m2 numeric,
  valor_venal numeric,
  valor_mercado numeric,
  numero_matricula text,
  cartorio text,
  numero_iptu text,
  data_aquisicao date,
  financiado boolean default false,
  banco_financiamento text,
  numero_contrato text,
  parcelas_total integer,
  parcelas_pagas integer,
  valor_parcela numeric,
  data_vencimento_parcela date,
  observacoes text,
  foto_url text,
  ativo boolean default true,
  created_at timestamptz default now()
);
alter table imoveis enable row level security;
create policy "owner" on imoveis using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Documentos
create table documentos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  membro_id uuid references familia_membros,
  imovel_id uuid references imoveis,
  nome text not null,
  tipo text,
  numero text,
  orgao_emissor text,
  data_emissao date,
  data_validade date,
  arquivo_url text,
  observacoes text,
  status text default 'valido',
  created_at timestamptz default now()
);
alter table documentos enable row level security;
create policy "owner" on documentos using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Contatos
create table contatos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  nome text not null,
  categoria text,
  telefone text,
  telefone2 text,
  email text,
  endereco text,
  cep text,
  cidade text,
  estado text,
  cpf_cnpj text,
  observacoes text,
  favorito boolean default false,
  foto_url text,
  created_at timestamptz default now()
);
alter table contatos enable row level security;
create policy "owner" on contatos using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Feiras
create table feiras (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  nome text not null,
  local text,
  dia_semana text,
  horario text,
  frequencia text default 'semanal',
  ativo boolean default true,
  created_at timestamptz default now()
);
alter table feiras enable row level security;
create policy "owner" on feiras using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table feira_itens (
  id uuid primary key default uuid_generate_v4(),
  feira_id uuid references feiras on delete cascade not null,
  user_id uuid references auth.users not null,
  nome text not null,
  quantidade text,
  unidade text,
  preco_estimado numeric,
  categoria text,
  checked boolean default false,
  ordem integer default 0,
  created_at timestamptz default now()
);
alter table feira_itens enable row level security;
create policy "owner" on feira_itens using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table feira_historico (
  id uuid primary key default uuid_generate_v4(),
  feira_id uuid references feiras on delete cascade not null,
  user_id uuid references auth.users not null,
  data date not null,
  total_gasto numeric,
  observacoes text,
  created_at timestamptz default now()
);
alter table feira_historico enable row level security;
create policy "owner" on feira_historico using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Contas
create table contas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  imovel_id uuid references imoveis,
  nome text not null,
  tipo text,
  valor numeric,
  dia_vencimento integer,
  data_vencimento date,
  pago boolean default false,
  data_pagamento date,
  codigo_barras text,
  linha_digitavel text,
  pix_copia_cola text,
  frequencia text default 'mensal',
  auto_renovar boolean default true,
  observacoes text,
  boleto_url text,
  status text default 'pendente',
  created_at timestamptz default now()
);
alter table contas enable row level security;
create policy "owner" on contas using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage buckets (executar via Supabase Storage ou SQL)
insert into storage.buckets (id, name, public) values ('imoveis', 'imoveis', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('documentos', 'documentos', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('boletos', 'boletos', false) on conflict do nothing;

create policy "owner_imoveis" on storage.objects for all using (bucket_id = 'imoveis' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "owner_documentos" on storage.objects for all using (bucket_id = 'documentos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "owner_boletos" on storage.objects for all using (bucket_id = 'boletos' and auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Ambos estão em **Supabase Dashboard → Project Settings → API**.

---

## 3. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Add New → Project**
2. Conecte o repositório GitHub
3. Framework: **Next.js** (detectado automaticamente)
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy**

### URL de callback do Supabase

Após o deploy, adicione a URL de produção no Supabase:

**Authentication → URL Configuration:**
- Site URL: `https://seu-app.vercel.app`
- Redirect URLs: `https://seu-app.vercel.app/callback`

---

## 4. Criar o primeiro usuário

No **Supabase Dashboard → Authentication → Users**, clique em **Add user** e preencha o e-mail e senha.

Ou habilite magic link em **Authentication → Providers → Email** e faça login pelo próprio app.

---

## 5. Ícones PWA (produção)

Os arquivos `public/icons/icon-192.png` e `public/icons/icon-512.png` são placeholders.  
Antes do lançamento, gere ícones reais a partir do `public/icons/icon.svg`:

```bash
# Com sharp instalado globalmente:
npx sharp-cli -i public/icons/icon.svg -o public/icons/icon-192.png resize 192 192
npx sharp-cli -i public/icons/icon.svg -o public/icons/icon-512.png resize 512 512
```

Ou use [pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator):
```bash
npx pwa-asset-generator public/icons/icon.svg public/icons
```
