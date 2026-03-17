import { Link } from "react-router-dom";
import { Lang, t } from "@/lib/i18n";

interface FooterProps {
  lang: Lang;
}

export default function Footer({ lang }: FooterProps) {
  const tr = t(lang);

  return (
    <footer className="border-t border-border bg-secondary/50 py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link to={`/${lang}`} className="font-serif text-lg font-bold text-foreground">
            OmegaBalance
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">{tr.footer.privacy}</a>
            <a href="#" className="hover:text-foreground transition-colors">{tr.footer.terms}</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OmegaBalance. {tr.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
