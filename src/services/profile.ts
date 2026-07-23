// Regras de negócio do perfil do próprio usuário — edição de nome e troca de senha.
import bcrypt from "bcryptjs";

import { ProfileValidationError } from "@/lib/profile-errors";
import { prisma } from "@/lib/prisma";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/schemas/profile";
import { auditLog } from "@/services/audit-log";

// Mesmo custo usado em `prisma/seed.ts` ao gerar o hash do admin inicial.
const BCRYPT_ROUNDS = 10;

export type ProfileDto = {
  name: string | null;
  email: string;
};

export class ProfileService {
  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<ProfileDto> {
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      throw new ProfileValidationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.data.name },
      select: { name: true, email: true },
    });

    await auditLog({
      actorId: userId,
      action: "profile.updated",
      entity: "User",
      entityId: userId,
      payload: {},
    });

    return user;
  }

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ): Promise<void> {
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) {
      throw new ProfileValidationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      throw new ProfileValidationError(
        "Este usuário não possui senha configurada.",
      );
    }

    const currentMatches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );
    if (!currentMatches) {
      throw new ProfileValidationError("Senha atual incorreta.");
    }

    const passwordHash = await bcrypt.hash(
      parsed.data.newPassword,
      BCRYPT_ROUNDS,
    );
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    await auditLog({
      actorId: userId,
      action: "profile.password_changed",
      entity: "User",
      entityId: userId,
      payload: {},
    });
  }
}

let serviceInstance: ProfileService | null = null;

export function getProfileService(): ProfileService {
  if (!serviceInstance) {
    serviceInstance = new ProfileService();
  }
  return serviceInstance;
}

export function resetProfileServiceForTests(): void {
  serviceInstance = null;
}
