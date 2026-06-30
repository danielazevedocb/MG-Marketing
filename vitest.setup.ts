import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

Element.prototype.scrollIntoView = function scrollIntoView() {};

// Limpa o DOM renderizado após cada teste para evitar vazamento de estado.
afterEach(() => {
  cleanup();
});
