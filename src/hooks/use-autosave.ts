"use client";

import { useEffect, useRef } from "react";

type UseAutosaveOptions<T> = {
  enabled?: boolean;
  delay?: number;
  onSave: (value: T) => Promise<boolean | void>;
  onSaving?: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

/// Autosave com debounce — evita escrita excessiva em formulários longos.
export function useAutosave<T>(
  value: T,
  {
    enabled = true,
    delay = 1500,
    onSave,
    onSaving,
    onSuccess,
    onError,
  }: UseAutosaveOptions<T>,
) {
  const onSaveRef = useRef(onSave);
  const onSavingRef = useRef(onSaving);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const lastSavedRef = useRef<string | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
    onSavingRef.current = onSaving;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!enabled) return;

    const serialized = JSON.stringify(value);
    if (serialized === lastSavedRef.current) return;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          onSavingRef.current?.();
          const result = await onSaveRef.current(value);
          if (result === false) return;
          lastSavedRef.current = serialized;
          onSuccessRef.current?.();
        } catch (error) {
          onErrorRef.current?.(error);
        }
      })();
    }, delay);

    return () => clearTimeout(timer);
  }, [value, enabled, delay]);
}
