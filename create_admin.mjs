import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar .env na mão pra evitar dependências extras
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    envVars[key] = val;
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_PUBLISHABLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: Faltando VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFirstAdmin() {
  console.log("⏳ Criando/Registrando usuário tmidiamkt@gmail.com...");
  
  // 1. Tentar criar o usuário
  const { data, error } = await supabase.auth.signUp({
    email: 'tmidiamkt@gmail.com',
    password: 'admin123',
    options: {
      data: {
        full_name: 'Super Administrador',
      }
    }
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      console.log("ℹ️ O usuário já estava registrado no Auth.");
    } else {
      console.error("❌ Erro ao criar usuário no Auth:", error.message);
      // continuar mesmo assim pra tentar atualizar o profile se o login funcionar
    }
  } else {
    console.log("✅ Usuário criado no Auth com sucesso!");
  }

  // 2. Fazer login para pegar a sessão e rodar update na tabela profiles (gambiarra pelo cliente pq não temos a master key aqui)
  console.log("⏳ Fazendo login para testar...");
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'tmidiamkt@gmail.com',
    password: 'admin123'
  });

  if (loginError) {
    console.error("❌ Erro ao logar com o admin recém-criado (A senha padrão é 'admin123'):", loginError.message);
    if (loginError.message.includes('Email not confirmed')) {
      console.error("❗ O Supabase está exigindo confirmação de e-mail. Vá no painel do Supabase -> Authentication -> Providers -> Email e DESATIVE 'Confirm email'.");
    }
    process.exit(1);
  }

  console.log("✅ Login realizado com sucesso! ID:", loginData.user.id);
  
  // 3. O usuário tá logado, vamos tentar atualizar o próprio profile dele para 'superadmin'
  // OBS: Geralmente RLS bloqueia atualizar o próprio cargo. Mas vamos tentar.
  console.log("⏳ Tentando promover a superadmin pela API (Pode falhar por segurança de RLS, nesse caso rodar o SQL no painel)...");
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ user_type: 'superadmin', full_name: 'Super Administrador' })
    .eq('id', loginData.user.id);

  if (updateError) {
    console.error("⚠️ Não foi possível promover a superadmin via API (RLS bloqueou). Rode o código SQL no Painel do Supabase:");
    console.error("UPDATE profiles SET user_type = 'superadmin' WHERE id = '" + loginData.user.id + "';");
  } else {
    console.log("🎉 SUCESSO TOTAL! O usuário agora é superadmin!");
  }

  console.log("\n==================================");
  console.log("✅ CREDENCIAIS DE ACESSO:");
  console.log("Email: tmidiamkt@gmail.com");
  console.log("Senha: admin123");
  console.log("==================================");
}

createFirstAdmin();
