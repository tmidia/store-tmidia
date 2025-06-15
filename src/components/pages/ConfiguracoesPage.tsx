
import CompanySettings from "@/components/CompanySettings";
import SystemParameters from "@/components/SystemParameters";
import IntegrationsSettings from "@/components/IntegrationsSettings";
import UserProfile from "@/components/UserProfile";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const ConfiguracoesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>
      <div className="grid gap-6">
        <CompanySettings />
        <SystemParameters />
        <IntegrationsSettings />
        <div className="grid gap-6 md:grid-cols-2">
          <UserProfile />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};
