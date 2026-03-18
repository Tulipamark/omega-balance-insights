import { ReactNode } from "react";
import { Link } from "react-router-dom";
import FooterSection from "@/components/FooterSection";
import { defaultLang } from "@/lib/i18n";

interface InfoPageLayoutProps {
  title: string;
  intro: string;
  children: ReactNode;
}

const InfoPageLayout = ({ title, intro, children }: InfoPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-hero px-6 py-10 md:px-12 md:py-12 lg:px-20">
        <div className="container-wide">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to={`/${defaultLang}`} className="font-serif text-xl font-semibold tracking-tight text-foreground">
              OmegaBalance
            </Link>
            <Link
              to={`/${defaultLang}`}
              className="rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-card"
            >
              Till startsidan
            </Link>
          </div>

          <div className="max-w-3xl pb-8 md:pb-12">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-subtle">{intro}</p>
          </div>
        </div>
      </section>

      <main className="section-padding">
        <div className="container-narrow space-y-6">{children}</div>
      </main>

      <FooterSection lang={defaultLang} />
    </div>
  );
};

export default InfoPageLayout;
