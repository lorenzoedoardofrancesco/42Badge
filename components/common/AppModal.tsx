import { useState, useCallback } from "react";

export type ModalConfig = {
  title: string;
  message?: string;
  icon?: "alert" | "trash" | "info";
  confirmLabel?: string;
  confirmVariant?: "red" | "green" | "neutral";
  cancelLabel?: string;
  onConfirm?: () => void;
};

export function AppModal({ config, onClose }: { config: ModalConfig; onClose: () => void }) {
  const { title, message, icon = "info", confirmLabel, confirmVariant = "neutral", cancelLabel, onConfirm } = config;
  const isAlert = !onConfirm;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm mx-4 rounded-xl border bg-neutral-900 border-neutral-700 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-5">
          {icon === "trash" && (
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
          )}
          {icon === "alert" && (
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          )}
          {icon === "info" && (
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-neutral-100">{title}</p>
            {message && <p className="text-xs text-neutral-500 mt-0.5">{message}</p>}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          {!isAlert && (
            <button onClick={onClose} className="px-4 py-1.5 text-xs rounded-md border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors">
              {cancelLabel ?? "Cancel"}
            </button>
          )}
          <button
            onClick={() => { onConfirm?.(); onClose(); }}
            className={`px-4 py-1.5 text-xs rounded-md font-medium transition-colors text-white ${
              confirmVariant === "red" ? "bg-red-600 hover:bg-red-500" :
              confirmVariant === "green" ? "bg-green-600 hover:bg-green-500" :
              "bg-neutral-700 hover:bg-neutral-600"
            }`}
          >
            {confirmLabel ?? "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useModal() {
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const show = useCallback((config: ModalConfig) => setModal(config), []);
  const hide = useCallback(() => setModal(null), []);
  const node = modal ? <AppModal config={modal} onClose={hide} /> : null;
  return { show, node };
}
