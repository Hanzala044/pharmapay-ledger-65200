import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, TrendingUp, FileText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['owner', 'manager'] },
  { title: "Parties", url: "/parties", icon: Users, roles: ['owner', 'manager'] },
  { title: "Analytics", url: "/analytics", icon: TrendingUp, roles: ['owner'] },
  { title: "Reports", url: "/reports", icon: FileText, roles: ['owner'] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ['owner', 'manager'] },
];

export function AppSidebar() {
  const { role } = useAuth();
  
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role as 'owner' | 'manager')
  );
  return (
    <Sidebar className="border-r border-border glass-card">
      <SidebarContent>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">PharmaPay</h2>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary/20 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
