"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  Settings,
  MessageSquare,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Instâncias",
    href: "/dashboard/instances",
    icon: Smartphone,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">WPP Manager</p>
          <p className="text-xs text-muted-foreground">Painel de Controle</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive(item.href, item.exact)
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4",
                isActive(item.href, item.exact)
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              )}
            />
            {item.title}
          </Link>
        ))}

        <Separator className="my-4" />

        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sistema
        </p>
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            pathname === "/dashboard/settings"
              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Configurações
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 px-3 py-2">
          <Zap className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              WPPConnect Server
            </p>
            <p className="text-xs text-muted-foreground">v2.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
