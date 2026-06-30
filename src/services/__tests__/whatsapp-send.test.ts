import { describe, expect, it } from "vitest";

import { emptyFieldInput } from "@/schemas/campaign";
import {
  gerarLinkWaMe,
  normalizarTelefoneWhatsApp,
} from "@/services/channel-content";
import {
  generateWaMeLinkForPhone,
  processWhatsAppRecipient,
} from "@/services/whatsapp-send";

const sampleContent = {
  ...emptyFieldInput(),
  titulo: "Oferta especial",
  texto: "Confira nossas novidades.",
};

describe("normalizarTelefoneWhatsApp e gerarLinkWaMe", () => {
  it("gera link wa.me com número normalizado e mensagem codificada", () => {
    const normalized = normalizarTelefoneWhatsApp("(11) 98888-7777");
    expect(normalized.valid).toBe(true);
    if (!normalized.valid) return;

    expect(normalized.normalized).toBe("5511988887777");

    const message = "Olá *mundo*";
    const url = gerarLinkWaMe(normalized.normalized, message);

    expect(url).toBe(
      `https://wa.me/5511988887777?text=${encodeURIComponent(message)}`,
    );
  });

  it("aceita número já com DDI 55", () => {
    const normalized = normalizarTelefoneWhatsApp("5511988887777");
    expect(normalized).toEqual({ valid: true, normalized: "5511988887777" });
  });

  it("sinaliza telefone inválido", () => {
    expect(normalizarTelefoneWhatsApp("123")).toEqual({
      valid: false,
      reason: "Telefone inválido",
    });
    expect(normalizarTelefoneWhatsApp("")).toEqual({
      valid: false,
      reason: "Telefone ausente",
    });
  });
});

describe("processWhatsAppRecipient", () => {
  it("registra falha para telefone inválido", () => {
    const result = processWhatsAppRecipient(
      { contactId: "contact-1", telefone: "123" },
      sampleContent,
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.contactId).toBe("contact-1");
    expect(result.message).toBe("Telefone inválido");
  });

  it("gera link wa.me para telefone válido", () => {
    const link = generateWaMeLinkForPhone("(11) 98888-7777", sampleContent);
    expect(link.success).toBe(true);
    if (!link.success) return;

    expect(link.waMeUrl).toContain("https://wa.me/5511988887777?text=");
    expect(link.message).toContain("*Oferta especial*");
  });
});
