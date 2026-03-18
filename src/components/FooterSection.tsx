import { Lang, t } from "@/lib/i18n";

interface FooterSectionProps {
  lang: Lang;
}

const FooterSection = ({ lang }: FooterSectionProps) => {
  const copy = t(lang).footer;

  return (
    <footer className="border-t border-border px-6 py-12 md:px-12">
      <div className="container-wide flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="font-serif text-lg font-semibold tracking-tight">OmegaBalance</p>
        <div className="text-center md:text-left">
          <p className="text-xs text-subtle">
            © {new Date().getFullYear()} OmegaBalance. {copy.tagline} {copy.rights}
          </p>
          <p className="mt-1 text-[11px] text-subtle/80">Oberoende Zinzino-partner</p>
        </div>
        <div className="flex gap-6 text-xs text-subtle">
          <a href="#" className="transition-colors hover:text-foreground">
            {copy.privacy}
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            {copy.terms}
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            {copy.contact}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
