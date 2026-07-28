"use client";

import { useState, useEffect } from "react";
import { Star, ForkKnife, PaperPlaneRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { tablesService } from "@/services/tables.service";
import { evaluationsService } from "@/services/evaluations.service";

export default function RatingPage() {
  const params = useParams();
  const token = params?.token as string;

  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [feedback, setFeedback] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  useEffect(() => {
    tablesService.findByToken(token)
      .then(data => {
        if (data) setTableInfo(data);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("Không tìm thấy thông tin bàn ăn hoặc mã QR không hợp lệ.");
      })
      .finally(() => {
        setIsLoadingToken(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !tableInfo) return;
    setIsSubmitting(true);
    
    try {
      await evaluationsService.create({
        tableId: tableInfo.id,
        evaluatorName: name.trim() || "Khách ẩn danh",
        unit: unit.trim() || "Không xác định",
        rating: rating,
        feedback: feedback
      });
      setIsSuccess(true);
      toast.success("Đánh giá thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trạng thái Loading hoặc Lỗi QR
  if (isLoadingToken || errorMsg) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 flex items-center justify-center p-6 font-sans">
        <div className="text-center animate-in fade-in zoom-in-95 duration-500 max-w-sm">
          {isLoadingToken ? (
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
          ) : (
            <>
              <WarningCircle weight="fill" className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Lỗi truy cập</h2>
              <p className="text-zinc-500">{errorMsg}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Trạng thái Thành công
  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 flex flex-col items-center justify-center p-6 font-sans selection:bg-zinc-900 selection:text-white">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-zinc-200/60 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle weight="fill" className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-950 mb-2 tracking-tight">Cảm ơn bạn!</h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            Đánh giá của bạn đã được ghi nhận. Chúc bạn có một bữa ăn ngon miệng.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3.5 px-4 bg-zinc-100 text-zinc-700 font-semibold rounded-xl hover:bg-zinc-200 transition-colors active:scale-[0.98]"
          >
            Đánh giá lần nữa
          </button>
        </div>
      </div>
    );
  }

  // Form Đánh giá (Mobile-First)
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header gọn gàng */}
      <header className="px-6 py-6 border-b border-zinc-100 bg-white sticky top-0 z-10 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="w-12 h-12 bg-zinc-950 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <ForkKnife weight="fill" className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-950 tracking-tight leading-tight">Đánh giá Bữa ăn</h1>
          <p className="text-sm font-medium text-zinc-500">{tableInfo?.tableName} • {tableInfo?.kitchen?.name}</p>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 w-full max-w-md mx-auto p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col h-full">
          
          {/* Star Rating Area */}
          <div className="text-center pt-2 pb-6">
            <h2 className="text-base font-bold text-zinc-900 mb-6">Chất lượng bữa ăn thế nào?</h2>
            <div className="flex justify-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="group relative focus:outline-none touch-manipulation"
                >
                  <Star
                    weight={star <= rating ? "fill" : "regular"}
                    className={`w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ease-out active:scale-75 ${
                      star <= rating 
                        ? "text-amber-400 scale-110 drop-shadow-sm" 
                        : "text-zinc-200 hover:text-zinc-300 hover:scale-105"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating === 0 && (
              <p className="text-red-500 text-xs font-semibold mt-4 animate-pulse">Vui lòng chọn số sao để tiếp tục</p>
            )}
            {rating > 0 && (
              <p className="text-amber-500 text-sm font-semibold mt-4 animate-in slide-in-from-bottom-2">
                {rating === 5 ? "Tuyệt vời!" : rating === 4 ? "Rất ngon" : rating === 3 ? "Bình thường" : rating === 2 ? "Không ngon" : "Rất tệ"}
              </p>
            )}
          </div>

          <div className="h-px w-full bg-zinc-100" />

          {/* Inputs Area */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Họ và tên (Không bắt buộc)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Đơn vị / Phòng ban (Không bắt buộc)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ví dụ: Đại đội 1"
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Góp ý (Không bắt buộc)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về bữa ăn..."
                rows={4}
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit Button (Sticky to bottom on mobile, or just large block) */}
          <div className="pt-4 pb-8">
            <button
              type="submit"
              disabled={!rating || isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-zinc-950 text-white rounded-2xl font-bold shadow-lg shadow-zinc-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PaperPlaneRight weight="fill" className="w-5 h-5" />
                  Gửi đánh giá
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
