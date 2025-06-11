
export const getUserErrorMessage = (error: any): string => {
  console.error('Erro detalhado:', error);
  
  if (error.message.includes('User already registered')) {
    return "Este email já está cadastrado no sistema.";
  } else if (error.message.includes('invalid email')) {
    return "Por favor, insira um email válido.";
  } else if (error.message.includes('password')) {
    return "A senha deve ter pelo menos 6 caracteres.";
  } else if (error.message.includes('Username should be') || error.message.includes('unique')) {
    return "Este nome de usuário já existe. Escolha outro.";
  } else if (error.message.includes('duplicate key')) {
    return "Este usuário já existe no sistema.";
  } else if (error.message.includes('violates row-level security policy')) {
    return "Erro de permissão. Verifique se você tem autorização para esta operação.";
  } else if (error.message.includes('not authenticated')) {
    return "Você precisa estar logado para realizar esta operação.";
  } else if (error.message.includes('network')) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }
  
  return "Erro ao salvar usuário. Tente novamente.";
};
