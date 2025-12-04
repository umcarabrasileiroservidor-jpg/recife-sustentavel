import { toast } from "sonner";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  saldo_pontos: number;
  nivel_usuario: string;
  ultimo_descarte?: string;
  total_descartes?: number;
}

// --- CLIENTE HTTP BLINDADO ---
async function apiRequest(endpoint: string, method: string = 'GET', body?: any) {
  const sessionStr = localStorage.getItem('recife_sustentavel_session');
  const session = sessionStr ? JSON.parse(sessionStr) : {};
  
  const headers: any = { 'Content-Type': 'application/json' };
  if (session.token) headers['Authorization'] = `Bearer ${session.token}`;

  try {
    const res = await fetch(endpoint, {
      method,
      headers,
      // DELETE não envia body, os dados vão na URL
      body: method !== 'DELETE' && body ? JSON.stringify(body) : undefined
    });
    
    // Tratamento específico para TOKEN INVÁLIDO
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }

    // DELETE com sucesso geralmente não retorna JSON
    if (method === 'DELETE' && res.ok) return true;

    const data = await res.json().catch(() => null);
    
    if (!res.ok) {
      console.error(`Erro API (${endpoint}):`, data?.error);
      return null;
    }
    
    return data;
  } catch (error: any) {
    if (error.message === 'Unauthorized') throw error; // Repassa o erro fatal
    console.error(`Erro de conexão (${endpoint}):`, error);
    return null;
  }
}

// --- USUÁRIO (Sessão protegida) ---

export async function getCurrentUserProfile() {
  const sessionStr = localStorage.getItem('recife_sustentavel_session');
  if (!sessionStr) return null;
  
  const session = JSON.parse(sessionStr);
  if (!session.user || !session.token) return null;

  try {
    const res = await apiRequest('/api/me');
    if (res?.user) {
      // Sucesso: Atualiza os dados
      session.user = { ...session.user, ...res.user };
      localStorage.setItem('recife_sustentavel_session', JSON.stringify(session));
    }
  } catch (e: any) {
    // CRÍTICO: Só desloga se o erro for realmente de AUTORIZAÇÃO
    if (e.message === 'Unauthorized') {
      console.warn("Sessão expirada. Fazendo logout.");
      localStorage.removeItem('recife_sustentavel_session');
      return null;
    }
    // Se for outro erro (rede, server down), mantém a sessão local para não chutar o usuário
    console.log("Usando cache local devido a erro momentâneo");
  }

  return session.user as UserProfile;
}

// --- AÇÕES ---

export async function registrarDescarte(tipo: string, multiplier: number, imageBase64: string) {
  const res = await apiRequest('/api/descarte', 'POST', { 
    tipo_residuo: tipo, 
    imageBase64, 
    multiplicador_volume: multiplier 
  });
  return res ? { success: true, points: res.points } : { success: false, msg: 'Erro ao enviar' };
}

export async function resgatarRecompensa(custo: number, titulo: string) {
  const sessionStr = localStorage.getItem('recife_sustentavel_session');
  if (!sessionStr) return false;
  const session = JSON.parse(sessionStr);

  const res = await apiRequest('/api/recompensa', 'POST', { 
    userId: session.user.id, 
    cost: custo, 
    title: titulo 
  });
  
  if (res && session.user) {
    session.user.saldo_pontos -= custo;
    localStorage.setItem('recife_sustentavel_session', JSON.stringify(session));
    return true;
  }
  return false;
}

// --- LEITURA ---
export const getLixeiras = () => apiRequest('/api/lixeiras').then(r => r || []);
export const getRecompensas = () => apiRequest('/api/recompensas-lista').then(r => r || []);
export const getTransacoes = () => apiRequest('/api/transacoes').then(r => r || []);
export const getHistorico = () => apiRequest('/api/historico').then(r => r || []);
export const getPenalidades = () => apiRequest('/api/penalidades').then(r => r || []);
export const getAuditoriaPendentes = () => apiRequest('/api/admin/auditoria').then(r => r || []);

export const getDashboardData = async () => {
  const hist = await getHistorico();
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0,0,0,0);
  return { weeklyProgress: hist.filter((d: any) => new Date(d.criado_em) >= startOfWeek).length };
};

// --- ADMIN (CORRIGIDO: DELETE VIA URL) ---

export const getAdminDashboardStats = () => apiRequest('/api/admin/dashboard');
export const getAdminUsers = () => apiRequest('/api/admin/users').then(r => r || []);
export const updateAdminUserStatus = (id: string, status: string) => apiRequest('/api/admin/users', 'PUT', { id, status });

// CORREÇÃO: Passando ID na URL (?id=...)
export const deleteAdminUser = (id: string) => apiRequest(`/api/admin/users?id=${id}`, 'DELETE');

export const getAdminBins = () => apiRequest('/api/admin/bins').then(r => r || []);
export const createAdminBin = (data: any) => apiRequest('/api/admin/bins', 'POST', data);
export const updateAdminBin = (data: any) => apiRequest('/api/admin/bins', 'PUT', data);
export const deleteAdminBin = (id: string) => apiRequest(`/api/admin/bins?id=${id}`, 'DELETE');

export const getAdminRewards = () => apiRequest('/api/admin/rewards').then(r => r || []);
export const createAdminReward = (data: any) => apiRequest('/api/admin/rewards', 'POST', data);
export const updateAdminReward = (data: any) => apiRequest('/api/admin/rewards', 'PUT', data);
export const deleteAdminReward = (id: string) => apiRequest(`/api/admin/rewards?id=${id}`, 'DELETE');

export const getAdminPenalties = () => apiRequest('/api/admin/penalties').then(r => r || []);
export const processarAuditoria = (id: string, status: string, pontos: number) => apiRequest('/api/admin/auditoria', 'POST', { id, status, pontos });
export const getAdminReports = (periodo: string) => apiRequest(`/api/admin/reports?periodo=${periodo}`).then(r => r || null);
// --- ADMIN: PENALIDADES (Adicionado agora) ---


export const createAdminPenalty = (data: any) => apiRequest('/api/admin/penalties', 'POST', data);

// Deletar via URL para evitar erro de body
export const deleteAdminPenalty = (id: string) => apiRequest(`/api/admin/penalties?id=${id}`, 'DELETE');