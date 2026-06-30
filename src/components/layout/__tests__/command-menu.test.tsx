import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const globalSearchActionMock = vi.fn();

vi.mock("@/actions/search", () => ({
  globalSearchAction: (...args: unknown[]) => globalSearchActionMock(...args),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { CommandMenu } from "@/components/layout/command-menu";

describe("CommandMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalSearchActionMock.mockResolvedValue({
      success: true,
      data: {
        groups: [
          {
            type: "campaign",
            label: "Campanhas",
            items: [
              {
                id: "c1",
                type: "campaign",
                title: "Campanha Verão",
                href: "/campaigns/c1/edit",
              },
            ],
          },
        ],
        total: 1,
      },
    });
  });

  it("abre e permite buscar resultados", async () => {
    const user = userEvent.setup();

    render(<CommandMenu open onOpenChange={vi.fn()} />);

    const input = screen.getByPlaceholderText(/buscar campanhas/i);
    await user.type(input, "verão");

    await waitFor(() => {
      expect(globalSearchActionMock).toHaveBeenCalled();
    });

    expect(await screen.findByText("Campanha Verão")).toBeInTheDocument();
  });

  it("navega com Enter ao selecionar item", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<CommandMenu open onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText(/buscar campanhas/i), "ver");
    const item = await screen.findByText("Campanha Verão");
    await user.click(item);

    expect(pushMock).toHaveBeenCalledWith("/campaigns/c1/edit");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
