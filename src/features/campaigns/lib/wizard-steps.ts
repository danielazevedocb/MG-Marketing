// Rótulos e metadados das etapas do wizard de campanha.
import type { WizardStep } from "@/schemas/campaign";

export const WIZARD_STEP_META: Record<
  WizardStep,
  { title: string; description: string }
> = {
  criar: {
    title: "Nome",
    description: "Dê um nome para identificar esta campanha.",
  },
  tipo: {
    title: "Tipo",
    description: "Escolha o tipo de conteúdo da campanha.",
  },
  template: {
    title: "Template",
    description: "Selecione um modelo como ponto de partida.",
  },
  conteudo: {
    title: "Conteúdo",
    description: "Edite os textos e detalhes da mensagem.",
  },
  imagem: {
    title: "Imagens",
    description: "Envie banner e imagem complementar.",
  },
  contatos: {
    title: "Contatos",
    description: "Selecione contatos individuais.",
  },
  grupos: {
    title: "Grupos",
    description: "Inclua grupos inteiros como destinatários.",
  },
  canal: {
    title: "Canal",
    description: "Defina WhatsApp, Email ou ambos.",
  },
  preview: {
    title: "Revisão",
    description: "Confira como a campanha ficará no WhatsApp e no Email.",
  },
  enviar: {
    title: "Enviar / Agendar",
    description: "Finalize ou agende para envio futuro.",
  },
};

export function getWizardStepIndex(step: WizardStep): number {
  const steps = Object.keys(WIZARD_STEP_META) as WizardStep[];
  return steps.indexOf(step);
}
