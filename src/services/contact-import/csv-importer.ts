// Implementação CSV do ContactImporter — delega persistência ao serviço de contatos.
import type { ContactService } from "@/services/contacts";
import type {
  ContactImportResult,
  ContactImporter,
} from "@/services/contact-import/types";

export class CsvImporter implements ContactImporter {
  constructor(
    private readonly contactService: ContactService,
    private readonly content: string,
    private readonly actorId: string,
  ) {}

  async import(): Promise<ContactImportResult> {
    return this.contactService.importCsvContent(this.content, this.actorId);
  }
}
