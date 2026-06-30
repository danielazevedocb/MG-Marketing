// Abstração de importação de contatos — OCP para CSV e ERP MG futuro.
export type ImportRowError = {
  line: number;
  message: string;
};

export type ContactImportResult = {
  imported: number;
  skipped: number;
  errors: ImportRowError[];
  placeholder?: boolean;
  message?: string;
};

export interface ContactImporter {
  import(): Promise<ContactImportResult>;
}
