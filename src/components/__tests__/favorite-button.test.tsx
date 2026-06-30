import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FavoriteButton } from "@/components/favorite-button";

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/lib/toast", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

describe("FavoriteButton", () => {
  it("persiste favorito e notifica sucesso", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn().mockResolvedValue({ success: true });
    const onChanged = vi.fn();

    render(
      <FavoriteButton
        active={false}
        label="Template A"
        onToggle={onToggle}
        onChanged={onChanged}
      />,
    );

    await user.click(screen.getByRole("button", { name: /favoritar template a/i }));

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalled();
      expect(onChanged).toHaveBeenCalled();
      expect(toastSuccessMock).toHaveBeenCalledWith("Adicionado aos favoritos");
    });
  });
});
