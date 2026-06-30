import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const useReducedMotionMock = vi.fn(() => false);

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react");
  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  };
});

import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";

describe("Dashboard motion accessibility", () => {
  it("BlurFade renderiza conteúdo estático com prefers-reduced-motion", () => {
    useReducedMotionMock.mockReturnValue(true);

    const { container } = render(
      <BlurFade>
        <p>Indicador</p>
      </BlurFade>,
    );

    expect(screen.getByText("Indicador")).toBeInTheDocument();
    expect(container.querySelector("[data-testid]")).toBeNull();
    expect(container.querySelector("div")).toBeTruthy();
  });

  it("MagicCard não renderiza gradiente animado com prefers-reduced-motion", () => {
    useReducedMotionMock.mockReturnValue(true);

    const { container } = render(
      <MagicCard>
        <p>Card</p>
      </MagicCard>,
    );

    expect(screen.getByText("Card")).toBeInTheDocument();
    expect(container.querySelector("[style*='radial-gradient']")).toBeNull();
  });

  it("NumberTicker exibe valor final sem animação com prefers-reduced-motion", () => {
    useReducedMotionMock.mockReturnValue(true);

    render(<NumberTicker value={42} />);

    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
