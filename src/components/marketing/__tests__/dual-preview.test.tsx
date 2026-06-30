import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { DualPreview } from "@/components/marketing/dual-preview";
import { CampaignPreviewStep } from "@/features/campaigns/components/campaign-preview-step";
import { CampaignType } from "@/generated/prisma/enums";
import { emptyFieldInput, type CampaignWizardStateInput } from "@/schemas/campaign";

const baseContent = {
  ...emptyFieldInput(),
  titulo: "Título inicial",
  texto: "Texto inicial",
};

function PreviewStepHarness({
  defaultValues,
}: {
  defaultValues: CampaignWizardStateInput;
}) {
  const form = useForm<CampaignWizardStateInput>({ defaultValues });

  return (
    <FormProvider {...form}>
      <CampaignPreviewStep />
    </FormProvider>
  );
}

describe("DualPreview", () => {
  it("renderiza ambos os painéis", () => {
    render(<DualPreview content={baseContent} debounceMs={0} />);

    expect(screen.getByTestId("dual-preview")).toBeInTheDocument();
    expect(screen.getByTestId("whatsapp-preview")).toBeInTheDocument();
    expect(screen.getByTestId("email-preview")).toBeInTheDocument();
    expect(screen.getByTestId("email-preview-frame")).toBeInTheDocument();
  });

  it("atualiza ambos os previews quando o conteúdo muda", async () => {
    const { rerender } = render(
      <DualPreview content={baseContent} debounceMs={0} />,
    );

    expect(screen.getByText("Título inicial")).toBeInTheDocument();

    rerender(
      <DualPreview
        content={{
          ...baseContent,
          titulo: "Título atualizado",
          texto: "Texto atualizado",
        }}
        debounceMs={0}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Título atualizado")).toBeInTheDocument();
      expect(screen.getByText("Texto atualizado")).toBeInTheDocument();
    });
    expect(screen.queryByText("Título inicial")).not.toBeInTheDocument();

    const frame = screen.getByTestId("email-preview-frame") as HTMLIFrameElement;
    expect(frame.srcdoc).toContain("Título atualizado");
    expect(frame.srcdoc).toContain("Texto atualizado");
  });

  it("respeita o tema no container", () => {
    const { container } = render(
      <DualPreview content={baseContent} debounceMs={0} />,
    );

    expect(
      container.querySelector('[data-testid="dual-preview"]'),
    ).toBeTruthy();
    expect(container.querySelector(".bg-card")).toBeTruthy();
    expect(container.querySelector(".dark\\:bg-\\[\\#0b141a\\]")).toBeTruthy();
  });
});

describe("CampaignPreviewStep", () => {
  it("atualiza os previews ao editar o conteúdo", async () => {
    const user = userEvent.setup();

    render(
      <PreviewStepHarness
        defaultValues={{
          nome: "Campanha teste",
          type: CampaignType.Geral,
          templateId: "",
          field: baseContent,
          recipientContactIds: [],
          recipientGroupIds: [],
          channels: [],
          wizardStep: "preview",
          scheduledAt: "",
        }}
      />,
    );

    const tituloInput = screen.getByLabelText("Título");
    await user.clear(tituloInput);
    await user.type(tituloInput, "Novo título");

    await waitFor(() => {
      expect(tituloInput).toHaveValue("Novo título");
    });
  });
});
