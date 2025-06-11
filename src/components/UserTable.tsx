
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Power, PowerOff } from 'lucide-react';
import type { UserWithPermissions } from '@/types/user';

interface UserTableProps {
  users: UserWithPermissions[];
  onEdit: (user: UserWithPermissions) => void;
  onToggleStatus: (user: UserWithPermissions) => void;
}

export const UserTable = ({ users, onEdit, onToggleStatus }: UserTableProps) => {
  return (
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
                  onClick={() => onEdit(user)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStatus(user)}
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
  );
};
