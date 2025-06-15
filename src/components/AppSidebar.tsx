
import { 
  Home, 
  Package, 
  Archive, 
  ShoppingCart, 
  DollarSign, 
  Receipt, 
  BarChart3, 
  Users, 
  Settings,
  Building2,
  Tag
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Package,
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: Archive,
  },
  {
    title: "Fornecedores",
    url: "/fornecedores",
    icon: Building2,
  },
  {
    title: "Categorias",
    url: "/categorias",
    icon: Tag,
  },
  {
    title: "PDV",
    url: "/pdv",
    icon: ShoppingCart,
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
  },
  {
    title: "Despesas",
    url: "/despesas",
    icon: Receipt,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { userProfile, isLoading } = useRoleBasedAccess();

  console.log('🗂️ AppSidebar renderizado - isLoading:', isLoading, 'userProfile:', !!userProfile);

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SGA</h2>
            <p className="text-xs text-gray-600">Sistema de Gestão</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`w-full justify-start rounded-lg transition-colors hover:bg-blue-50 ${
                        location.pathname === item.url 
                          ? 'bg-blue-50 text-primary border-r-2 border-primary' 
                          : 'text-gray-700'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center space-x-3 px-3 py-2">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-gray-200">
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : userProfile ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {userProfile?.user_type === 'superadmin' ? 'Super Admin' : 
                 userProfile?.user_type === 'gerente' ? 'Gerente' : 
                 userProfile?.user_type === 'vendedor' ? 'Vendedor' : 
                 'Estoquista'}
              </p>
              <p className="text-xs text-gray-600">{userProfile?.user_type}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Carregando...</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
