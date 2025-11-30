export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const unformatCPF = (value: string) => {
  return value.replace(/\D/g, '');
};

export const unformatPhone = (value: string) => {
  return value.replace(/\D/g, '');
};

// --- NOVA FUNÇÃO: Validação Matemática de CPF ---
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]+/g, '');

  if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) {
    return false;
  }

  const cpfArray = cleanCPF.split('').map(el => +el);
  const rest = (count: number) => (cpfArray.slice(0, count - 12)
    .reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11 % 10;

  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
};