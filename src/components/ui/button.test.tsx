import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renderiza o texto fornecido", () => {
    render(<Button>Salvar alterações</Button>);

    expect(
      screen.getByRole("button", { name: "Salvar alterações" }),
    ).toBeInTheDocument();
  });

  it("aplica a variante via classes utilitárias", () => {
    render(<Button variant="outline">Cancelar</Button>);

    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass(
      "border",
    );
  });
});
