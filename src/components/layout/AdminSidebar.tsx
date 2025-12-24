import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  FileText,
  Tag,
  Building2,
  Layers,
  Shield,
  UserCog,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Complaints',
    icon: FileText,
    href: '/admin',
  },
  {
    title: 'Category',
    icon: Tag,
    href: '/admin/category',
  },
  {
    title: 'Organizational Unit',
    icon: Building2,
    href: '/admin/organizational-unit',
  },
  {
    title: 'Organizational Unit Type',
    icon: Layers,
    href: '/admin/organizational-unit-type',
  },
  {
    title: 'Permission',
    icon: Shield,
    href: '/admin/permission',
  },
  {
    title: 'Role',
    icon: UserCog,
    href: '/admin/role',
  },
  {
    title: 'User',
    icon: Users,
    href: '/admin/user',
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Admin Panel</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

