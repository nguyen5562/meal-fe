"use client";

import { useEffect, useState } from "react";
import { tablesService } from "@/services/tables.service";
import { getKitchens, Kitchen } from "@/services/kitchens.service";
import { Plus, PencilSimple, Trash, X, Printer } from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tableToDelete, setTableToDelete] = useState<number | null>(null);
  const [qrModalTable, setQrModalTable] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({ tableName: "", kitchenId: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tablesData, kitchensData] = await Promise.all([
        tablesService.findAll(),
        getKitchens()
      ]);
      setTables(tablesData);
      setKitchens(kitchensData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (table?: any) => {
    if (table) {
      setEditingId(table.id);
      setFormData({ tableName: table.tableName, kitchenId: table.kitchenId.toString() });
    } else {
      setEditingId(null);
      setFormData({ tableName: "", kitchenId: kitchens.length > 0 ? kitchens[0].id.toString() : "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, kitchenId: parseInt(formData.kitchenId) };
      if (editingId) {
        await tablesService.update(editingId, payload);
        toast.success("Cập nhật bàn thành công!");
      } else {
        await tablesService.create(payload);
        toast.success("Thêm bàn mới thành công!");
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Error saving table:", error);
      toast.error("Đã xảy ra lỗi khi lưu thông tin bàn.");
    }
  };

  const handleDelete = (id: number) => {
    setTableToDelete(id);
  };

  const executeDelete = async () => {
    if (!tableToDelete) return;
    try {
      await tablesService.delete(tableToDelete);
      toast.success("Đã xóa bàn.");
      fetchData();
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Lỗi khi xóa bàn.");
    } finally {
      setTableToDelete(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Quản lý Bàn & Mã QR</h1>
          <p className="text-zinc-500 mt-1">Thiết lập bàn ăn và in mã QR để người dùng đánh giá</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200/80 shadow-sm rounded-lg hover:bg-zinc-50 transition-all active:scale-[0.98]"
          >
            <Printer weight="bold" />
            In Mã QR
          </button>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <Plus weight="bold" />
            Thêm Bàn
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden print:hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Đang tải dữ liệu...</div>
        ) : tables.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Chưa có bàn nào được tạo</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/50 text-zinc-500 font-medium border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4">Tên bàn</th>
                  <th className="px-6 py-4">Thuộc bếp</th>
                  <th className="px-6 py-4">Mã QR</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-900">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">{table.tableName}</td>
                    <td className="px-6 py-4 text-zinc-600">{table.kitchen?.name || "—"}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setQrModalTable(table)}
                        className="bg-white p-1.5 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors shadow-sm cursor-pointer"
                        title="Phóng to mã QR"
                      >
                        <QRCodeSVG
                          value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/rate/${table.qrToken}`}
                          size={40}
                          level="H"
                          includeMargin={false}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(table)}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Sửa"
                        >
                          <PencilSimple weight="fill" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(table.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash weight="fill" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grid in ấn QR */}
      <div className="hidden print:grid print:grid-cols-2 print:gap-6 print:p-4">
        {tables.map(table => {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          return (
            <div key={`print-${table.id}`} className="bg-white flex flex-col items-center justify-center text-center print:shadow-none print:border-2 print:border-zinc-300 print:break-inside-avoid print:p-8 print:rounded-xl">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mb-1">{table.tableName}</h2>
              <p className="text-zinc-600 font-semibold mb-4 text-sm uppercase tracking-wider">{table.kitchen?.name}</p>
              <div className="bg-white p-4 rounded-xl print:border-none flex items-center justify-center">
                <QRCodeSVG 
                  value={`${origin}/rate/${table.qrToken}`} 
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-600">Quét mã để đánh giá<br/>chất lượng bữa ăn</p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-950">
                {editingId ? "Sửa thông tin Bàn" : "Thêm Bàn mới"}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors">
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Tên Bàn</label>
                <input
                  type="text"
                  required
                  value={formData.tableName}
                  onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="VD: Bàn 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Thuộc Bếp</label>
                <select
                  required
                  value={formData.kitchenId}
                  onChange={(e) => setFormData({ ...formData, kitchenId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                >
                  <option value="" disabled>Chọn bếp...</option>
                  {kitchens.map(k => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]"
                  disabled={!formData.kitchenId}
                >
                  {editingId ? "Cập nhật" : "Lưu Bàn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Enlarge Modal */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-950">
                Mã QR: {qrModalTable.tableName}
              </h3>
              <button onClick={() => setQrModalTable(null)} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors">
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/rate/${qrModalTable.qrToken}`}
                  size={240}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-zinc-900">
                  {qrModalTable.tableName} • {qrModalTable.kitchen?.name}
                </p>
                <p className="text-xs text-zinc-500 max-w-[260px] mx-auto">
                  Sử dụng điện thoại để quét mã QR này và tiến hành đánh giá bữa ăn.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={tableToDelete !== null}
        title="Xóa bàn"
        message="Bạn có chắc chắn muốn xoá bàn này? Dữ liệu không thể khôi phục."
        confirmText="Xóa"
        onConfirm={executeDelete}
        onCancel={() => setTableToDelete(null)}
      />
    </div>
  );
}
