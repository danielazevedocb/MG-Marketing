import { describe, expect, it } from "vitest";

import { parseCsvContent } from "@/utils/csv-parser";

describe("parseCsvContent", () => {
  it("interpreta cabeçalhos e linhas com campos entre aspas", () => {
    const content = `empresa,telefone,email,status,nome
"MG Indústria","11999990000","ana@mg.com",Ativo,"Ana Silva"`;

    const result = parseCsvContent(content);

    expect(result.headers).toEqual([
      "empresa",
      "telefone",
      "email",
      "status",
      "nome",
    ]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      empresa: "MG Indústria",
      telefone: "11999990000",
      email: "ana@mg.com",
      status: "Ativo",
      nome: "Ana Silva",
    });
  });

  it("retorna vazio para conteúdo em branco", () => {
    expect(parseCsvContent("   ")).toEqual({ headers: [], rows: [] });
  });
});
