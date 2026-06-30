// Serviço de busca global — agrega módulos respeitando RBAC no servidor.
import type { Role } from "@/generated/prisma/enums";
import { hasPermission } from "@/lib/permissions";
import { listCampaigns } from "@/repositories/campaign";
import { listContacts } from "@/repositories/contact";
import { listTemplates } from "@/repositories/template";
import { globalSearchSchema, type GlobalSearchInput } from "@/schemas/search";

export type GlobalSearchEntityType = "campaign" | "template" | "contact";

export type GlobalSearchItem = {
  id: string;
  type: GlobalSearchEntityType;
  title: string;
  subtitle?: string;
  href: string;
  favorite?: boolean;
};

export type GlobalSearchGroup = {
  type: GlobalSearchEntityType;
  label: string;
  items: GlobalSearchItem[];
};

export type GlobalSearchResponse = {
  groups: GlobalSearchGroup[];
  total: number;
};

const GROUP_LABELS: Record<GlobalSearchEntityType, string> = {
  campaign: "Campanhas",
  template: "Templates",
  contact: "Contatos",
};

export async function globalSearch(
  input: GlobalSearchInput,
  role: Role,
): Promise<GlobalSearchResponse> {
  const parsed = globalSearchSchema.parse(input);
  const term = parsed.query.trim();

  if (!term) {
    return { groups: [], total: 0 };
  }

  const groups: GlobalSearchGroup[] = [];
  const limit = parsed.limit;

  if (hasPermission(role, "campaigns:read")) {
    const { items } = await listCampaigns({ search: term, take: limit });
    if (items.length > 0) {
      groups.push({
        type: "campaign",
        label: GROUP_LABELS.campaign,
        items: items.map((campaign) => ({
          id: campaign.id,
          type: "campaign",
          title: campaign.nome,
          subtitle: campaign.status,
          href: `/campaigns/${campaign.id}/edit`,
        })),
      });
    }
  }

  if (hasPermission(role, "templates:read")) {
    const { items } = await listTemplates({ search: term, take: limit });
    if (items.length > 0) {
      groups.push({
        type: "template",
        label: GROUP_LABELS.template,
        items: items.map((template) => ({
          id: template.id,
          type: "template",
          title: template.nome,
          subtitle: template.category ?? undefined,
          href: `/templates/${template.id}/edit`,
          favorite: template.favorite,
        })),
      });
    }
  }

  if (hasPermission(role, "contacts:read")) {
    const { items } = await listContacts({ search: term, take: limit });
    if (items.length > 0) {
      groups.push({
        type: "contact",
        label: GROUP_LABELS.contact,
        items: items.map((contact) => ({
          id: contact.id,
          type: "contact",
          title: contact.empresa,
          subtitle: contact.nome ?? contact.email ?? undefined,
          href: `/contacts/${contact.id}/edit`,
        })),
      });
    }
  }

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  return { groups, total };
}
