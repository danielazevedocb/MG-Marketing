// Route Handler de upload — alternativa REST protegida por auth/RBAC.
import { NextResponse } from "next/server";

import { toAuthErrorResponse } from "@/lib/auth-response";
import {
  FileValidationError,
  StorageOperationError,
} from "@/lib/file-errors";
import { fileAssetTypeSchema } from "@/schemas/file-upload";
import { requirePermission } from "@/services/auth";
import { getFileStorageService } from "@/services/file-storage";

export async function POST(request: Request) {
  try {
    const user = await requirePermission("files:write");
    const formData = await request.formData();

    const file = formData.get("file");
    const typeRaw = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 },
      );
    }

    const typeParsed = fileAssetTypeSchema.safeParse(typeRaw);
    if (!typeParsed.success) {
      return NextResponse.json(
        { error: "Tipo de arquivo inválido." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    const result = await getFileStorageService().uploadAndPersist({
      buffer,
      originalName: file.name,
      mimeType,
      type: typeParsed.data,
      uploadedById: user.id,
    });

    return NextResponse.json({
      fileAsset: {
        id: result.fileAsset.id,
        url: result.fileAsset.url,
        type: result.fileAsset.type,
        filename: result.fileAsset.filename,
        mimeType: result.fileAsset.mimeType,
        size: result.fileAsset.size,
        width: result.fileAsset.width,
        height: result.fileAsset.height,
      },
    });
  } catch (error) {
    if (error instanceof FileValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof StorageOperationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const authResponse = toAuthErrorResponse(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    return NextResponse.json(
      { error: "Não foi possível enviar o arquivo." },
      { status: 500 },
    );
  }
}
