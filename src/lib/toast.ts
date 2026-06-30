import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  description?: string;
};

export const toast = {
  success(message: string, options?: ToastOptions) {
    sonnerToast.success(message, options);
  },
  error(message: string, options?: ToastOptions) {
    sonnerToast.error(message, options);
  },
  info(message: string, options?: ToastOptions) {
    sonnerToast.info(message, options);
  },
};
