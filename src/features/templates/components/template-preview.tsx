"use client";

import Image from "next/image";

import { buildTemplatePreviewModel } from "@/features/templates/lib/preview-model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemplateType } from "@/generated/prisma/enums";
import type { TemplateContentInput } from "@/schemas/template";

type TemplatePreviewProps = {
  type: TemplateType;
  content: TemplateContentInput;
  className?: string;
};

export function TemplatePreview({ type, content, className }: TemplatePreviewProps) {
  const model = buildTemplatePreviewModel(type, content);

  return (
    <div
      className={`bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm ${className ?? ""}`}
      data-testid="template-preview"
    >
      {model.bannerUrl ? (
        <div className="bg-muted relative aspect-[2.4/1] w-full">
          <Image
            src={model.bannerUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
            unoptimized
          />
        </div>
      ) : null}

      <div className="min-w-0 space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{model.typeLabel}</Badge>
        </div>

        <div className="space-y-2">
          <h3 className="break-words text-xl font-semibold tracking-tight">
            {model.titulo}
          </h3>
          {model.subtitulo ? (
            <p className="text-muted-foreground break-words text-sm">{model.subtitulo}</p>
          ) : null}
        </div>

        {model.sections.length > 0 ? (
          <dl className="grid min-w-0 gap-2 rounded-lg border p-3 text-sm">
            {model.sections.map((section) => (
              <div key={section.label} className="flex min-w-0 justify-between gap-3">
                <dt className="text-muted-foreground shrink-0">{section.label}</dt>
                <dd className="min-w-0 break-words text-right font-medium">
                  {section.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
          {model.corpo}
        </p>

        {model.ctaTexto ? (
          <Button type="button" size="sm" className="pointer-events-none">
            {model.ctaTexto}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
