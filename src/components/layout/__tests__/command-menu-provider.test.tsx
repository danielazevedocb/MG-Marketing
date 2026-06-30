import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/actions/search", () => ({
  globalSearchAction: vi.fn().mockResolvedValue({ success: true, data: { groups: [], total: 0 } }),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { CommandMenuProvider } from "@/components/layout/command-menu-provider";

describe("CommandMenuProvider", () => {
  it("abre o menu com Ctrl+K", async () => {
    const user = userEvent.setup();

    render(
      <CommandMenuProvider>
        <div>Aplicação</div>
      </CommandMenuProvider>,
    );

    expect(screen.queryByPlaceholderText(/buscar campanhas/i)).not.toBeInTheDocument();

    await user.keyboard("{Control>}k{/Control}");

    expect(await screen.findByPlaceholderText(/buscar campanhas/i)).toBeInTheDocument();
  });
});
