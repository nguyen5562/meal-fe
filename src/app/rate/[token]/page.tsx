"use client";

import { useState, useEffect } from "react";
import { Star, Utensils, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";

import { tablesService } from "@/services/tables.service";
import { evaluationsService } from "@/services/evaluations.service";

export default function RatingPage() {
  const params = useParams();
  const token = params?.token as string;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tableInfo, setTableInfo] = useState<any>(null);

  useEffect(() => {
    tablesService.findByToken(token)
      .then(data => {
        if (data) setTableInfo(data);
      })
      .catch(console.error);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !name || !unit || !tableInfo) return;
    setIsSubmitting(true);
    
    try {
      await evaluationsService.create({
        tableId: tableInfo.id,
        evaluatorName: name,
        unit: unit,
        rating: rating,
        feedback: feedback
      });
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối đến máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500/30 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-violet-600/20 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Utensils className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-1 text-center">Đánh giá Bữa ăn</h1>
                <p className="text-slate-400 text-sm text-center">
                  {tableInfo ? `${tableInfo.tableName} - ${tableInfo.kitchen?.name || ''}` : "Đang tải thông tin..."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-indigo-400">Họ và tên <span className="text-red-400">*</span></label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-indigo-400">Đơn vị <span className="text-red-400">*</span></label>
                    <input
                      required
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      placeholder="VD: Đại đội 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3 text-center">Chất lượng bữa ăn <span className="text-red-400">*</span></label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors duration-200 ${
                            (hoveredRating ? star <= hoveredRating : star <= rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-indigo-400">Phản hồi thêm (Tùy chọn)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none h-24"
                    placeholder="Món ăn hôm nay thế nào?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!rating || !name || !unit || isSubmitting}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl py-4 font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>Gửi đánh giá</span>
                      <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Cảm ơn bạn!</h2>
              <p className="text-slate-400">Đánh giá của bạn đã được ghi nhận và gửi đến quản lý bếp.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
