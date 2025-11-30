// src/services/dataService.ts
// Serviço de API que usa fetch para conversar com os endpoints serverless em /api

import { toast } from 'sonner';

export type SignupPayload = {
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  telefone?: string;
};

export type LoginPayload = { email: string; senha: string };

export type DescartePayload = {
  tipo_residuo: string;
  imageBase64?: string;
  multiplicador_volume?: number;
  pontos_base?: number;
};

const API_BASE: string = '';

export async function signup(data: SignupPayload) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    if (!res.ok) {
      // tenta extrair JSON se o servidor retornou JSON, senão retorna texto
      if (contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || JSON.stringify(json));
        } catch (e) {
          throw new Error(text || 'Erro desconhecido');
        }
      }
      throw new Error(text || 'Erro desconhecido');
    }

    // retorna JSON se possível, caso contrário retorna texto bruto
    if (contentType.includes('application/json')) {
      return JSON.parse(text);
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('signup error', err);
    throw err;
  }
}

export async function login(data: LoginPayload) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        try {
          const jsonErr = JSON.parse(text);
          throw new Error(jsonErr.error || JSON.stringify(jsonErr));
        } catch {
          throw new Error(text || 'Erro desconhecido');
        }
      }
      throw new Error(text || 'Erro desconhecido');
    }

    const json = contentType.includes('application/json') ? JSON.parse(text) : (() => {
      try { return JSON.parse(text); } catch { return text as any; }
    })();
    if (json.token) localStorage.setItem('token', json.token);
    if (json.user) localStorage.setItem('user', JSON.stringify(json.user));
    return json;
  } catch (err) {
    console.error('login error', err);
    throw err;
  }
}

// Registrar Descarte — retorna { success: boolean, points: number, msg?: string }
export async function registrarDescarte(payload: DescartePayload): Promise<{ success: boolean; points?: number; msg?: string }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, msg: 'Usuário não autenticado' };

    const res = await fetch(`${API_BASE}/api/descarte`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    
    if (!res.ok) {
      let errorMsg = 'Erro ao processar descarte';
      if (contentType.includes('application/json')) {
        try {
          const jsonErr = JSON.parse(text);
          errorMsg = jsonErr.error || errorMsg;
        } catch {
          errorMsg = text || errorMsg;
        }
      }
      return { success: false, msg: errorMsg };
    }

    const jsonData = contentType.includes('application/json') ? JSON.parse(text) : (() => {
      try { return JSON.parse(text); } catch { return text; }
    })();
    
    return { success: true, points: jsonData.points || jsonData.descarte?.pontos_ganhos || 0 };
  } catch (err) {
    console.error('registrarDescarte error', err);
    return { success: false, msg: (err as Error).message || 'Erro de conexão' };
  }
}

export async function getCurrentUserProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    }
    const res = await fetch(`${API_BASE}/api/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        try {
          const jsonErr = JSON.parse(text);
          throw new Error(jsonErr.error || JSON.stringify(jsonErr));
        } catch {
          throw new Error(text || 'Erro desconhecido');
        }
      }
      throw new Error(text || 'Erro desconhecido');
    }
    const json = contentType.includes('application/json') ? JSON.parse(text) : (() => { try { return JSON.parse(text); } catch { return text as any; } })();
    if (json.user) localStorage.setItem('user', JSON.stringify(json.user));
    return json.user;
  } catch (err) {
    console.error('getCurrentUserProfile error', err);
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  saldo_pontos: number;
  nivel_usuario?: string;
  ultimo_descarte?: string | null;
  total_descartes?: number;
}

// Resgatar recompensa — usado por src/components/mobile/Rewards.tsx
export async function resgatarRecompensa(custo: number, titulo: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Usuário não autenticado');
      return false;
    }

    const res = await fetch(`${API_BASE}/api/recompensa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ cost: custo, title: titulo })
    });

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (!res.ok) {
      let errorMsg = 'Erro ao resgatar recompensa';
      if (contentType.includes('application/json')) {
        try {
          const jsonErr = JSON.parse(text);
          errorMsg = jsonErr.error || errorMsg;
        } catch {
          errorMsg = text || errorMsg;
        }
      }
      toast.error(errorMsg);
      return false;
    }

    toast.success(`${titulo} resgatado com sucesso! 🎉`);
    return true;
  } catch (err) {
    console.error('resgatarRecompensa error', err);
    toast.error('Erro ao resgatar recompensa');
    return false;
  }
}