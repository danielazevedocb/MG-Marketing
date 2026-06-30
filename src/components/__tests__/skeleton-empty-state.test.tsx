import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";

describe("Skeleton e empty states compartilhados", () => {
  it("ListSkeleton indica carregamento", () => {
    render(<ListSkeleton rows={3} />);

    expect(screen.getByLabelText("Carregando")).toBeInTheDocument();
    expect(screen.getByLabelText("Carregando")).toHaveAttribute("aria-busy", "true");
  });

  it("EmptyState exibe orientação e ação", () => {
    render(
      <EmptyState
        title="Nada por aqui"
        description="Cadastre o primeiro item para começar."
        action={<button type="button">Criar item</button>}
      />,
    );

    expect(screen.getByText("Nada por aqui")).toBeInTheDocument();
    expect(screen.getByText("Cadastre o primeiro item para começar.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar item" })).toBeInTheDocument();
  });
});
