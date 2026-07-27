// Landing page pública da campanha — logo em barra de cabeçalho no topo,
// depois layout "blog": explicação em cima, vídeo/fotos em sequência
// abaixo. Server Component; imagens usam ilhas client para fallback.
import { Badge } from "@/components/ui/badge";
import { LandingGallery } from "@/features/campaigns/components/landing-gallery";
import { LandingImage } from "@/features/campaigns/components/landing-image";
import type { LandingViewModel } from "@/features/campaigns/lib/landing-model";

type CampaignLandingProps = {
  model: LandingViewModel;
};

export function CampaignLanding({ model }: CampaignLandingProps) {
  return (
    <div className="min-h-screen w-full">
      {model.logoUrl ? (
        <header className="border-b px-6 py-4">
          <LandingImage
            src={model.logoUrl}
            alt={model.titulo}
            className="h-10 w-auto object-contain"
          />
        </header>
      ) : null}

      <article className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12 sm:py-16">
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

        {model.videoEmbedUrl ? (
          <div className="bg-muted aspect-video w-full overflow-hidden rounded-xl border">
            <iframe
              src={model.videoEmbedUrl}
              title={model.titulo}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : model.bannerUrl ? (
          <LandingImage
            src={model.bannerUrl}
            alt={model.titulo}
            className="bg-muted aspect-video w-full rounded-xl border object-cover"
          />
        ) : null}

        <LandingGallery images={model.fotos} titulo={model.titulo} />
      </article>
    </div>
  );
}
