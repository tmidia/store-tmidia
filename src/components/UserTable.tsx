
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Power, PowerOff, UserX } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { UserWithPermissions } from '@/types/user';

interface UserTableProps {
  users: UserWithPermissions[];
  onEdit: (user: UserWithPermissions) => void;
  onToggleStatus: (user: UserWithPermissions) => void;
}

export const UserTable = ({ users, onEdit, onToggleStatus }: UserTableProps) => {
  const isMobile = useIsMobile();

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Ativo" : "Inativo";
  };

  if (isMobile) {
    return (
      <div className="space-y-3 w-full">
        {users.map((user) => (
          <Card key={user.id} className="w-full">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{user.full_name}</h3>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="h-8 w-8 p-0"
                      title="Editar usuário"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(user)}
                      className="h-8 w-8 p-0"
                      title={user.is_active ? "Desativar usuário" : "Ativar usuário"}
                    >
                      {user.is_active ? (
                        <UserX className="w-4 h-4 text-red-500" />
                      ) : (
                        <Power className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {user.user_type}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(user.is_active)}`}>
                    {getStatusText(user.is_active)}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Última atividade: {user.last_activity 
                    ? new Date(user.last_activity).toLocaleDateString('pt-BR')
                    : 'Nunca'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium text-sm">Nome</th>
            <th className="text-left p-4 font-medium text-sm">Usuário</th>
            <th className="text-left p-4 font-medium text-sm">Tipo</th>
            <th className="text-left p-4 font-medium text-sm">Status</th>
            <th className="text-left p-4 font-medium text-sm">Última Atividade</th>
            <th className="text-left p-4 font-medium text-sm">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-muted/50">
              <td className="p-4 font-medium">{user.full_name}</td>
              <td className="p-4">{user.username}</td>
              <td className="p-4">
                <Badge variant="outline" className="capitalize">
                  {user.user_type}
                </Badge>
              </td>
              <td className="p-4">
                <Badge className={getStatusColor(user.is_active)}>
                  {getStatusText(user.is_active)}
                </Badge>
              </td>
              <td className="p-4">
                {user.last_activity 
                  ? new Date(user.last_activity).toLocaleDateString('pt-BR')
                  : 'Nunca'
                }
              </td>
              <td className="p-4">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                    title="Editar usuário"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(user)}
                    title={user.is_active ? "Desativar usuário" : "Ativar usuário"}
                  >
                    {user.is_active ? (
                      <UserX className="w-4 h-4 text-red-500" />
                    ) : (
                      <Power className="w-4 h-4 text-green-500" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
