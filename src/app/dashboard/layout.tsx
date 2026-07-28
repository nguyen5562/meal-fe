"use client";

import { SquaresFour, ForkKnife, Users, QrCode, SignOut, User as UserIcon, GridFour } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setCurrentUser(decoded);
    } catch (error) {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  const navItems = [
    { name: "Tổng quan", href: "/dashboard", icon: SquaresFour, roles: ['ADMIN', 'MANAGER'] },
    { name: "Quản lý Bếp", href: "/dashboard/kitchens", icon: ForkKnife, roles: ['ADMIN'] },
    { name: "Người dùng", href: "/dashboard/users", icon: Users, roles: ['ADMIN'] },
    { name: "Quản lý Bàn & QR", href: "/dashboard/tables", icon: GridFour, roles: ['ADMIN', 'MANAGER'] },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!currentUser) return null; // Wait for auth check

  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-50 flex-col hidden md:flex border-r border-zinc-200/60">
        <div className="h-20 flex items-center px-8">
          <ForkKnife weight="fill" className="w-6 h-6 text-zinc-950 mr-2.5" />
          <span className="text-xl font-bold tracking-tight text-zinc-950">Q-Meal</span>
        </div>
        
        <div className="px-6 mb-4 mt-2">
          <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Menu</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.filter(item => item.roles.includes(currentUser.role)).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                }`}
              >
                <Icon weight={isActive ? "fill" : "regular"} className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mb-4 border-t border-zinc-200/60 flex flex-col gap-2">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200/60 flex items-center justify-center shrink-0">
              <UserIcon weight="fill" className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">{currentUser.username}</p>
              <p className="text-xs text-zinc-500 font-medium">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all active:scale-[0.98]"
          >
            <SignOut weight="regular" className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-white rounded-l-[2rem] md:my-2 md:mr-2 md:shadow-sm md:border md:border-zinc-200/60">
        <header className="h-16 bg-white flex items-center justify-between px-8 md:hidden border-b border-zinc-100">
            <span className="text-xl font-bold tracking-tight text-zinc-950">Q-Meal</span>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 md:p-12 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
