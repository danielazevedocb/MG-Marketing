import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { RecentSendsList } from "@/components/dashboard/recent-sends-list";
import { ScheduledCampaignsList } from "@/components/dashboard/scheduled-campaigns-list";
import { SendsChart } from "@/components/dashboard/sends-chart";

describe("Dashboard empty states", () => {
  it("exibe estado vazio quando não há envios recentes", () => {
    render(<RecentSendsList items={[]} />);

    expect(screen.getByText("Nenhum envio registrado")).toBeInTheDocument();
    expect(
      screen.getByText(/Quando campanhas forem disparadas/i),
    ).toBeInTheDocument();
  });

  it("exibe estado vazio quando não há campanhas agendadas", () => {
    render(<ScheduledCampaignsList items={[]} />);

    expect(screen.getByText("Nenhuma campanha agendada")).toBeInTheDocument();
  });

  it("exibe estado vazio na timeline sem atividade", () => {
    render(<ActivityTimeline items={[]} />);

    expect(screen.getByText("Nenhuma atividade recente")).toBeInTheDocument();
  });

  it("exibe estado vazio no gráfico sem envios no período", () => {
    render(
      <SendsChart
        data={[
          { date: "2026-06-29", count: 0 },
          { date: "2026-06-30", count: 0 },
        ]}
      />,
    );

    expect(screen.getByText("Sem envios no período")).toBeInTheDocument();
  });
});
