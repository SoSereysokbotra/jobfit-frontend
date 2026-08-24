"use client";

import { useSyncExternalStore } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

let toasts: ToastMessage[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const toast = {
  show: (message: string, type: ToastType = "info", options?: { title?: string; duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      message,
      type,
      title: options?.title,
      duration: options?.duration ?? 4000,
    };

    toasts = [...toasts, newToast];
    notify();

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, newToast.duration);
    }

    return id;
  },

  success: (message: string, options?: { title?: string; duration?: number }) =>
    toast.show(message, "success", options),

  error: (message: string, options?: { title?: string; duration?: number }) =>
    toast.show(message, "error", options),

  info: (message: string, options?: { title?: string; duration?: number }) =>
    toast.show(message, "info", options),

  warning: (message: string, options?: { title?: string; duration?: number }) =>
    toast.show(message, "warning", options),

  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },

  clear: () => {
    toasts = [];
    notify();
  },
};

const EMPTY_TOASTS: ToastMessage[] = [];

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): ToastMessage[] {
  return toasts;
}

function getServerSnapshot(): ToastMessage[] {
  return EMPTY_TOASTS;
}

export function useToastStore(): ToastMessage[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
