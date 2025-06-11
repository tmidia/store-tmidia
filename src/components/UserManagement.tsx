
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Edit, Trash2, Power, PowerOff, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserPermission = Database['public']['Tables']['user_permissions']['Row'];

interface UserWithPermissions extends Profile {
  permissions: string[];
}

const MODULES = [
  'dashboard', 'pdv', 'produtos', 'estoque', 'financeiro', 
  'relatorios', 'fornecedores', 'configuracoes', 'usuarios'
];

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithPermissions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSignupAttempt, setLastSignupAttempt] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    user_type: 'vendedor' as Database['public']['Enums']['user_type'],
    permissions: [] as string[]
  });
  const { toast } = useToast();

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isWithinRateLimit = () => {
    if (!lastSignupAttempt) return true;
    const timeSinceLastAttempt = Date.now() - lastSignupAttempt;
    return timeSinceLastAttempt >= 45000; // 45 seconds
  };

  const updateRemainingTime = () => {
    if (!lastSignupAttempt) {
      setRemainingTime(0);
      return;
    }
    const timeSinceLastAttempt = Date.now() - lastSignupAttempt;
    const remaining = Math.max(0, 45000 - timeSinceLastAttempt);
    setRemainingTime(Math.ceil(remaining / 1000));
    
    if (remaining <= 0) {
      setLastSignupAttempt(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lastSignupAttempt && !isWithinRateLimit()) {
      interval = setInterval(updateRemainingTime, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lastSignupAttempt]);

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles) {
        const usersWithPermissions = await Promise.all(
          profiles.map(async (profile) => {
            const { data: permissions } = await supabase
              .from('user_permissions')
              .select('module')
              .eq('user_id', profile.id);

            return {
              ...profile,
              permissions: permissions?.map(p => p.module) || []
            };
          })
        );
        setUsers(usersWithPermissions);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser && !isWithinRateLimit()) {
      toast({
        title: "Limite de segurança ativo",
        description: `Por segurança, aguarde ${remainingTime} segundos antes de tentar criar outro usuário.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const capitalizedName = capitalizeWords(formData.full_name);
      
      if (editingUser) {
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            full_name: capitalizedName,
            user_type: formData.user_type
          })
          .eq('id', editingUser.id);

        if (updateError) throw updateError;

        // Remover permissões antigas
        await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', editingUser.id);

        // Adicionar novas permissões
        if (formData.permissions.length > 0) {
          const permissions = formData.permissions.map(module => ({
            user_id: editingUser.id,
            module: module as any
          }));

          await supabase
            .from('user_permissions')
            .insert(permissions);
        }

        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        // Registrar tentativa de criação
        setLastSignupAttempt(Date.now());

        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              full_name: capitalizedName
            }
          }
        });

        if (authError) {
          console.error('Erro de autenticação:', authError);
          throw authError;
        }

        if (authData.user) {
          // Criar perfil
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              username: formData.username,
              full_name: capitalizedName,
              user_type: formData.user_type
            });

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            throw profileError;
          }

          // Adicionar permissões
          if (formData.permissions.length > 0) {
            const permissions = formData.permissions.map(module => ({
              user_id: authData.user.id,
              module: module as any
            }));

            const { error: permissionsError } = await supabase
              .from('user_permissions')
              .insert(permissions);

            if (permissionsError) {
              console.error('Erro ao criar permissões:', permissionsError);
            }
          }
        }

        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      
      let errorMessage = "Erro ao salvar usuário.";
      
      if (error.message.includes('45 seconds') || error.message.includes('rate limit')) {
        errorMessage = "Por segurança, aguarde 45 segundos antes de tentar criar outro usuário.";
      } else if (error.message.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado no sistema.";
      } else if (error.message.includes('invalid email')) {
        errorMessage = "Por favor, insira um email válido.";
      } else if (error.message.includes('password')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message.includes('Username should be') || error.message.includes('unique')) {
        errorMessage = "Este nome de usuário já existe. Escolha outro.";
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      full_name: '',
      email: '',
      password: '',
      user_type: 'vendedor',
      permissions: []
    });
    setEditingUser(null);
  };

  const handleEdit = (user: UserWithPermissions) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      full_name: user.full_name || '',
      email: '',
      password: '',
      user_type: user.user_type || 'vendedor',
      permissions: user.permissions
    });
    setIsDialogOpen(true);
  };

  const toggleUserStatus = async (user: UserWithPermissions) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: user.is_active ? "Usuário desativado" : "Usuário ativado",
        description: `O usuário foi ${user.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handlePermissionChange = (module: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, module]
        : prev.permissions.filter(p => p !== module)
    }));
  };

  const canCreateUser = isWithinRateLimit();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Gestão de Usuários</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                disabled={!canCreateUser}
                className="relative"
              >
                {!canCreateUser ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Aguarde {remainingTime}s
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Atualize as informações do usuário.' : 'Preencha os dados para criar um novo usuário.'}
                  {!editingUser && !canCreateUser && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Aguarde {remainingTime} segundos para criar outro usuário
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="user_type">Tipo de Usuário</Label>
                  <Select value={formData.user_type} onValueChange={(value: Database['public']['Enums']['user_type']) => setFormData(prev => ({ ...prev, user_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="estoquista">Estoquista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Permissões de Módulos</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {MODULES.map(module => (
                      <div key={module} className="flex items-center space-x-2">
                        <Checkbox
                          id={module}
                          checked={formData.permissions.includes(module)}
                          onCheckedChange={(checked) => handlePermissionChange(module, checked as boolean)}
                        />
                        <Label htmlFor={module} className="capitalize text-sm">
                          {module}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || (!editingUser && !canCreateUser)}
                  >
                    {isSubmitting ? (
                      'Processando...'
                    ) : (
                      editingUser ? 'Atualizar' : 'Criar'
                    )} Usuário
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Gerencie usuários do sistema (acesso restrito ao Superadmin)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.user_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.last_activity 
                    ? new Date(user.last_activity).toLocaleDateString('pt-BR')
                    : 'Nunca'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user)}
                    >
                      {user.is_active ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
