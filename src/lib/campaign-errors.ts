// Erros de domínio de campanhas — mensagens claras para o usuário.
export class CampaignValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignValidationError";
  }
}

export class CampaignWizardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampaignWizardError";
  }
}
