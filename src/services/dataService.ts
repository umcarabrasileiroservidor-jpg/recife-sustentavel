// --- INTERFACES ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  balance: number; // Neon usa 'balance', não 'saldo_capivaras'
  level: string;
  last_disposal_time?: string; // Adicionado para a Home funcionar
  total_discards?: number;
}

// --- FUNÇÕES DE API ---

export async function registrarDescarte(tipo: string, multiplier: number, imagemBase64: string) {
  const session = JSON.parse(localStorage.getItem('recife_sustentavel_session') || '{}');
  const token = session.token;

  if (!token) return { success: false, msg: 'Usuário não logado' };

  try {
    const response = await fetch('/api/descarte', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: session.user.id,
        type: tipo,
        imageBase64: imagemBase64, // Agora enviamos a imagem para o backend salvar
        multiplier: multiplier
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, msg: data.error || 'Erro ao processar descarte' };
    }

    return { success: true, points: data.points };
  } catch (error) {
    console.error(error);
    return { success: false, msg: 'Erro de conexão com o servidor.' };
  }
}

export async function redeemReward(custo: number, title: string) {
  // Simulação local ou chamada de API futura
  const session = JSON.parse(localStorage.getItem('recife_sustentavel_session') || '{}');
  if (!session.user) return false;

  if (session.user.balance >= custo) {
    session.user.balance -= custo;
    localStorage.setItem('recife_sustentavel_session', JSON.stringify(session));
    return true;
  }
  return false;
}

export async function getCurrentUserProfile() {
  const session = JSON.parse(localStorage.getItem('recife_sustentavel_session') || '{}');
  if (!session.user) return null;
  
  return {
    ...session.user,
    // Garante que campos opcionais tenham valor padrão se o banco não retornar
    nivel_usuario: 'Iniciante',
    total_descartes: 0 
  } as UserProfile;
}