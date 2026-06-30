import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TemplatePreview } from "@/features/templates/components/template-preview";
import { buildTemplatePreviewModel } from "@/features/templates/lib/preview-model";
import { TemplateType } from "@/generated/prisma/enums";

const baseContent = {
  titulo: "Título inicial",
  subtitulo: "",
  corpo: "Texto principal",
  ctaTexto: "",
  ctaUrl: "",
  bannerUrl: "",
  precoOriginal: "",
  precoPromocional: "",
  validade: "",
  nomeProduto: "",
  preco: "",
  destaque: "",
};

describe("buildTemplatePreviewModel", () => {
  it("reflete alterações de campos do editor", () => {
    const initial = buildTemplatePreviewModel(TemplateType.Geral, baseContent);
    expect(initial.titulo).toBe("Título inicial");

    const updated = buildTemplatePreviewModel(TemplateType.Geral, {
      ...baseContent,
      titulo: "Título atualizado",
      corpo: "Novo texto",
    });

    expect(updated.titulo).toBe("Título atualizado");
    expect(updated.corpo).toBe("Novo texto");
  });

  it("inclui campos de promoção quando o tipo é Promocao", () => {
    const model = buildTemplatePreviewModel(TemplateType.Promocao, {
      ...baseContent,
      precoOriginal: "R$ 100",
      precoPromocional: "R$ 80",
    });

    expect(model.sections).toEqual(
      expect.arrayContaining([
        { label: "Preço original", value: "R$ 100" },
        { label: "Preço promocional", value: "R$ 80" },
      ]),
    );
  });
});

describe("TemplatePreview", () => {
  it("renderiza o título atualizado na pré-visualização", () => {
    const { rerender } = render(
      <TemplatePreview type={TemplateType.Geral} content={baseContent} />,
    );

    expect(screen.getByText("Título inicial")).toBeInTheDocument();

    rerender(
      <TemplatePreview
        type={TemplateType.Geral}
        content={{ ...baseContent, titulo: "Título atualizado" }}
      />,
    );

    expect(screen.getByText("Título atualizado")).toBeInTheDocument();
    expect(screen.queryByText("Título inicial")).not.toBeInTheDocument();
  });
});
