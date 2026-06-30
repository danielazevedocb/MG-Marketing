import { describe, expect, it } from "vitest";

import { emptyFieldInput } from "@/schemas/campaign";
import {
  escapeHtml,
  gerarHtmlEmail,
  gerarMensagemWhatsApp,
} from "@/services/channel-content";

const sampleContent = {
  ...emptyFieldInput(),
  titulo: "Oferta especial 🔥",
  subtitulo: "Só esta semana",
  texto: "Confira nossas novidades.\nSegunda linha com destaque.",
  preco: "199,90",
  desconto: "20%",
  validade: "2026-12-31",
  link: "https://mg.com.br/promo",
  botao: "Ver oferta",
  observacoes: "Sujeito a disponibilidade.",
  banner: "https://cdn.example.com/banner.jpg",
  imagem: "https://cdn.example.com/logo.png",
};

describe("gerarMensagemWhatsApp", () => {
  it("formata emojis, quebras, destaques e links corretamente", () => {
    const message = gerarMensagemWhatsApp(sampleContent);

    expect(message).toContain("*Oferta especial 🔥*");
    expect(message).toContain("_Só esta semana_");
    expect(message).toContain("Confira nossas novidades.");
    expect(message).toContain("Segunda linha com destaque.");
    expect(message).toContain("💰 *Preço:* 199,90");
    expect(message).toContain("🏷️ *Desconto:* 20%");
    expect(message).toContain("📅 *Validade:*");
    expect(message).toContain("https://mg.com.br/promo");
    expect(message).toContain("_Ver oferta_");
    expect(message).toContain("Sujeito a disponibilidade.");
  });

  it("preserva quebras de linha do texto principal", () => {
    const message = gerarMensagemWhatsApp({
      ...emptyFieldInput(),
      titulo: "Título",
      texto: "Linha 1\nLinha 2",
    });

    expect(message).toContain("Linha 1\nLinha 2");
  });
});

describe("gerarHtmlEmail", () => {
  it("produz HTML com seções esperadas", () => {
    const html = gerarHtmlEmail(sampleContent);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("https://cdn.example.com/banner.jpg");
    expect(html).toContain("https://cdn.example.com/logo.png");
    expect(html).toContain("Oferta especial");
    expect(html).toContain("Só esta semana");
    expect(html).toContain("Confira nossas novidades.");
    expect(html).toContain("Ver oferta");
    expect(html).toContain("Sujeito a disponibilidade.");
    expect(html).toContain("Preço");
    expect(html).toContain("199,90");
  });

  it("sanitiza conteúdo malicioso", () => {
    const html = gerarHtmlEmail({
      ...emptyFieldInput(),
      titulo: '<script>alert("xss")</script>',
      texto: "<img src=x onerror=alert(1)>",
      link: "javascript:alert(1)",
      botao: "<b>Clique</b>",
    });

    expect(html).not.toContain("<script>");
    expect(html).not.toMatch(/<img[^>]*>/i);
    expect(html).not.toContain("javascript:");
    expect(html).toContain(escapeHtml('<script>alert("xss")</script>'));
    expect(html).toContain(escapeHtml("<img src=x onerror=alert(1)>"));
    expect(html).not.toContain("<b>Clique</b>");
  });
});
