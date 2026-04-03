/* eslint-disable react-refresh/only-export-components */
import { ReactNode } from "react";
import { BarChart3, LayoutDashboard, LogOut, Network, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  roleLabel: string;
  navigation: { label: string; href: string; icon: typeof LayoutDashboard }[];
  children: ReactNode;
  onSignOut?: () => void;
};

export const dashboardIcons = {
  dashboard: LayoutDashboard,
  performance: BarChart3,
  leads: Users,
  network: Network,
};

export function DashboardShell({ title, subtitle, roleLabel, navigation, children, onSignOut }: DashboardShellProps) {
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon" className="border-r border-sidebar-border/70">
        <SidebarHeader className="gap-3 px-4 py-5">
          <Link to="/" className="rounded-2xl border border-border/80 bg-white/90 px-4 py-4 shadow-card">
            <p className="font-serif text-xl font-semibold tracking-tight text-foreground">OmegaBalance</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{roleLabel}</p>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel>Meny</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.href} tooltip={item.label}>
                        <Link to={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="rounded-2xl border border-border/80 bg-white/90 p-3 shadow-card">
            <p className="text-sm font-medium text-foreground">MVP-läge</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Tracking, attribution och partnerinsikter är aktiva. Kontoaktivering ligger fortfarande utanför den här versionen.
            </p>
            {onSignOut ? (
              <Button variant="outline" className="mt-3 w-full justify-start rounded-xl" onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logga ut
              </Button>
            ) : null}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[radial-gradient(circle_at_top_right,_rgba(117,181,170,0.15),_transparent_30%),linear-gradient(180deg,_#f7fbfa_0%,_#f4f7f8_55%,_#f9fbfb_100%)]">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-5 sm:py-4 md:px-8">
            <SidebarTrigger />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{roleLabel}</p>
              <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
            </div>
          </div>
        </header>

        <div className="px-3 py-4 sm:px-5 sm:py-8 md:px-8 md:py-10">
          <div className="mb-5 max-w-3xl md:mb-8">
            <p className="text-sm leading-6 text-subtle sm:text-lg sm:leading-8">{subtitle}</p>
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border/70 bg-white/90 p-3 shadow-card sm:rounded-[1.5rem] sm:p-6 md:rounded-[1.75rem] md:p-7", className)}>
      <div className="mb-4 sm:mb-5">
        <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-subtle">{description}</p>
      </div>
      {children}
    </section>
  );
}
