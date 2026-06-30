// Utilitário de exportação CSV — escape seguro de valores.
export type CsvColumn<T extends Record<string, unknown>> = {
  key: keyof T & string;
  header: string;
  format?: (value: unknown, row: T) => string;
};

function escapeCsvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function recordsToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const raw = row[column.key];
          const formatted = column.format ? column.format(raw, row) : raw;
          return escapeCsvCell(formatted);
        })
        .join(","),
    )
    .join("\n");

  return body ? `${header}\n${body}` : header;
}
