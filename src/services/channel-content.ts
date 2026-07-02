// Geração de conteúdo por canal — compartilhado entre preview e sending.
import type { CampaignFieldDraftInput } from "@/schemas/campaign";

export type CampaignChannelContent = CampaignFieldDraftInput;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}

function formatValidadeLabel(validade: string): string {
  const date = new Date(validade);
  if (Number.isNaN(date.getTime())) return validade.trim();
  return date.toLocaleDateString("pt-BR");
}

function appendBlock(lines: string[], block: string) {
  const trimmed = block.trim();
  if (!trimmed) return;
  if (lines.length > 0) lines.push("");
  lines.push(trimmed);
}

/// Monta mensagem WhatsApp com destaques (*negrito*), itálico, emojis e links.
export function gerarMensagemWhatsApp(conteudo: CampaignChannelContent): string {
  const lines: string[] = [];

  if (conteudo.titulo?.trim()) {
    lines.push(`*${conteudo.titulo.trim()}*`);
  }

  if (conteudo.subtitulo?.trim()) {
    appendBlock(lines, `_${conteudo.subtitulo.trim()}_`);
  }

  if (conteudo.texto?.trim()) {
    appendBlock(lines, conteudo.texto.trim());
  }

  const details: string[] = [];
  if (conteudo.preco?.trim()) {
    details.push(`💰 *Preço:* ${conteudo.preco.trim()}`);
  }
  if (conteudo.desconto?.trim()) {
    details.push(`🏷️ *Desconto:* ${conteudo.desconto.trim()}`);
  }
  if (conteudo.validade?.trim()) {
    details.push(`📅 *Validade:* ${formatValidadeLabel(conteudo.validade)}`);
  }

  if (details.length > 0) {
    appendBlock(lines, details.join("\n"));
  }

  if (conteudo.link?.trim()) {
    const linkBlock = conteudo.botao?.trim()
      ? `🔗 ${conteudo.link.trim()}\n_${conteudo.botao.trim()}_`
      : `🔗 ${conteudo.link.trim()}`;
    appendBlock(lines, linkBlock);
  }

  if (conteudo.observacoes?.trim()) {
    appendBlock(lines, conteudo.observacoes.trim());
  }

  return lines.join("\n").trim();
}

export type EmailHtmlOptions = {
  logoUrl?: string | null;
  footerText?: string;
};

/// Gera HTML de email moderno a partir do conteúdo estruturado (sem HTML do usuário).
export function gerarHtmlEmail(
  conteudo: CampaignChannelContent,
  options: EmailHtmlOptions = {},
): string {
  const bannerUrl = sanitizeUrl(conteudo.banner);
  const logoUrl = sanitizeUrl(options.logoUrl ?? conteudo.imagem);
  const ctaUrl = sanitizeUrl(conteudo.link);
  const footerText =
    options.footerText?.trim() ||
    conteudo.observacoes?.trim() ||
    "MG Marketing — comunicação interna";

  const titulo = escapeHtml(conteudo.titulo?.trim() || "Campanha");
  const subtitulo = conteudo.subtitulo?.trim()
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#64748b;">${escapeHtml(conteudo.subtitulo.trim())}</p>`
    : "";

  const bodyParagraphs = (conteudo.texto?.trim() || "")
    .split(/\n{2,}|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const detailRows: string[] = [];
  if (conteudo.preco?.trim()) {
    detailRows.push(
      `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Preço</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;text-align:right;">${escapeHtml(conteudo.preco.trim())}</td></tr>`,
    );
  }
  if (conteudo.desconto?.trim()) {
    detailRows.push(
      `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Desconto</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;text-align:right;">${escapeHtml(conteudo.desconto.trim())}</td></tr>`,
    );
  }
  if (conteudo.validade?.trim()) {
    detailRows.push(
      `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Validade</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;text-align:right;">${escapeHtml(formatValidadeLabel(conteudo.validade))}</td></tr>`,
    );
  }

  const detailsTable =
    detailRows.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse;">${detailRows.join("")}</table>`
      : "";

  const ctaButton =
    ctaUrl && conteudo.botao?.trim()
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;"><tr><td style="border-radius:8px;background:#0f172a;"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(conteudo.botao.trim())}</a></td></tr></table>`
      : "";

  const bannerBlock = bannerUrl
    ? `<tr><td><img src="${escapeHtml(bannerUrl)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" /></td></tr>`
    : "";

  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" width="120" style="display:block;max-width:120px;height:auto;margin:0 auto 20px;border:0;" />`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">
          ${bannerBlock}
          <tr>
            <td style="padding:32px 28px 28px;">
              ${logoBlock}
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:#0f172a;text-align:center;">${titulo}</h1>
              ${subtitulo}
              ${bodyParagraphs}
              ${detailsTable}
              ${ctaButton}
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:20px;">${escapeHtml(footerText)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type PhoneNormalizationResult =
  | { valid: true; normalized: string }
  | { valid: false; reason: string };

/// Normaliza telefone brasileiro para DDI 55 (apenas dígitos).
export function normalizarTelefoneWhatsApp(
  telefone: string | null | undefined,
): PhoneNormalizationResult {
  if (!telefone?.trim()) {
    return { valid: false, reason: "Telefone ausente" };
  }

  let digits = telefone.replace(/\D/g, "");
  if (!digits) {
    return { valid: false, reason: "Telefone inválido" };
  }

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  let normalized = digits;
  if (normalized.startsWith("55")) {
    // já inclui DDI
  } else if (normalized.length >= 10 && normalized.length <= 11) {
    normalized = `55${normalized}`;
  } else {
    normalized = `55${normalized}`;
  }

  if (!normalized.startsWith("55") || normalized.length < 12 || normalized.length > 13) {
    return { valid: false, reason: "Telefone inválido" };
  }

  return { valid: true, normalized };
}

/// Gera link wa.me com número normalizado e mensagem URL-encoded.
export function gerarLinkWaMe(telefoneNormalizado: string, mensagem: string): string {
  const encoded = encodeURIComponent(mensagem);
  return `https://wa.me/${telefoneNormalizado}?text=${encoded}`;
}

/// Link wa.me de exemplo para o preview (número fictício).
export function buildWaMePreviewUrl(message: string, phone = "5511999999999"): string {
  return gerarLinkWaMe(phone, message);
}
