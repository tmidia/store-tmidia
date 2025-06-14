
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
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Nome de usuário deve conter apenas letras, números e underscore' };
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
