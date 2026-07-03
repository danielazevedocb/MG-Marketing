// Landing page pública da campanha — imagem de um lado, conteúdo do outro.
// Server Component puro: sem estado, sem HTTP; recebe o view-model pronto.
import { Badge } from "@/components/ui/badge";
import type { LandingViewModel } from "@/features/campaigns/lib/landing-model";

type CampaignLandingProps = {
  model: LandingViewModel;
};

export function CampaignLanding({ model }: CampaignLandingProps) {
  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
      <div
        className={
          model.imagemUrl
            ? "grid items-center gap-10 md:grid-cols-2"
            : "mx-auto max-w-2xl"
        }
      >
        {model.imagemUrl ? (
          <div className="bg-muted overflow-hidden rounded-xl border">
            {/* Imagem externa (R2/URL do usuário) — next/image exigiria allowlist de domínios. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={model.imagemUrl}
              alt={model.titulo}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-5">
          <Badge variant="secondary">{model.typeLabel}</Badge>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {model.titulo}
          </h1>

          {model.subtitulo ? (
            <p className="text-muted-foreground text-lg">{model.subtitulo}</p>
          ) : null}

          <div className="space-y-3 text-base leading-relaxed">
            {model.paragrafos.map((paragrafo, index) => (
              <p key={index}>{paragrafo}</p>
            ))}
          </div>

          {model.detalhes.length > 0 ? (
            <dl className="bg-card grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
              {model.detalhes.map((detalhe) => (
                <div key={detalhe.label}>
                  <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {detalhe.label}
                  </dt>
                  <dd className="text-sm font-semibold">{detalhe.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {model.observacoes ? (
            <p className="text-muted-foreground text-sm">{model.observacoes}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
