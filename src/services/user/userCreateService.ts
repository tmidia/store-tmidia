import { supabase } from '@/integrations/supabase/client';
import type { UserFormData } from '@/types/user';
import { capitalizeWords } from '@/utils/userUtils';
import { validateEmail, validatePassword, validateUsername, validateName, validateCPF, sanitizeInput } from '@/utils/inputValidation';
import { createClient } from '@supabase/supabase-js';

export const createUser = async (formData: UserFormData): Promise<void> => {
  // Validate and sanitize inputs
  const sanitizedEmail = sanitizeInput(formData.email);
  const sanitizedUsername = sanitizeInput(formData.username);
  const sanitizedFullName = sanitizeInput(formData.full_name);
  const sanitizedPassword = sanitizeInput(formData.password);
  const sanitizedCPF = sanitizeInput(formData.cpf);
  
  // Validate inputs
  if (!validateEmail(sanitizedEmail)) {
    throw new Error('Email inválido');
  }
  
  const usernameValidation = validateUsername(sanitizedUsername);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.message);
  }
  
  const nameValidation = validateName(sanitizedFullName);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.message);
  }
  
  const passwordValidation = validatePassword(sanitizedPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message);
  }

  // Validar CPF se fornecido
  if (sanitizedCPF) {
    const cpfValidation = validateCPF(sanitizedCPF);
    if (!cpfValidation.isValid) {
      throw new Error(cpfValidation.message);
    }

    // Verificar se CPF já existe
    const { data: existingCPF } = await supabase
      .from('profiles')
      .select('id')
      .eq('cpf', sanitizedCPF)
      .single();

    if (existingCPF) {
      throw new Error('CPF já cadastrado no sistema');
    }
  }

  const capitalizedName = capitalizeWords(sanitizedFullName);

  console.log('Iniciando criação de usuário:', { email: sanitizedEmail, username: sanitizedUsername });

  // Criar um cliente temporário para não deslogar o administrador atual
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não encontradas');
  }

  const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  });

  // Usar o cliente temporário para criar o usuário
  const { data: signUpData, error: signUpError } = await tempSupabase.auth.signUp({
    email: sanitizedEmail,
    password: sanitizedPassword,
    options: {
      data: {
        username: sanitizedUsername,
        full_name: capitalizedName,
        user_type: formData.user_type,
        cpf: sanitizedCPF
      }
    }
  });

  if (signUpError) {
    console.error('Erro ao criar usuário:', signUpError);
    throw new Error(signUpError.message);
  }

  if (!signUpData.user) {
    throw new Error('Falha ao criar usuário');
  }

  console.log('Usuário criado:', signUpData.user.id);

  try {
    // Aguardar um pouco para o trigger criar o perfil automaticamente
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Usar o cliente principal (administrador) para as próximas operações
    // Verificar se o perfil foi criado automaticamente, se não, criar manualmente
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', signUpData.user.id)
      .single();

    if (!existingProfile) {
      // Criar o perfil manualmente se não foi criado automaticamente
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          username: sanitizedUsername,
          full_name: capitalizedName,
          user_type: formData.user_type,
          cpf: sanitizedCPF,
          is_active: true
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw new Error('Erro ao criar perfil do usuário');
      }
    } else {
      // Atualizar o perfil existente com os dados corretos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: sanitizedUsername,
          full_name: capitalizedName,
          user_type: formData.user_type,
          cpf: sanitizedCPF,
          is_active: true
        })
        .eq('id', signUpData.user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw new Error('Erro ao atualizar perfil do usuário');
      }
    }

    console.log('Perfil criado/atualizado com sucesso');

    // Atualizar o papel (role) do usuário na tabela user_roles
    if (formData.user_type && formData.user_type !== 'vendedor') {
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.user_type as any })
        .eq('user_id', signUpData.user.id);

      if (roleError) {
        console.error('Erro ao atualizar role:', roleError);
        // Tentar upsert caso não exista
        await supabase
          .from('user_roles')
          .upsert({ user_id: signUpData.user.id, role: formData.user_type as any });
      } else {
        console.log('Role atualizada com sucesso para:', formData.user_type);
      }
    }

    // Criar permissões se especificadas
    if (formData.permissions && formData.permissions.length > 0) {
      const permissions = formData.permissions.map(module => ({
        user_id: signUpData.user.id,
        module: module as any
      }));

      const { error: permissionsError } = await supabase
        .from('user_permissions')
        .insert(permissions);

      if (permissionsError) {
        console.error('Erro ao criar permissões:', permissionsError);
        throw new Error('Erro ao salvar as permissões do usuário');
      } else {
        console.log('Permissões criadas com sucesso');
      }
    }
  } catch (error) {
    console.error('Erro no processo de criação:', error);
    throw error;
  }
};
