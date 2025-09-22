"use client";

"use client";
import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, User, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import NotificationsPanel from '@/components/NotificationsPanel';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import { useUser } from '@/hooks/useUser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { user, profile } = useUser();

  useEffect(()=>{
    const auth = getFirebaseAuth();
    if (!auth) {
      // no auth available (dev) - allow
      setAuthChecked(true);
      return;
    }
    const unsub = auth.onAuthStateChanged(async (u)=>{
      if (!u) {
        // not signed in - redirect to login
        if (typeof window !== 'undefined') window.location.href = '/login';
        return;
      }
      // signed in - allow
      setAuthChecked(true);
    });
    return ()=> unsub();
  },[]);

  if (!authChecked) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-6 relative">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products, orders..."
                    className="pl-10 bg-muted/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="relative" onClick={()=>setShowNotifications((s)=>!s)} aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profile?.photoURL || undefined} />
                        <AvatarFallback className="text-xs">
                          {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block text-sm">
                        {profile?.displayName || user?.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.displayName || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={async () => {
                        const auth = getFirebaseAuth();
                        if (auth) {
                          await auth.signOut();
                          window.location.href = '/login';
                        }
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Notifications panel portal */}
              {showNotifications && (
                <div className="absolute right-6 top-16 z-50">
                  <NotificationsPanel visible={true} onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
