// Executa `fn` para cada item de `items` com no máximo `limit` chamadas em paralelo.
// Preserva a ordem dos resultados (igual a `Promise.all`), mas evita disparar tudo de
// uma vez — usado no envio de campanhas para não estourar timeout de função serverless
// nem sobrecarregar o provedor de email/SMTP com listas grandes de destinatários.
export async function mapWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= items.length) {
        return;
      }
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}
