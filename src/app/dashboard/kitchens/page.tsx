"use client";

import { useEffect, useState } from "react";
import { getKitchens, createKitchen, updateKitchen, deleteKitchen, Kitchen } from "@/services/kitchens.service";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";

export default function KitchensPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [kitchenToDelete, setKitchenToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", location: "", isActive: true });

  const fetchKitchens = async () => {
    setLoading(true);
    try {
      const data = await getKitchens();
      setKitchens(data);
    } catch (error) {
      console.error("Failed to fetch kitchens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  const openModal = (kitchen?: Kitchen) => {
    if (kitchen) {
      setEditingId(kitchen.id);
      setFormData({ name: kitchen.name, location: kitchen.location || "", isActive: kitchen.isActive });
    } else {
      setEditingId(null);
      setFormData({ name: "", location: "", isActive: true });
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
      if (editingId) {
        await updateKitchen(editingId, formData);
        toast.success("Cập nhật thông tin bếp thành công!");
      } else {
        await createKitchen(formData);
        toast.success("Thêm bếp mới thành công!");
      }
      closeModal();
      fetchKitchens();
    } catch (error) {
      console.error("Error saving kitchen:", error);
      toast.error("Đã xảy ra lỗi khi lưu thông tin bếp.");
    }
  };

  const handleDelete = (id: number) => {
    setKitchenToDelete(id);
  };

  const executeDelete = async () => {
    if (!kitchenToDelete) return;
    try {
      await deleteKitchen(kitchenToDelete);
      toast.success("Đã xóa bếp.");
      fetchKitchens();
    } catch (error) {
      console.error("Error deleting kitchen:", error);
      toast.error("Lỗi khi xóa bếp.");
    } finally {
      setKitchenToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Quản lý Bếp</h1>
          <p className="text-zinc-500 mt-1">Danh sách các nhà ăn, bếp ăn thuộc hệ thống</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]"
        >
          <Plus weight="bold" />
          Thêm Bếp mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Đang tải dữ liệu...</div>
        ) : kitchens.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Chưa có bếp nào được tạo</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/50 text-zinc-500 font-medium border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4">Tên Bếp</th>
                  <th className="px-6 py-4">Vị trí</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-900">
                {kitchens.map((kitchen) => (
                  <tr key={kitchen.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">{kitchen.name}</td>
                    <td className="px-6 py-4 text-zinc-500">{kitchen.location || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md ${kitchen.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                        {kitchen.isActive ? "Hoạt động" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(kitchen)}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Sửa"
                        >
                          <PencilSimple weight="fill" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(kitchen.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-950">
                {editingId ? "Sửa thông tin Bếp" : "Thêm Bếp mới"}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors">
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Tên Bếp</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="VD: Bếp Đại đội 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Vị trí (Không bắt buộc)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="Khu nhà A"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-zinc-900 bg-zinc-50 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-zinc-900 select-none">
                  Đang hoạt động
                </label>
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
                >
                  {editingId ? "Cập nhật" : "Lưu Bếp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={kitchenToDelete !== null}
        title="Xóa bếp"
        message="Bạn có chắc chắn muốn xoá bếp này? Dữ liệu không thể khôi phục."
        confirmText="Xóa"
        onConfirm={executeDelete}
        onCancel={() => setKitchenToDelete(null)}
      />
    </div>
  );
}
