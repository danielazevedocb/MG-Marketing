// Landing page pública da campanha — hero no topo, imagem ao lado do texto e
// galeria em grade. Server Component; imagens usam ilhas client para fallback.
import { Badge } from "@/components/ui/badge";
import { LandingGallery } from "@/features/campaigns/components/landing-gallery";
import { LandingImage } from "@/features/campaigns/components/landing-image";
import type { LandingViewModel } from "@/features/campaigns/lib/landing-model";

type CampaignLandingProps = {
  model: LandingViewModel;
};

export function CampaignLanding({ model }: CampaignLandingProps) {
  return (
    <article className="mx-auto w-full max-w-5xl space-y-10 px-6 py-12 sm:py-16">
      {model.heroUrl ? (
        <LandingImage
          src={model.heroUrl}
          alt={model.titulo}
          className="bg-muted aspect-video w-full rounded-xl border object-cover"
        />
      ) : null}

      <div
        className={
          model.lateralUrl
            ? "grid items-center gap-10 md:grid-cols-2"
            : "mx-auto max-w-2xl"
        }
      >
        {model.lateralUrl ? (
          <LandingImage
            src={model.lateralUrl}
            alt={model.titulo}
            className="bg-muted aspect-4/3 w-full rounded-xl border object-cover"
          />
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

      <LandingGallery images={model.galeria} titulo={model.titulo} />
    </article>
  );
}
