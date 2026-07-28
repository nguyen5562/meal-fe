"use client";

import { useEffect, useState } from "react";
import { evaluationsService } from "@/services/evaluations.service";
import { getKitchens, Kitchen } from "@/services/kitchens.service";
import { Star } from "@phosphor-icons/react";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvals: 0,
    fiveStarPercent: 0,
    activeKitchens: 0,
  });
  const [recentEvals, setRecentEvals] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evals, kitchens] = await Promise.all([
          evaluationsService.getAll(),
          getKitchens(),
        ]);

        const totalEvals = evals.length;
        const fiveStars = evals.filter((e: any) => e.rating === 5).length;
        const fiveStarPercent = totalEvals > 0 ? Math.round((fiveStars / totalEvals) * 100) : 0;
        const activeKitchens = kitchens.filter((k: Kitchen) => k.isActive).length;

        setStats({ totalEvals, fiveStarPercent, activeKitchens });
        
        // Sắp xếp giảm dần theo thời gian (giả định có trường createdAt)
        const sortedEvals = evals.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentEvals(sortedEvals.slice(0, 5)); // Lấy 5 đánh giá mới nhất
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Tổng quan</h1>
        <p className="text-zinc-500 mt-1">Dữ liệu đánh giá theo thời gian thực</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tổng lượt đánh giá</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tighter text-zinc-950">
              {loading ? "..." : stats.totalEvals.toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Metric Card 2 */}
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-sm flex flex-col justify-center text-white relative overflow-hidden">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2 z-10 relative">Đánh giá 5 sao</p>
          <div className="flex items-baseline gap-2 z-10 relative">
            <span className="text-4xl font-bold tracking-tighter text-white">
              {loading ? "..." : `${stats.fiveStarPercent}%`}
            </span>
          </div>
          {/* Subtle decoration */}
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Star weight="fill" className="w-32 h-32" />
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Bếp hoạt động</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tighter text-zinc-950">
              {loading ? "..." : stats.activeKitchens}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">Đánh giá mới nhất</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Đang tải dữ liệu...</div>
        ) : recentEvals.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Chưa có đánh giá nào</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recentEvals.map((evalItem: any) => (
              <div key={evalItem.id} className="p-6 flex items-start gap-5 hover:bg-zinc-50/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 shrink-0 uppercase">
                  {evalItem.evaluatorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-semibold text-zinc-900 truncate">{evalItem.evaluatorName}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md">
                      {evalItem.unit}
                    </span>
                    <span className="text-xs text-zinc-400 ml-auto tabular-nums">
                      {new Date(evalItem.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        weight={s <= evalItem.rating ? "fill" : "regular"} 
                        className={`w-4 h-4 ${s <= evalItem.rating ? "text-amber-400" : "text-zinc-200"}`} 
                      />
                    ))}
                  </div>
                  {evalItem.feedback && (
                    <p className="text-zinc-600 text-sm leading-relaxed">{evalItem.feedback}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
