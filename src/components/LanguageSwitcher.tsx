import { Globe } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lang, languages, supportedLangs } from "@/lib/i18n";

interface LanguageSwitcherProps {
  lang: Lang;
}

const ariaLabelByLang: Record<Lang, string> = {
  sv: "V\u00e4lj spr\u00e5k",
  no: "Velg språk",
  da: "Vælg sprog",
  fi: "Valitse kieli",
  en: "Select language",
  de: "Sprache wählen",
  fr: "Choisir la langue",
  it: "Seleziona lingua",
};

const LanguageSwitcher = ({ lang }: LanguageSwitcherProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const current = languages.find((item) => item.code === lang) ?? languages[0];

  const switchLanguage = (nextLang: Lang) => {
    const pathname = location.pathname;
    const suffix = supportedLangs.some((code) => pathname === `/${code}` || pathname.startsWith(`/${code}/`))
      ? pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${nextLang}`)
      : `/${nextLang}`;

    navigate(`${suffix}${location.hash}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-2 text-sm font-medium text-foreground shadow-card backdrop-blur-sm transition-all hover:bg-card sm:px-4"
          aria-label={ariaLabelByLang[lang]}
        >
          <Globe className="h-4 w-4 text-primary" />
          <span>{current.flag}</span>
          <span className="hidden sm:inline">{current.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        {languages.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => switchLanguage(item.code)}
            className="cursor-pointer gap-2"
          >
            <span>{item.flag}</span>
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
