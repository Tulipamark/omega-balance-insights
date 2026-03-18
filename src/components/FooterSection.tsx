import { Lang, t } from "@/lib/i18n";

interface FooterSectionProps {
  lang: Lang;
}

const FooterSection = ({ lang }: FooterSectionProps) => {
  const copy = t(lang).footer;

  return (
    <footer className="px-6 py-12 md:px-12 border-t border-border">
      <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-serif text-lg font-semibold tracking-tight">OmegaBalance</p>
        <p className="text-xs text-subtle">
          © {new Date().getFullYear()} OmegaBalance. {copy.tagline} {copy.rights}
        </p>
        <div className="flex gap-6 text-xs text-subtle">
          <a href="#" className="hover:text-foreground transition-colors">{copy.privacy}</a>
          <a href="#" className="hover:text-foreground transition-colors">{copy.terms}</a>
          <a href="#" className="hover:text-foreground transition-colors">{copy.contact}</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
