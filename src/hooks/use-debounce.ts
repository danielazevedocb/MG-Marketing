"use client";

import { useEffect, useState } from "react";

/// Retorna o valor com atraso — útil para busca instantânea sem sobrecarregar o servidor.
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
