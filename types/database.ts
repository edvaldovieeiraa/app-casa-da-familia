export interface FamiliaMembro {
  id: string;
  user_id: string;
  nome: string;
  apelido: string | null;
  parentesco: string | null;
  data_nascimento: string | null;
  cpf: string | null;
  rg: string | null;
  telefone: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}

export type PetEventoTipo = 'vacina' | 'banho' | 'tosa' | 'medicamento' | 'consulta' | 'outro';

export interface Pet {
  id: string;
  user_id: string;
  nome: string;
  especie: string | null;
  raca: string | null;
  data_nascimento: string | null;
  sexo: 'macho' | 'femea' | null;
  cor: string | null;
  foto_url: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
}

export interface PetEvento {
  id: string;
  pet_id: string;
  user_id: string;
  tipo: PetEventoTipo;
  descricao: string | null;
  data_evento: string;
  proxima_data: string | null;
  valor: number | null;
  local: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface Imovel {
  id: string;
  nome: string;
  apelido: string | null;
  tipo: string | null;
  /* Endereço */
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  endereco_completo: string | null;
  /* Documentação */
  sequencial: string | null;
  matricula_imovel: string | null;
  codigo_iptu: string | null;
  inscricao_imobiliaria: string | null;
  /* Energia */
  unidade_consumidora: string | null;
  cpf_conta_luz: string | null;
  distribuidora: string | null;
  /* Água */
  matricula_agua: string | null;
  cpf_conta_agua: string | null;
  /* Gás */
  codigo_gas: string | null;
  /* Internet */
  codigo_cliente_internet: string | null;
  provedor_internet: string | null;
  /* Outros */
  observacoes: string | null;
  foto_url: string | null;
  favorito: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentoStatus = 'ativo' | 'vencido' | 'cancelado';

export interface Documento {
  id: string;
  membro_id: string | null;
  tipo: string;
  numero: string | null;
  orgao_emissor: string | null;
  data_emissao: string | null;
  data_validade: string | null;
  foto_frente_url: string | null;
  foto_verso_url: string | null;
  status: DocumentoStatus;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contato {
  id: string;
  nome: string;
  empresa: string | null;
  categoria: string;
  telefone_principal: string | null;
  telefone_secundario: string | null;
  whatsapp: string | null;
  email: string | null;
  endereco: string | null;
  relacionamento: string | null;
  imovel_id: string | null;
  favorito: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type FrequenciaFeira = 'semanal' | 'quinzenal' | 'mensal';

export interface Feira {
  id: string;
  nome: string;
  tipo: string;
  dia_semana: DiaSemana | null;
  frequencia: FrequenciaFeira;
  horario_preferido: string | null;
  local: string | null;
  ativo: boolean;
  lembrete_ativo: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeiraItem {
  id: string;
  feira_id: string;
  nome: string;
  quantidade: number | null;
  unidade: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface FeiraHistorico {
  id: string;
  feira_id: string;
  data: string;
  valor_gasto: number | null;
  local: string | null;
  observacoes: string | null;
  created_at: string;
}

export type ContaStatus = 'pendente' | 'pago' | 'vencido';
export type ContaTipo =
  | 'luz'
  | 'agua'
  | 'gas'
  | 'internet'
  | 'iptu'
  | 'condominio'
  | 'seguro'
  | 'outro';
export type FrequenciaConta = 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';

export interface Conta {
  id: string;
  imovel_id: string | null;
  descricao: string;
  tipo: ContaTipo | null;
  valor: number | null;
  valor_pago: number | null;
  data_vencimento: string;
  data_pagamento: string | null;
  recorrente: boolean;
  frequencia: FrequenciaConta | null;
  codigo_barras: string | null;
  linha_digitavel: string | null;
  pix_copia_cola: string | null;
  foto_boleto_url: string | null;
  comprovante_url: string | null;
  status: ContaStatus;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcessoSistema {
  id: string;
  imovel_id: string | null;
  descricao: string;
  url: string | null;
  login: string | null;
  senha: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}
