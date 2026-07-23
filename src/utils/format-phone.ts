/** Formata telefone BR enquanto o usuário digita: (11) 99999-0000 / (11) 9999-0000. */
export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) return `(${ddd}) ${rest}`;

  const isCelular = rest.length > 8;
  const splitAt = isCelular ? 5 : 4;
  const prefix = rest.slice(0, splitAt);
  const suffix = rest.slice(splitAt);

  return suffix ? `(${ddd}) ${prefix}-${suffix}` : `(${ddd}) ${prefix}`;
}
