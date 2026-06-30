import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

import { useAutosave } from "@/hooks/use-autosave";

function AutosaveProbe({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => Promise<boolean>;
}) {
  useAutosave(value, {
    enabled: true,
    delay: 500,
    onSave,
  });
  return null;
}

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("salva com debounce e evita gravações duplicadas", async () => {
    const onSave = vi.fn().mockResolvedValue(true);

    const { rerender } = render(<AutosaveProbe value="alpha" onSave={onSave} />);
    rerender(<AutosaveProbe value="alpha beta" onSave={onSave} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("alpha beta");

    rerender(<AutosaveProbe value="alpha beta" onSave={onSave} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
