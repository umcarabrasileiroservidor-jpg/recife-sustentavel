import { toast } from 'sonner';

// Chaves do LocalStorage
const DB_KEY = 'recife_sustentavel_db';

// Tipos para nossos dados reais
export interface Transaction {
  id: string;
  type: 'ganho' | 'resgate';
  description: string;
  value: number;
  date: string; // ISO String
}

export interface UserDB {
  balance: number;
  lastDisposalTime: number | null; // Timestamp
  totalDisposals: number;
  level: string;
  history: Transaction[];
  settings: {
    notifications: boolean;
  };
}

// Estado inicial padrão (Zero, não fake)
const INITIAL_STATE: UserDB = {
  balance: 0, // Começa com 0 (ou 50 de bônus de cadastro se quiser)
  lastDisposalTime: null,
  totalDisposals: 0,
  level: 'Iniciante',
  history: [],
  settings: { notifications: true }
};

// --- FUNÇÕES DE BANCO DE DADOS ---

export function getDatabase(): UserDB {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    // Se não existir, cria o inicial
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_STATE));
    return INITIAL_STATE;
  }
  return JSON.parse(data);
}

export function saveDatabase(data: UserDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  // Dispara evento para atualizar telas em tempo real
  window.dispatchEvent(new Event('storage-update'));
}

// Lógica de Nível Dinâmico (Gamificação Real)
function calculateLevel(disposals: number): string {
  if (disposals >= 100) return 'Eco-Lenda';
  if (disposals >= 50) return 'Eco-Herói';
  if (disposals >= 20) return 'Guardião';
  if (disposals >= 5) return 'Consciente';
  return 'Iniciante';
}

// Adicionar Pontos (Chamado pelo Scanner)
export function addPoints(amount: number, type: string) {
  const db = getDatabase();
  
  db.balance += amount;
  db.totalDisposals += 1;
  db.lastDisposalTime = Date.now();
  db.level = calculateLevel(db.totalDisposals);
  
  db.history.unshift({
    id: crypto.randomUUID(),
    type: 'ganho',
    description: `Descarte: ${type}`,
    value: amount,
    date: new Date().toISOString()
  });

  saveDatabase(db);
}

// Resgatar Prêmio (Chamado pelo Rewards)
export function redeemReward(cost: number, title: string): boolean {
  const db = getDatabase();
  
  if (db.balance < cost) {
    return false; // Saldo insuficiente
  }

  db.balance -= cost;
  db.history.unshift({
    id: crypto.randomUUID(),
    type: 'resgate',
    description: `Resgate: ${title}`,
    value: cost,
    date: new Date().toISOString()
  });

  saveDatabase(db);
  return true;
}

// Checagem de 24h (Matemática)
export function checkAvailability(): { available: boolean; timeLeft: string } {
  const db = getDatabase();
  if (!db.lastDisposalTime) return { available: true, timeLeft: '' };

  const now = Date.now();
  const diffHours = (now - db.lastDisposalTime) / (1000 * 60 * 60);

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

// Estatísticas Reais para a Home
export function getWeeklyStats() {
  const db = getDatabase();
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Domingo
  startOfWeek.setHours(0,0,0,0);

  const thisWeekCount = db.history.filter(t => 
    t.type === 'ganho' && new Date(t.date) >= startOfWeek
  ).length;

  return {
    weekly: thisWeekCount,
    total: db.totalDisposals,
    level: db.level,
    balance: db.balance,
    recent: db.history.slice(0, 3) // Últimos 3 itens
  };
}