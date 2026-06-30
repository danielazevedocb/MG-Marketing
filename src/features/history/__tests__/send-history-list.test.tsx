import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SendHistoryDto } from "@/actions/history";
import { SendHistoryList } from "@/features/history/components/send-history-list";
import { Channel, SendStatus } from "@/generated/prisma/enums";

const item: SendHistoryDto = {
  id: "history-1",
  sentAt: "2026-06-15T14:30:00.000Z",
  userId: "user-1",
  userName: "Maria",
  userEmail: "maria@mg.com",
  campaignId: "campaign-1",
  campaignName: "Campanha Verão",
  channel: Channel.WhatsApp,
  recipient: "+5511999999999",
  status: SendStatus.Enviado,
  returnMessage: "Entregue",
};

describe("SendHistoryList", () => {
  it("exibe todas as colunas previstas", () => {
    render(
      <SendHistoryList
        items={[item]}
        total={1}
        page={1}
        pageSize={20}
        isLoading={false}
        onPageChange={() => undefined}
      />,
    );

    expect(screen.getByText("Data/Hora")).toBeInTheDocument();
    expect(screen.getByText("Usuário")).toBeInTheDocument();
    expect(screen.getByText("Campanha")).toBeInTheDocument();
    expect(screen.getByText("Canal")).toBeInTheDocument();
    expect(screen.getByText("Destinatário")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Mensagem de retorno")).toBeInTheDocument();

    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getByText("Campanha Verão")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("+5511999999999")).toBeInTheDocument();
    expect(screen.getByText("Enviado")).toBeInTheDocument();
    expect(screen.getByText("Entregue")).toBeInTheDocument();
  });
});
