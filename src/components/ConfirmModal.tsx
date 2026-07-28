import { WarningCircle } from "@phosphor-icons/react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <WarningCircle weight="fill" className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-950 mb-2">{title}</h3>
            <p className="text-sm text-zinc-500">{message}</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all active:scale-[0.98] shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
