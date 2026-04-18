import { omegaBalanceV4Content } from "@/content/omega-balance-v4";
import { resolveContent } from "@/content/v4-types";
import type { Lang } from "@/lib/i18n";

type OmegaMarkersSectionProps = {
  lang: Lang;
};

const OmegaMarkersSection = ({ lang }: OmegaMarkersSectionProps) => {
  const copy = resolveContent(omegaBalanceV4Content, lang);

  return (
    <section className="bg-[linear-gradient(180deg,rgba(247,243,235,1),rgba(240,246,242,0.82))] px-4 py-18 md:px-6 md:py-24">
      <div className="container-wide mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{copy.markers.eyebrow}</p>
          <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight md:text-5xl">{copy.markers.title}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/68">{copy.markers.body}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {copy.markers.items.map((item) => (
            <article key={item.title} className="rounded-[1.75rem] border border-black/5 bg-white/88 px-6 py-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-foreground/68">{item.body.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OmegaMarkersSection;
