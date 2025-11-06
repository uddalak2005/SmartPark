import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-secondary/30">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur 
          supports-[backdrop-filter]:bg-background/80 flex items-center px-6">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-semibold">SmartPark Dashboard</h1>
          </header>
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
