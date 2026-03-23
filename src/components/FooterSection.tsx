import { Link } from "react-router-dom";
import { Lang, t } from "@/lib/i18n";

interface FooterSectionProps {
  lang: Lang;
}

const FooterSection = ({ lang }: FooterSectionProps) => {
  const copy = t(lang).footer;
  const backofficeLabel = lang === "sv" ? "Backoffice" : "Backoffice";
  const adminLabel = lang === "sv" ? "Admin" : "Admin";

  return (
    <footer className="border-t border-border px-6 py-12 md:px-12">
      <div className="container-wide flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="font-serif text-lg font-semibold tracking-tight">OmegaBalance</p>
        <div className="text-center md:text-left">
          <p className="text-xs text-subtle">© OmegaBalance 2026 • Mätbar hälsa, tydliga beslut</p>
          <p className="mt-1 text-[11px] text-subtle">Oberoende Zinzino-partner</p>
        </div>
        <div className="flex gap-6 text-xs text-subtle">
          <Link to="/dashboard/login" className="transition-colors hover:text-foreground">
            {backofficeLabel}
          </Link>
          <Link to="/dashboard/admin-login" className="transition-colors hover:text-foreground">
            {adminLabel}
          </Link>
          <Link to="/integritet" className="transition-colors hover:text-foreground">
            {copy.privacy}
          </Link>
          <Link to="/villkor" className="transition-colors hover:text-foreground">
            {copy.terms}
          </Link>
          <Link to="/kontakt" className="transition-colors hover:text-foreground">
            {copy.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
