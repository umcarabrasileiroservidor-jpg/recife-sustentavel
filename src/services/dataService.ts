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

// --- CLIENTE HTTP "X-RAY" (Mostra o erro na tela) ---
async function apiRequest(endpoint: string, method: string = 'GET', body?: any) {
  const sessionStr = localStorage.getItem('recife_sustentavel_session');
  const session = sessionStr ? JSON.parse(sessionStr) : {};
  
  const headers: any = { 'Content-Type': 'application/json' };
  if (session.token) headers['Authorization'] = `Bearer ${session.token}`;

  try {
    // Tenta fazer a requisição
    const res = await fetch(endpoint, {
      method,
      headers,
      body: method !== 'DELETE' && body ? JSON.stringify(body) : undefined
    });
    
    // Se for 401 (Sessão caiu), avisa e sai
    if (res.status === 401) {
       toast.error("Sessão expirada. Entre novamente.");
       localStorage.removeItem('recife_sustentavel_session');
       // Pequeno delay para o usuário ler antes de recarregar
       setTimeout(() => window.location.reload(), 2000);
       return null;
    }

    // Se for DELETE e deu certo
    if (method === 'DELETE' && res.ok) return true;

    // Tenta ler o JSON da resposta
    const data = await res.json().catch(() => null);
    
    // Se a API deu erro (404, 500, 400...)
    if (!res.ok) {
      const msg = data?.error || res.statusText;
      // AQUI ESTÁ O TRUQUE: Mostra o erro na tela do celular!
      toast.error(`Erro (${res.status}): ${msg}`);
      console.error(`Erro API (${endpoint}):`, msg);
      return null;
    }
    
    return data;

  } catch (error: any) {
    // Se for erro de internet/rede
    toast.error(`Erro de Conexão: ${error.message}`);
    return null;
  }
}

// --- USUÁRIO ---
export async function getCurrentUserProfile() {
  const res = await apiRequest('/api/me');
  if (res?.user) {
    const s = JSON.parse(localStorage.getItem('recife_sustentavel_session') || '{}');
    s.user = { ...s.user, ...res.user };
    localStorage.setItem('recife_sustentavel_session', JSON.stringify(s));
    return s.user as UserProfile;
  }
  return null;
}

// --- AÇÕES MOBILE ---
export const registrarDescarte = (t: string, m: number, img: string) => 
  apiRequest('/api/descarte', 'POST', { tipo_residuo: t, imageBase64: img, multiplicador_volume: m })
  .then(r => r ? { success: true, points: r.points } : { success: false, msg: 'Erro no envio' });

export const resgatarRecompensa = (c: number, t: string) => {
    const s = JSON.parse(localStorage.getItem('recife_sustentavel_session') || '{}');
    return apiRequest('/api/recompensa', 'POST', { userId: s.user.id, cost: c, title: t }).then(r => !!r);
}

// --- LEITURA MOBILE ---
export const getLixeiras = () => apiRequest('/api/user-api?type=lixeiras').then(r => r || []);
export const getRecompensas = () => apiRequest('/api/user-api?type=recompensas').then(r => r || []);
export const getTransacoes = () => apiRequest('/api/user-api?type=transacoes').then(r => r || []);
export const getHistorico = () => apiRequest('/api/user-api?type=historico').then(r => r || []);
export const getPenalidades = () => apiRequest('/api/user-api?type=penalidades').then(r => r || []);
export const getDashboardData = async () => {
  const h = await getHistorico();
  return { weeklyProgress: h ? h.length : 0 };
};

// --- ADMIN (TODAS AS ROTAS UNIFICADAS) ---
export const getAdminDashboardStats = () => apiRequest('/api/admin-api?type=dashboard');
export const getAdminUsers = () => apiRequest('/api/admin-api?type=users').then(r => r || []);
export const updateAdminUserStatus = (id: string, s: string) => apiRequest('/api/admin-api?type=users', 'PUT', { id, status: s });
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