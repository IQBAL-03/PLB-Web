'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-60 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const bgStyles = {
          success: 'bg-emerald-950 text-emerald-100 border-emerald-700/80',
          error: 'bg-rose-950 text-rose-100 border-rose-700/80',
          warning: 'bg-amber-950 text-amber-100 border-amber-700/80',
          info: 'bg-stone-900 text-stone-100 border-stone-700/80',
        }[t.type];

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-xl border shadow-xl text-xs backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${bgStyles}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {t.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
                {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {t.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
              </span>
              <div>
                {t.title && (
                  <p className="font-bold text-white text-xs mb-0.5">{t.title}</p>
                )}
                <p className="leading-relaxed whitespace-pre-line text-stone-200">{t.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="ml-3 text-stone-400 hover:text-white text-sm font-bold p-1 leading-none cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
