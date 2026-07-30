"use client";

import { useEffect, useState } from "react";
import { evaluationsService } from "@/services/evaluations.service";
import { getKitchens, Kitchen } from "@/services/kitchens.service";
import { tablesService } from "@/services/tables.service";
import { Star, CaretLeft, CaretRight, Funnel } from "@phosphor-icons/react";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  // Filters
  const [selectedKitchen, setSelectedKitchen] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [timeFilterType, setTimeFilterType] = useState<string>("all"); // all, today, thisMonth, date, month
  const [specificDate, setSpecificDate] = useState<string>("");
  const [specificMonth, setSpecificMonth] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Data
  const [stats, setStats] = useState({
    totalEvals: 0,
    fiveStarPercent: 0,
    activeKitchens: 0,
  });
  const [evals, setEvals] = useState<any[]>([]);

  // Fetch initial kitchens
  useEffect(() => {
    getKitchens().then((data) => {
      setKitchens(data);
      const active = data.filter((k: Kitchen) => k.isActive).length;
      setStats((prev) => ({ ...prev, activeKitchens: active }));
    }).catch(console.error);
  }, []);

  // Fetch tables when kitchen changes
  useEffect(() => {
    if (selectedKitchen) {
      tablesService.findAll(Number(selectedKitchen)).then(setTables).catch(console.error);
    } else {
      setTables([]);
      setSelectedTable("");
    }
  }, [selectedKitchen]);

  // Main data fetcher
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let startDate: string | undefined = undefined;
        let endDate: string | undefined = undefined;

        const now = new Date();
        
        if (timeFilterType === "today") {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          startDate = today.toISOString();
          endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
        } else if (timeFilterType === "thisMonth") {
          const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          startDate = startMonth.toISOString();
          endDate = endMonth.toISOString();
        } else if (timeFilterType === "date" && specificDate) {
          const d = new Date(specificDate);
          startDate = d.toISOString();
          endDate = new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
        } else if (timeFilterType === "month" && specificMonth) {
          const [year, month] = specificMonth.split('-');
          const startMonth = new Date(Number(year), Number(month) - 1, 1);
          const endMonth = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
          startDate = startMonth.toISOString();
          endDate = endMonth.toISOString();
        }

        const isFiltering = selectedKitchen !== "" || selectedTable !== "" || timeFilterType !== "all";

        const res = await evaluationsService.getAll({
          kitchenId: selectedKitchen ? Number(selectedKitchen) : undefined,
          tableId: selectedTable ? Number(selectedTable) : undefined,
          startDate,
          endDate,
          page: isFiltering ? page : 1,
          limit: limit,
        });

        // Calculate stats using meta
        const total = res.meta.total;
        const fiveStarPercent = total > 0 ? Math.round((res.meta.fiveStarCount / total) * 100) : 0;
        
        setStats(prev => ({
          ...prev,
          totalEvals: total,
          fiveStarPercent
        }));

        setEvals(res.data);
        setTotalPages(res.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedKitchen, selectedTable, timeFilterType, specificDate, specificMonth, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedKitchen, selectedTable, timeFilterType, specificDate, specificMonth]);

  const isFiltering = selectedKitchen !== "" || selectedTable !== "" || timeFilterType !== "all";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Tổng quan</h1>
        <p className="text-zinc-500 mt-1">Dữ liệu đánh giá theo thời gian thực</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 min-w-[200px] w-full">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Bếp</label>
          <select 
            value={selectedKitchen} 
            onChange={(e) => setSelectedKitchen(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
          >
            <option value="">Tất cả bếp</option>
            {kitchens.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px] w-full">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Bàn</label>
          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            disabled={!selectedKitchen}
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Tất cả bàn</option>
            {tables.map(t => (
              <option key={t.id} value={t.id}>{t.tableName}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px] w-full">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Thời gian</label>
          <select 
            value={timeFilterType} 
            onChange={(e) => setTimeFilterType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="thisMonth">Tháng này</option>
            <option value="date">Ngày cụ thể...</option>
            <option value="month">Tháng cụ thể...</option>
          </select>
        </div>

        {timeFilterType === 'date' && (
          <div className="flex-1 min-w-[150px] w-full animate-in zoom-in-95 duration-200">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Chọn ngày</label>
            <input 
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            />
          </div>
        )}

        {timeFilterType === 'month' && (
          <div className="flex-1 min-w-[150px] w-full animate-in zoom-in-95 duration-200">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Chọn tháng</label>
            <input 
              type="month"
              value={specificMonth}
              onChange={(e) => setSpecificMonth(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
            />
          </div>
        )}
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
              {stats.activeKitchens}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
            {isFiltering ? <><Funnel className="w-4 h-4 text-zinc-400" /> Danh sách đánh giá</> : "10 đánh giá mới nhất"}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium animate-pulse">Đang tải dữ liệu...</div>
        ) : evals.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Chưa có đánh giá nào thỏa mãn điều kiện</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {evals.map((evalItem: any) => (
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
                    {evalItem.table?.tableName && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md">
                        {evalItem.table.tableName}
                      </span>
                    )}
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
        
        {/* Pagination only shown if filtering and has data */}
        {isFiltering && totalPages > 1 && evals.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs text-zinc-500 font-medium">Trang {page} / {totalPages}</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CaretLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CaretRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
