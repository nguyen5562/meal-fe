export default function DashboardOverview() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Tổng quan Hệ thống</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Tổng lượt đánh giá</p>
          <p className="text-4xl font-bold text-indigo-600">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Đánh giá 5 sao</p>
          <p className="text-4xl font-bold text-green-500">89%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Số lượng Bếp đang hoạt động</p>
          <p className="text-4xl font-bold text-slate-700">4</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Đánh giá mới nhất</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                A
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800">Nguyễn Văn A</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Đại đội 1</span>
                  <span className="text-xs text-slate-400 ml-auto">Vừa xong</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-slate-600 text-sm">Canh hôm nay rất ngon, cơm chín đều.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
