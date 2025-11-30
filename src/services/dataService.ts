import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

// --- INTERFACES ---

export interface UserProfile {
  id_usuario: number;
  uuid: string;
  nome: string;
  email: string;
  cpf: string;        // Adicionado para corrigir erro do Profile
  telefone?: string;
  saldo_capivaras: number;
  nivel_penalidade: number;
  status_conta: string;
  nivel_usuario: string;
  total_descartes: number;
}

export interface Transaction {
  id_transacao: number;
  tipo: 'ganho' | 'resgate';
  valor: number;
  descricao: string;
  data_hora: string;
}

// --- FUNÇÕES DO PERFIL ---

export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('uuid', user.id)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  return data as UserProfile;
}

// --- FUNÇÕES DA HOME (DASHBOARD) ---

export async function getDashboardData() {
  const userProfile = await getCurrentUserProfile();
  if (!userProfile) return null;

  // Busca histórico recente
  const { data: history } = await supabase
    .from('transacao')
    .select('*')
    .eq('id_usuario', userProfile.id_usuario)
    .order('data_hora', { ascending: false })
    .limit(5);

  // Busca último descarte válido para a regra de 24h
  const { data: lastDisposal } = await supabase
    .from('descarte')
    .select('data_hora')
    .eq('id_usuario', userProfile.id_usuario)
    .eq('valido', true)
    .order('data_hora', { ascending: false })
    .limit(1)
    .single();

  // Calcula progresso semanal
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Segunda-feira
  firstDay.setHours(0, 0, 0, 0);

  const { count: weeklyCount } = await supabase
    .from('descarte')
    .select('*', { count: 'exact', head: true })
    .eq('id_usuario', userProfile.id_usuario)
    .eq('valido', true)
    .gte('data_hora', firstDay.toISOString());

  return {
    user: userProfile,
    history: (history || []) as Transaction[],
    lastDisposalTime: lastDisposal?.data_hora || null,
    weeklyProgress: weeklyCount || 0
  };
}

// --- FUNÇÕES DO SCANNER (REGISTRAR DESCARTE) ---

export async function registrarDescarte(tipo: string, volumeMultiplier: number) {
  const user = await getCurrentUserProfile();
  if (!user) return { success: false, msg: 'Usuário não logado' };

  // Validação de 24h (Double Check no Backend)
  const { data: ultimoDescarte } = await supabase
    .from('descarte')
    .select('data_hora')
    .eq('id_usuario', user.id_usuario)
    .eq('valido', true)
    .order('data_hora', { ascending: false })
    .limit(1)
    .single();

  if (ultimoDescarte) {
    const status = calculateTimeLeft(ultimoDescarte.data_hora);
    if (!status.available) {
      return { success: false, msg: `Limite diário! Volte em ${status.timeLeft}.` };
    }
  }

  // Calcula pontos
  const pontosBase = 20;
  const pontosFinais = Math.round(pontosBase * volumeMultiplier);

  // Insere no banco
  const { error } = await supabase
    .from('descarte')
    .insert({
      id_usuario: user.id_usuario,
      tipo_residuo: tipo.toLowerCase(),
      valido: true,
      capivaras_geradas: pontosFinais,
      confianca_ia: 98.5,
      peso_estimado: volumeMultiplier * 0.5,
      imagem_registro: 'validado_ia'
    });

  if (error) {
    console.error('Erro ao salvar descarte:', error);
    return { success: false, msg: 'Erro ao salvar no banco.' };
  }

  return { success: true, points: pontosFinais };
}

// --- FUNÇÕES DE RECOMPENSA ---

export async function resgatarRecompensa(custo: number, titulo: string) {
  const user = await getCurrentUserProfile();
  if (!user) return false;

  if (user.saldo_capivaras < custo) {
    toast.error("Saldo insuficiente.");
    return false;
  }

  const { error } = await supabase
    .from('transacao')
    .insert({
      id_usuario: user.id_usuario,
      tipo: 'resgate',
      valor: -custo,
      saldo_anterior: user.saldo_capivaras,
      saldo_novo: user.saldo_capivaras - custo,
      descricao: `Resgate: ${titulo}`
    });

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

// --- UTILITÁRIOS ---

export function calculateTimeLeft(lastDateISO: string | null) {
  if (!lastDateISO) return { available: true, timeLeft: '' };

  const lastTime = new Date(lastDateISO).getTime();
  const now = Date.now();
  // Ajuste de fuso horário se necessário, mas timestamps ISO costumam ser UTC
  const diffHours = (now - lastTime) / (1000 * 60 * 60);

  if (diffHours >= 24) {
    return { available: true, timeLeft: '' };
  }

  const hoursLeft = Math.floor(24 - diffHours);
  const minutesLeft = Math.floor(((24 - diffHours) - hoursLeft) * 60);

  return { 
    available: false, 
    timeLeft: `${hoursLeft}h ${minutesLeft}m` 
  };
}