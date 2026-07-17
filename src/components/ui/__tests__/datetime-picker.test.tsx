import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateTimePicker } from "@/components/ui/datetime-picker";

describe("DateTimePicker", () => {
  it("mostra o placeholder quando não há valor", () => {
    render(<DateTimePicker value="" onChange={vi.fn()} />);
    expect(screen.getByText("Selecione data e hora")).toBeInTheDocument();
  });

  it("formata o valor selecionado em pt-BR (data e hora)", () => {
    render(
      <DateTimePicker value="2026-03-15T14:30:00.000Z" onChange={vi.fn()} />,
    );
    // Formatação usa o horário local do ambiente de teste; verifica só a parte da data.
    expect(screen.getByText(/15\/03\/2026/)).toBeInTheDocument();
  });

  it("botão 'Agora' emite um ISO datetime e fecha o popover", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value=""
        onChange={onChange}
        placeholder="Escolher data e hora"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Escolher data e hora" }),
    );
    await user.click(screen.getByRole("button", { name: "Agora" }));

    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    );
  });

  it("botão 'Limpar' emite string vazia", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateTimePicker value="2026-03-15T14:30:00.000Z" onChange={onChange} />,
    );

    await user.click(screen.getByText(/15\/03\/2026/));
    await user.click(screen.getByRole("button", { name: "Limpar" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("exibe os seletores de hora e minuto ao abrir", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker value="" onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: "Selecione data e hora" }),
    );

    expect(screen.getByText("Hora")).toBeInTheDocument();
    expect(screen.getByText("Minuto")).toBeInTheDocument();
  });

  it("respeita a prop disabled", () => {
    render(<DateTimePicker value="" onChange={vi.fn()} disabled />);
    expect(
      screen.getByRole("button", { name: "Selecione data e hora" }),
    ).toBeDisabled();
  });
});
