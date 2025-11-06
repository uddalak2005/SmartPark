import { Car, MapPin, BarChart3, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Travel & Park", url: "/dashboard", icon: MapPin },
  { title: "View Stats", url: "/dashboard/stats", icon: BarChart3 },
  { title: "Car Details", url: "/dashboard/car", icon: Car },
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "justify-center" : "mb-6"}>
            {collapsed ? <Car className="h-5 w-5" /> : <span className="text-sm ml-4">Navigation</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="pl-4 gap-8 md:gap-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-10 w-10 md:h-6 md:w-6" />
                      {!collapsed && <span className="text-lg md:text-base p-2">{item.title}</span>}
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
