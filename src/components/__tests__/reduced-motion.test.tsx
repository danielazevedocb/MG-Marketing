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

describe("prefers-reduced-motion", () => {
  it("BlurFade mantém conteúdo visível sem animação", () => {
    useReducedMotionMock.mockReturnValue(true);

    render(
      <BlurFade>
        <p>Conteúdo acessível</p>
      </BlurFade>,
    );

    expect(screen.getByText("Conteúdo acessível")).toBeInTheDocument();
  });
});
