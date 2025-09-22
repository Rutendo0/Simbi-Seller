"use client";

import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Store,
  TrendingUp,
  Users,
  FileText,
  User,
  Home,
  CreditCard,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "Analytics", url: "/analytics", icon: TrendingUp },
    ]
  },
  {
    title: "Store Management",
    items: [
      { title: "Products", url: "/products", icon: Package },
      { title: "Orders", url: "/orders", icon: ShoppingCart },
    ]
  },
  {
    title: "Financial",
    items: [
      { title: "Earnings", url: "/earnings", icon: DollarSign },
      { title: "Reports", url: "/reports", icon: FileText },
    ]
  },
  {
    title: "Account",
    items: [
      { title: "Store Profile", url: "/profile", icon: User },
      { title: "Settings", url: "/settings", icon: Settings },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const currentPath = pathname || "/";
  const isCollapsed = state === "collapsed";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => currentPath === path;

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0 shadow-lg">
      <SidebarContent className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* Logo */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-foreground">Simbi Market</h1>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <p className="text-xs text-muted-foreground">Seller Portal</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6 space-y-2">
          {navigation.map((section, sectionIndex) => (
            <div key={section.title}>
              <SidebarGroup>
                {!isCollapsed && (
                  <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-3 py-2 mb-1">
                    {section.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={isCollapsed ? item.title : undefined}
                          className={`
                            group relative mx-2 rounded-lg transition-all duration-200
                            ${isActive(item.url)
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                            }
                            ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'}
                          `}
                        >
                          <Link href={item.url} className="flex items-center gap-3 w-full">
                            <div className={`
                              flex items-center justify-center w-5 h-5 transition-colors
                              ${isActive(item.url) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                            `}>
                              <item.icon className="h-4 w-4" />
                            </div>
                            <span className={`font-medium ${isCollapsed ? 'sr-only' : ''}`}>
                              {item.title}
                            </span>
                            {!isCollapsed && (
                              <ChevronRight className={`
                                h-3 w-3 ml-auto transition-transform duration-200
                                ${isActive(item.url) ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                                ${isActive(item.url) ? 'rotate-90' : ''}
                              `} />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Add separator between sections except for the last one */}
              {sectionIndex < navigation.length - 1 && !isCollapsed && (
                <Separator className="my-4 mx-3 opacity-50" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/30">
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground text-center">
              <p>© 2024 Simbi Market</p>
              <p className="mt-1">Seller Dashboard v2.1</p>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
