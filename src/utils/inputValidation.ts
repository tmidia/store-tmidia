// Input validation and sanitization utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número' };
  }
  return { isValid: true, message: 'Senha válida' };
};

export const validateUsername = (username: string): { isValid: boolean; message: string } => {
  if (username.length < 3) {
    return { isValid: false, message: 'Nome de usuário deve ter pelo menos 3 caracteres' };
  }
  if (!/^[a-zA-Z0-9_.\-]+$/.test(username)) {
    return { isValid: false, message: 'Nome de usuário deve conter apenas letras, números, underscore, ponto ou hífen' };
  }
  return { isValid: true, message: 'Nome de usuário válido' };
};

export const validateName = (name: string): { isValid: boolean; message: string } => {
  if (name.length < 2) {
    return { isValid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
  }
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    return { isValid: false, message: 'Nome deve conter apenas letras e espaços' };
  }
  return { isValid: true, message: 'Nome válido' };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateNumericInput = (value: string, min?: number, max?: number): { isValid: boolean; message: string } => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Valor deve ser numérico' };
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, message: `Valor deve ser maior ou igual a ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, message: `Valor deve ser menor ou igual a ${max}` };
  }
  
  return { isValid: true, message: 'Valor válido' };
};

export const validateCPF = (cpf: string): { isValid: boolean; message: string } => {
  // Remove dots, hyphens and spaces
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) {
    return { isValid: false, message: 'CPF deve ter 11 dígitos' };
  }
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { isValid: false, message: 'CPF inválido' };
  }
  
  // Validate CPF algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return { isValid: false, message: 'CPF inválido' };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return { isValid: false, message: 'CPF inválido' };
  }
  
  return { isValid: true, message: 'CPF válido' };
};

export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
