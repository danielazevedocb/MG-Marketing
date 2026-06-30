// Schemas Zod de autenticação — validam toda entrada no servidor (e complementam o form).
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;
