"use client";

import { useState } from "react";
import { LockKey, User, SignIn, ForkKnife, Eye, EyeSlash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(username, password);
      localStorage.setItem("token", data.access_token);
      toast.success("Đăng nhập thành công!");
      router.push("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Sai tài khoản hoặc mật khẩu");
      } else {
        toast.error("Lỗi kết nối đến máy chủ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-zinc-950 flex items-center justify-center rounded-2xl shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300">
            <ForkKnife weight="fill" className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold tracking-tight text-zinc-950">
          Đăng nhập hệ thống
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 font-medium tracking-wide">
          Q-Meal • Quality Management
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards">
        <div className="bg-white px-4 py-8 sm:rounded-3xl sm:px-12 sm:border border-zinc-200/80 sm:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User weight="bold" className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all outline-none"
                  placeholder="Nhập tài khoản"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockKey weight="bold" className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-950 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <SignIn weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Đăng nhập
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
