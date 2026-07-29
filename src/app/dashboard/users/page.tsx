"use client";

import { useEffect, useState } from "react";
import { getUsers, getUserById, createUser, updateUser, deleteUser, User } from "@/services/users.service";
import { getKitchens, Kitchen } from "@/services/kitchens.service";
import { getBotInfo } from "@/services/telegram.service";
import { Plus, PencilSimple, Trash, X, User as UserIcon, Link as LinkIcon, LinkBreak, CheckCircle, WarningCircle, Storefront } from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [botInfo, setBotInfo] = useState<{ botLink: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [qrModalUser, setQrModalUser] = useState<User | null>(null);
  const [isLinkingSuccess, setIsLinkingSuccess] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userToUnlink, setUserToUnlink] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ username: "", password: "", fullName: "", role: "MANAGER", isActive: true });
  const [selectedKitchens, setSelectedKitchens] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, kitchensData, botData] = await Promise.all([
        getUsers(),
        getKitchens(),
        getBotInfo().catch(() => null)
      ]);
      setUsers(usersData);
      setKitchens(kitchensData.filter(k => k.isActive));
      if (botData) setBotInfo(botData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrModalUser && !isLinkingSuccess) {
      interval = setInterval(async () => {
        try {
          const updatedUser = await getUserById(qrModalUser.id);
          if (updatedUser && updatedUser.telegramChatId) {
            setIsLinkingSuccess(true);
            fetchData();
            setTimeout(() => {
              setQrModalUser(null);
              setIsLinkingSuccess(false);
            }, 2000);
          }
        } catch (error) {
          // Ignore polling errors
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrModalUser, isLinkingSuccess]);

  const openModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({ username: user.username, password: "", fullName: user.fullName || "", role: user.role, isActive: user.isActive });
      setSelectedKitchens(user.managerKitchens?.map(mk => mk.kitchen.id) || []);
    } else {
      setEditingId(null);
      setFormData({ username: "", password: "", fullName: "", role: "MANAGER", isActive: true });
      setSelectedKitchens([]);
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
      const payload: any = { ...formData, kitchenIds: selectedKitchens };
      if (editingId && !payload.password) {
        delete payload.password; // không cập nhật password nếu để trống khi sửa
      }

      if (editingId) {
        await updateUser(editingId, payload);
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await createUser(payload);
        toast.success("Tạo tài khoản thành công!");
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Đã xảy ra lỗi khi lưu thông tin tài khoản.");
    }
  };

  const handleDelete = (id: number) => {
    setUserToDelete(id);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete);
      toast.success("Đã xóa tài khoản.");
      fetchData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Lỗi khi xóa tài khoản.");
    } finally {
      setUserToDelete(null);
    }
  };

  const handleUnlinkTelegram = (id: number) => {
    setUserToUnlink(id);
  };

  const executeUnlink = async () => {
    if (!userToUnlink) return;
    try {
      await updateUser(userToUnlink, { telegramChatId: null });
      toast.success("Hủy liên kết Telegram thành công!");
      fetchData();
    } catch (error) {
      console.error("Error unlinking telegram:", error);
      toast.error("Lỗi khi hủy liên kết.");
    } finally {
      setUserToUnlink(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Người dùng</h1>
          <p className="text-zinc-500 mt-1">Quản lý tài khoản truy cập hệ thống</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]"
        >
          <Plus weight="bold" />
          Tạo tài khoản mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Đang tải dữ liệu...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm font-medium">Chưa có tài khoản nào được tạo</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50/50 text-zinc-500 font-medium border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4">Tài khoản</th>
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Phân quyền</th>
                  <th className="px-6 py-4">Bếp phụ trách</th>
                  <th className="px-6 py-4">Telegram</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-900">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                          <UserIcon weight="fill" className="w-4 h-4 text-zinc-500" />
                        </div>
                        <span className="font-semibold">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{user.fullName || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md ${
                        user.role === 'ADMIN' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'MANAGER' && user.managerKitchens && user.managerKitchens.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {user.managerKitchens.map(mk => (
                            <span key={mk.kitchen.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200/50 rounded text-[11px] font-medium whitespace-nowrap">
                              <Storefront weight="fill" className="w-3 h-3" />
                              {mk.kitchen.name}
                            </span>
                          ))}
                        </div>
                      ) : user.role === 'ADMIN' ? (
                        <span className="text-xs text-zinc-400 font-medium">Tất cả bếp</span>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Chưa gán</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.telegramChatId ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle weight="fill" className="w-4 h-4" />
                          <span className="text-xs font-medium">Đã kết nối</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <WarningCircle weight="fill" className="w-4 h-4" />
                          <span className="text-xs font-medium">Chưa kết nối</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Sửa"
                        >
                          <PencilSimple weight="fill" className="w-4 h-4" />
                        </button>
                        {user.telegramChatId ? (
                          <button
                            onClick={() => handleUnlinkTelegram(user.id)}
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Hủy liên kết Telegram"
                          >
                            <LinkBreak weight="bold" className="w-4 h-4" />
                          </button>
                        ) : (
                          botInfo && (
                            <button
                              onClick={() => setQrModalUser(user)}
                              className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lấy mã kết nối Telegram"
                            >
                              <LinkIcon weight="bold" className="w-4 h-4" />
                            </button>
                          )
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa"
                          disabled={user.username === 'admin'}
                        >
                          <Trash weight="fill" className={`w-4 h-4 ${user.username === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`} />
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
                {editingId ? "Sửa thông tin tài khoản" : "Tạo tài khoản mới"}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors">
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Tên đăng nhập</label>
                <input
                  type="text"
                  required
                  disabled={!!editingId}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Mật khẩu {editingId && <span className="text-zinc-400 font-normal">(Bỏ trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Phân quyền</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                >
                  <option value="MANAGER">Quản lý (MANAGER)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>

              {formData.role === "MANAGER" && (
                <div className="pt-2 border-t border-zinc-100">
                  <label className="block text-sm font-medium text-zinc-900 mb-3">Bếp phụ trách</label>
                  {kitchens.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">Chưa có bếp nào hoạt động.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-2">
                      {kitchens.map(kitchen => (
                        <label key={kitchen.id} className="flex items-start gap-2.5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedKitchens.includes(kitchen.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedKitchens([...selectedKitchens, kitchen.id]);
                              } else {
                                setSelectedKitchens(selectedKitchens.filter(id => id !== kitchen.id));
                              }
                            }}
                            className="w-4 h-4 mt-0.5 text-zinc-900 bg-white border-zinc-300 rounded focus:ring-zinc-900"
                          />
                          <span className="text-sm font-medium text-zinc-900 leading-tight">
                            {kitchen.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                <input
                  type="checkbox"
                  id="isActiveUser"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-zinc-900 bg-zinc-50 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="isActiveUser" className="text-sm font-medium text-zinc-900 select-none">
                  Tài khoản đang hoạt động
                </label>
              </div>
              
              <div className="pt-4 mt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
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
                  {editingId ? "Cập nhật" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal for Telegram */}
      {qrModalUser && botInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-950">
                Mã kết nối Telegram
              </h3>
              <button onClick={() => { setQrModalUser(null); setIsLinkingSuccess(false); }} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors">
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              {isLinkingSuccess ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle weight="fill" className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-zinc-900">Liên kết thành công!</h4>
                  <p className="text-sm text-zinc-500 text-center max-w-[200px]">Đang tự động đóng cửa sổ...</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
                    <QRCodeSVG
                      value={`${botInfo.botLink}?start=${qrModalUser.id}`}
                      size={200}
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-zinc-900">
                      Tài khoản: {qrModalUser.username}
                    </p>
                    <p className="text-xs text-zinc-500 max-w-[260px] mx-auto">
                      Sử dụng ứng dụng Telegram trên điện thoại để quét mã QR này và liên kết tài khoản.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={userToDelete !== null}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xoá tài khoản này? Dữ liệu không thể khôi phục."
        confirmText="Xóa"
        onConfirm={executeDelete}
        onCancel={() => setUserToDelete(null)}
      />

      <ConfirmModal
        isOpen={userToUnlink !== null}
        title="Hủy liên kết Telegram"
        message="Bạn có chắc chắn muốn hủy liên kết Telegram của tài khoản này?"
        confirmText="Hủy liên kết"
        onConfirm={executeUnlink}
        onCancel={() => setUserToUnlink(null)}
      />
    </div>
  );
}
