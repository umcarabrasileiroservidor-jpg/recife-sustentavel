// src/services/dataService.ts
// Serviço de API que usa fetch para conversar com os endpoints serverless em /api

export type SignupPayload = {
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  telefone?: string;
};

export type LoginPayload = { email: string; senha: string };

export type DescartePayload = {
  type: string;
  imageBase64: string;
  multiplier?: number;
};

const API_BASE: string = '';

export async function signup(data: SignupPayload) {
  try {
    const res = await fetch(`${API_BASE}/api/signup`, {
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
    const res = await fetch(`${API_BASE}/api/login`, {
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

export async function registrarDescarte(payload: DescartePayload) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuário não autenticado');

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

    if (contentType.includes('application/json')) {
      return JSON.parse(text);
    }
    try { return JSON.parse(text); } catch { return text; }
  } catch (err) {
    console.error('registrarDescarte error', err);
    throw err;
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
    if (!token) throw new Error('Usuário não autenticado');

    const res = await fetch(`${API_BASE}/api/recompensa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ cost: custo, title: titulo })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Erro ao resgatar recompensa:', text);
      return false;
    }

    return true;
  } catch (err) {
    console.error('resgatarRecompensa error', err);
    return false;
  }
}