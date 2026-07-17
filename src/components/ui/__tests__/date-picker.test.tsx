import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "@/components/ui/date-picker";
import { toDateOnlyString } from "@/lib/date-format";

describe("DatePicker", () => {
  it("mostra o placeholder quando não há valor", () => {
    render(<DatePicker value="" onChange={vi.fn()} />);
    expect(screen.getByText("Selecione a data")).toBeInTheDocument();
  });

  it("formata o valor selecionado em pt-BR", () => {
    render(<DatePicker value="2026-03-15" onChange={vi.fn()} />);
    expect(screen.getByText("15/03/2026")).toBeInTheDocument();
  });

  it("botão 'Hoje' define a data atual e fecha o popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="" onChange={onChange} placeholder="Escolher" />);

    await user.click(screen.getByRole("button", { name: "Escolher" }));
    await user.click(screen.getByRole("button", { name: "Hoje" }));

    expect(onChange).toHaveBeenCalledWith(toDateOnlyString(new Date()));
  });

  it("botão 'Limpar' emite string vazia", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-03-15" onChange={onChange} />);

    await user.click(screen.getByText("15/03/2026"));
    await user.click(screen.getByRole("button", { name: "Limpar" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("respeita a prop disabled", () => {
    render(<DatePicker value="" onChange={vi.fn()} disabled />);
    expect(
      screen.getByRole("button", { name: "Selecione a data" }),
    ).toBeDisabled();
  });
});
