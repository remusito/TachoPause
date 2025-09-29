
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import { usePremium } from '@/hooks/use-premium';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';

const menuItems = [
  { href: '/', icon: Icons.Play, label: 'Temporizador' },
  { href: '/speedometer', icon: Icons.Speedometer, label: 'Velocímetro GPS' },
  { href: '/route-calculator', icon: Icons.Calculator, label: 'Calculadora de Ruta', premium: true },
  { href: '/route-optimizer', icon: Icons.Route, label: 'Buscador de Paradas', premium: true },
  { href: '/telephones', icon: Icons.Phone, label: 'Teléfonos', premium: true },
  { href: '/history', icon: Icons.History, label: 'Historial', premium: false },
  { href: '/stats', icon: Icons.BarChart, label: 'Estadísticas', premium: false },
  { href: '/tutorial', icon: Icons.BookOpen, label: 'Tutorial' },
  { href: '/rewards', icon: Icons.Award, label: 'Recompensas' },
];

export function MainSidebar() {
  const { isPremium } = usePremium();
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const AuthButton = () => {
    if (loading) {
      return <Skeleton className="h-10 w-full" />;
    }
    if (user) {
      return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-start gap-2 w-full p-2 h-auto">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start truncate">
                        <span className="font-medium text-sm truncate">{user.displayName || user.email}</span>
                        {user.displayName && <span className="text-xs text-muted-foreground truncate">{user.email}</span>}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium leading-none truncate">{user.displayName || user.email}</p>
                    {user.displayName && <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      )
    }
    return (
      <Button className="w-full" onClick={() => router.push('/login')}>
        <Icons.Login className="mr-2" />
        Iniciar Sesión
      </Button>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.Truck className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            TachoPause {isPremium ? <span className='text-primary'>Premium</span> : <span className='text-sm font-normal'>Optimizer</span>}
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                  {(item.premium && !isPremium) && <Icons.Premium className="ml-auto" />}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
           <AuthButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
