// Verifica os "magic bytes" do arquivo contra o MIME type declarado pelo cliente.
// O `Content-Type`/`file.type` do browser não é confiável (o cliente escolhe o
// valor); esta checagem confirma que o conteúdo real do arquivo é compatível
// com o tipo declarado antes de aceitá-lo para upload (ver security.md).

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWithBytes(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) return false;
  return signature.every((byte, index) => buffer[index] === byte);
}

function isJpeg(buffer: Buffer): boolean {
  return startsWithBytes(buffer, [0xff, 0xd8, 0xff]);
}

function isPng(buffer: Buffer): boolean {
  return startsWithBytes(buffer, PNG_SIGNATURE);
}

function isGif(buffer: Buffer): boolean {
  return (
    buffer.length >= 6 &&
    (buffer.toString("ascii", 0, 6) === "GIF87a" ||
      buffer.toString("ascii", 0, 6) === "GIF89a")
  );
}

function isWebp(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

function isPdf(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-";
}

// docx/xlsx são arquivos ZIP (OOXML); qualquer assinatura válida de ZIP local
// file header, central directory ou fim de arquivo vazio serve.
function isZipContainer(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    [0x03, 0x05, 0x07].includes(buffer[2]!)
  );
}

const SIGNATURE_CHECKS: Record<string, (buffer: Buffer) => boolean> = {
  "image/jpeg": isJpeg,
  "image/png": isPng,
  "image/gif": isGif,
  "image/webp": isWebp,
  "application/pdf": isPdf,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    isZipContainer,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    isZipContainer,
};

/**
 * Confirma que o conteúdo do arquivo corresponde ao MIME type declarado.
 * Tipos sem assinatura binária conhecida (ex.: `text/plain`) não são
 * verificados — retorna `true` para não bloquear indevidamente.
 */
export function matchesDeclaredMimeType(
  buffer: Buffer,
  mimeType: string,
): boolean {
  const check = SIGNATURE_CHECKS[mimeType];
  if (!check) return true;
  return check(buffer);
}
