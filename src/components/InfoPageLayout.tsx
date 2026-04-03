import { ReactNode } from "react";
import { Link } from "react-router-dom";
import FooterSection from "@/components/FooterSection";
import { defaultLang, Lang } from "@/lib/i18n";

interface InfoPageLayoutProps {
  lang?: Lang;
  title: string;
  intro: string;
  backLabel?: string;
  children: ReactNode;
}

const InfoPageLayout = ({ lang = defaultLang, title, intro, backLabel = "Till startsidan", children }: InfoPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-hero px-4 py-8 sm:px-5 sm:py-10 md:px-12 md:py-12 lg:px-20">
        <div className="container-wide">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4 md:mb-10">
            <Link to={`/${lang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
              OmegaBalance
            </Link>
            <Link
              to={`/${lang}`}
              className="rounded-full border border-border bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-card transition-colors hover:bg-card sm:px-4 sm:text-sm"
            >
              {backLabel}
            </Link>
          </div>

          <div className="max-w-3xl pb-6 md:pb-12">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-subtle sm:text-lg sm:leading-8">{intro}</p>
          </div>
        </div>
      </section>

      <main className="section-padding">
        <div className="container-narrow space-y-6">{children}</div>
      </main>

      <FooterSection lang={lang} />
    </div>
  );
};

export default InfoPageLayout;
