// Erros de validação e storage de arquivos (servidor).

export class FileValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

export class StorageOperationError extends Error {
  readonly status = 500;

  constructor(message = "Falha ao processar arquivo") {
    super(message);
    this.name = "StorageOperationError";
  }
}
