
import { useState } from 'react';
import type { UserWithPermissions, UserFormData } from '@/types/user';
import { validateEmail, validatePassword, validateUsername, validateName, sanitizeHtml } from '@/utils/inputValidation';
import { UserBasicInfo } from '@/components/UserBasicInfo';
import { UserEmailPassword } from '@/components/UserEmailPassword';
import { UserPasswordChange } from '@/components/UserPasswordChange';
import { UserTypeSelect } from '@/components/UserTypeSelect';
import { UserPermissions } from '@/components/UserPermissions';

interface UserFormProps {
  editingUser: UserWithPermissions | null;
  formData: UserFormData;
  onFormDataChange: (formData: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  canCreateUser: boolean;
}

export const UserForm = ({
  editingUser,
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
  canCreateUser
}: UserFormProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    const sanitizedValue = sanitizeHtml(value);
    onFormDataChange({ ...formData, [field]: sanitizedValue });
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!editingUser) {
      if (!validateEmail(formData.email)) {
        errors.email = 'Email inválido';
      }
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }

    // Validação para alteração de senha no modo de edição
    if (editingUser && newPassword) {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.message;
      }
      
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
      }
    }

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.message;
    }

    const nameValidation = validateName(formData.full_name);
    if (!nameValidation.isValid) {
      errors.full_name = nameValidation.message;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Se estiver alterando senha, incluir a nova senha nos dados do formulário
      if (editingUser && newPassword) {
        onFormDataChange({ ...formData, password: newPassword });
      }
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UserBasicInfo
        formData={formData}
        validationErrors={validationErrors}
        onInputChange={handleInputChange}
      />

      {!editingUser && (
        <UserEmailPassword
          formData={formData}
          validationErrors={validationErrors}
          onInputChange={handleInputChange}
        />
      )}

      {editingUser && (
        <UserPasswordChange
          validationErrors={validationErrors}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
        />
      )}

      <UserTypeSelect
        formData={formData}
        onFormDataChange={onFormDataChange}
      />

      <UserPermissions
        formData={formData}
        onFormDataChange={onFormDataChange}
      />
    </form>
  );
};
