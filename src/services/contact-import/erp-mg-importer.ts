// Placeholder de importação do ERP MG — integração real será implementada no futuro.
import type {
  ContactImportResult,
  ContactImporter,
} from "@/services/contact-import/types";

export class ErpMgImporter implements ContactImporter {
  async import(): Promise<ContactImportResult> {
    return {
      imported: 0,
      skipped: 0,
      errors: [],
      placeholder: true,
      message:
        "A integração com o ERP MG ainda não está disponível. Use a importação por CSV.",
    };
  }
}
