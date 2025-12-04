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
      body: method !== 'DELETE' && body ? JSON.stringify(body) : undefined
    });
    
    if (res.status === 401) throw new Error('Unauthorized');
    if (method === 'DELETE' && res.ok) return true;

    const data = await res.json().catch(() => null);
    
    if (!res.ok) {
      console.error(`Erro API (${endpoint}):`, data?.error);
      return null;
    }
    return data;
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
       localStorage.removeItem('recife_sustentavel_session');
       window.location.reload();
    }
    return null;
  }
}

// --- USUÁRIO ---
export async function getCurrentUserProfile() {
  const res = await apiRequest('/api/me');
  return res?.user as UserProfile || null;
}

// --- LEITURA ---
export const getLixeiras = () => apiRequest('/api/user-api?type=lixeiras').then(r => r || []);
export const getRecompensas = () => apiRequest('/api/user-api?type=recompensas').then(r => r || []);
export const getTransacoes = () => apiRequest('/api/user-api?type=transacoes').then(r => r || []);
export const getHistorico = () => apiRequest('/api/user-api?type=historico').then(r => r || []);
export const getPenalidades = () => apiRequest('/api/user-api?type=penalidades').then(r => r || []);

export const getDashboardData = async () => {
  const hist = await getHistorico();
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0,0,0,0);
  return { weeklyProgress: (hist || []).filter((d: any) => new Date(d.criado_em) >= startOfWeek).length };
};

// --- AÇÕES ---
export const registrarDescarte = (tipo: string, multiplier: number, imageBase64: string) => 
  apiRequest('/api/descarte', 'POST', { tipo_residuo: tipo, imageBase64, multiplicador_volume: multiplier })
  .then(r => r ? { success: true, points: r.points } : { success: false, msg: 'Erro' });

export const resgatarRecompensa = (custo: number, title: string) => {
    const s = JSON.parse(localStorage.getItem('recife_sustentavel_session') || '{}');
    return apiRequest('/api/recompensa', 'POST', { userId: s.user.id, cost: custo, title })
      .then(r => {
          if(r && s.user) {
             s.user.saldo_pontos -= custo;
             localStorage.setItem('recife_sustentavel_session', JSON.stringify(s));
          }
          return !!r;
      });
}

// --- ADMIN ---
// AQUI ESTAVA O ERRO DA AUDITORIA! AGORA APONTA PARA admin-api
export const getAdminDashboardStats = () => apiRequest('/api/admin-api?type=dashboard');
export const getAdminUsers = () => apiRequest('/api/admin-api?type=users').then(r => r || []);
export const updateAdminUserStatus = (id: string, status: string) => apiRequest('/api/admin-api?type=users', 'PUT', { id, status });
export const deleteAdminUser = (id: string) => apiRequest(`/api/admin-api?type=users&id=${id}`, 'DELETE');

export const getAdminBins = () => apiRequest('/api/admin-api?type=bins').then(r => r || []);
export const createAdminBin = (d: any) => apiRequest('/api/admin-api?type=bins', 'POST', d);
export const updateAdminBin = (d: any) => apiRequest('/api/admin-api?type=bins', 'PUT', d);
export const deleteAdminBin = (id: string) => apiRequest(`/api/admin-api?type=bins&id=${id}`, 'DELETE');

export const getAdminRewards = () => apiRequest('/api/admin-api?type=rewards').then(r => r || []);
export const createAdminReward = (d: any) => apiRequest('/api/admin-api?type=rewards', 'POST', d);
export const updateAdminReward = (d: any) => apiRequest('/api/admin-api?type=rewards', 'PUT', d);
export const deleteAdminReward = (id: string) => apiRequest(`/api/admin-api?type=rewards&id=${id}`, 'DELETE');

export const getAdminPenalties = () => apiRequest('/api/admin-api?type=penalties').then(r => r || []);
export const createAdminPenalty = (d: any) => apiRequest('/api/admin-api?type=penalties', 'POST', d);
export const deleteAdminPenalty = (id: string) => apiRequest(`/api/admin-api?type=penalties&id=${id}`, 'DELETE');

export const getAuditoriaPendentes = () => apiRequest('/api/admin-api?type=auditoria').then(r => r || []);
export const processarAuditoria = (id: string, s: string, p: number) => apiRequest('/api/admin-api?type=auditoria', 'POST', { id, status: s, pontos: p });
export const getAdminReports = (p: string) => apiRequest(`/api/admin-api?type=reports&periodo=${p}`).then(r => r || null);