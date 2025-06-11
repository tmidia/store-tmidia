
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Clock } from 'lucide-react';

interface UserDialogTriggerProps {
  canCreateUser: boolean;
  remainingTime: number;
  onResetForm: () => void;
}

export const UserDialogTrigger = ({
  canCreateUser,
  remainingTime,
  onResetForm
}: UserDialogTriggerProps) => {
  return (
    <DialogTrigger asChild>
      <Button 
        onClick={onResetForm}
        disabled={!canCreateUser}
        className="relative w-full sm:w-auto"
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
  );
};
