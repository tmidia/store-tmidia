
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LogoutButton from "@/components/LogoutButton";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { userProfile } = useRoleBasedAccess();

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const fallbackInitials = userProfile ? getInitials(userProfile.full_name || userProfile.username) : 'U';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 bg-gray-50/50">
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="lg:hidden h-14 px-4 flex justify-between items-center">
              <SidebarTrigger />
              <div className="flex items-center gap-4">
                {userProfile && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar_url || ''} />
                    <AvatarFallback>{fallbackInitials}</AvatarFallback>
                  </Avatar>
                )}
                <LogoutButton />
              </div>
            </div>
            <div className="hidden lg:flex justify-end items-center h-14 px-4 gap-4">
              {userProfile && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-sm text-gray-800">{userProfile.full_name || userProfile.username}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userProfile.user_type?.replace(/_/g, ' ') || 'Usuário'}
                    </p>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile.avatar_url || ''} alt={userProfile.full_name || userProfile.username || ''} />
                    <AvatarFallback>{fallbackInitials}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <LogoutButton />
            </div>
          </header>
          <div className="p-0 sm:p-2 lg:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
