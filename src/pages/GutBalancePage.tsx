import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import gutBalanceHeroImage from "@/assets/gut-balance-test-phone.jpg";
import FooterSection from "@/components/FooterSection";
import InsideBalanceLogo from "@/components/InsideBalanceLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TrackedOutboundButton from "@/components/TrackedOutboundButton";
import { Lang, defaultLang, isSupportedLang } from "@/lib/i18n";
import { getZinzinoGutTestUrl } from "@/lib/zinzino";

type GutBalancePageProps = {
  lang?: Lang;
};

type GutMarker = {
  title: string;
  body: string;
};

type GutStep = {
  title: string;
  body: string;
};

type GutResearchLink = {
  label: string;
  href: string;
};

type GutPageCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroPrimary: string;
  supportEyebrow: string;
  supportTitle: string;
  supportBody: string;
  supportDetail: string;
  imageAlt: string;
  whyTitle: string;
  whyBody: string;
  metabolismEyebrow: string;
  metabolismTitle: string;
  metabolismBody: string;
  researchLinks: GutResearchLink[];
  markersTitle: string;
  markers: GutMarker[];
  benefitsTitle: string;
  benefits: string[];
  processTitle: string;
  processSteps: GutStep[];
  closingTitle: string;
  closingBody: string;
  closingPrimary: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmConfirmLabel: string;
  confirmCancelLabel: string;
};

const pendingLabelByLang: Record<Lang, string> = {
  sv: "\u00d6ppnar...",
  no: "\u00c5pner...",
  da: "\u00c5bner...",
  fi: "Avataan...",
  en: "Opening...",
  de: "Wird ge\u00f6ffnet...",
  fr: "Ouverture...",
  it: "Apertura...",
};

const genericErrorByLang: Record<Lang, string> = {
  sv: "L\u00e4nken kunde inte \u00f6ppnas just nu.",
  no: "Lenken kunne ikke \u00e5pnes akkurat n\u00e5.",
  da: "Linket kunne ikke \u00e5bnes lige nu.",
  fi: "Linkki\u00e4 ei voitu avata juuri nyt.",
  en: "The link could not be opened right now.",
  de: "Der Link konnte gerade nicht ge\u00f6ffnet werden.",
  fr: "Le lien n'a pas pu \u00eatre ouvert pour le moment.",
  it: "Il link non pu\u00f2 essere aperto in questo momento.",
};

const gutFooterTaglineByLang: Record<Lang, string> = {
  sv: "Forskningsbaserad analys av tarmh\u00e4lsa",
  no: "Forskningsbasert analyse av tarmhelse",
  da: "Forskningsbaseret analyse af tarmhelbred",
  fi: "Tutkimukseen perustuva suoliston terveyden analyysi",
  en: "Research-based gut health analysis",
  de: "Forschungsbasierte Analyse der Darmgesundheit",
  fr: "Analyse de la sant\u00e9 intestinale fond\u00e9e sur la recherche",
  it: "Analisi della salute intestinale basata sulla ricerca",
};

function resolveLang(param?: string): Lang {
  return (isSupportedLang(param) ? param : defaultLang) as Lang;
}

const pageCopyByLang: Record<Lang, GutPageCopy> = {
  sv: {
    heroEyebrow: "GutBalance",
    heroTitle: "F\u00e5 en tydligare bild av din tarmh\u00e4lsa",
    heroBody:
      "GutBalance hj\u00e4lper dig att f\u00f6rst\u00e5 hur tarm, immunf\u00f6rsvar och metabolism h\u00e4nger ihop. Testet fokuserar p\u00e5 funktion och ger dig en enklare v\u00e4g till konkreta insikter.",
    heroPrimary: "Best\u00e4ll GutBalance",
    supportEyebrow: "Hemmatest",
    supportTitle: "Enklare \u00e4n du tror",
    supportBody:
      "GutBalance g\u00f6rs hemma med ett litet blodprov. Du f\u00e5r sedan en tydlig rapport med insikter om tarm, immunf\u00f6rsvar och metabolism.",
    supportDetail: "Det ger dig en lugnare start och en tydligare bild av vad som \u00e4r relevant f\u00f6r dig.",
    imageAlt: "Person som sitter hemma och l\u00e4ser sina h\u00e4lsoresultat i lugn milj\u00f6",
    whyTitle: "Tarmen p\u00e5verkar mer \u00e4n magen",
    whyBody:
      "Din tarmmikrobiota \u00e4r kopplad till l\u00e5ngt mer \u00e4n matsm\u00e4ltning. Den p\u00e5verkar ocks\u00e5 immunf\u00f6rsvar, \u00e4mnesoms\u00e4ttning och kroppens f\u00f6rm\u00e5ga att hitta balans.",
    metabolismEyebrow: "Vad testet visar",
    metabolismTitle: "Vad testet hj\u00e4lper dig f\u00f6rst\u00e5",
    metabolismBody:
      "Testet visar hur kroppen och tarmbakterierna samverkar. Det ger en tydligare bild av hur tarmen fungerar i relation till immunf\u00f6rsvar och metabolism.",
    researchLinks: [
      { label: "Forsknings\u00f6versikt om tarmmikrobiota och tryptofan", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Studie om IPA och tarmbarri\u00e4ren", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Tre mark\u00f6rer som ger riktning",
    markers: [
      { title: "Indol-3-propionsyra (IPA)", body: "En skyddande metabolit som bildas av tarmbakterier och kopplas till tarmens motst\u00e5ndskraft." },
      { title: "Tryptofan (TRP)", body: "En essentiell aminosyra fr\u00e5n kosten som fungerar som utg\u00e5ngspunkt f\u00f6r flera viktiga processer i kroppen." },
      { title: "Kynurenin (KYN)", body: "En metabolit kopplad till immunaktivering och kroppens stressrespons." },
    ],
    benefitsTitle: "Mer \u00e4n bara siffror",
    benefits: [
      "Ett tydligt tarmh\u00e4lsoindex som sammanfattar balansen i dina resultat.",
      "Insikter om balansen mellan skyddande och belastande signalv\u00e4gar.",
      "Personliga kost- och livsstilsrekommendationer utifr\u00e5n dina resultat.",
      "Ett hemmatest p\u00e5 torrt blod, utan avf\u00f6ringsprov.",
    ],
    processTitle: "Enkelt test hemma",
    processSteps: [
      { title: "Ta provet p\u00e5 morgonen", body: "F\u00f6r b\u00e4sta noggrannhet tas provet fastande p\u00e5 morgonen, efter minst tio timmars nattfasta." },
      { title: "Droppa blod p\u00e5 kortet", body: "Provtagningen g\u00f6rs med ett enkelt stick i fingret och samlas upp p\u00e5 provkortet hemma." },
      { title: "Skicka in provet", body: "N\u00e4r kortet har torkat skickar du det vidare till laboratoriet i det medf\u00f6ljande kuvertet." },
      { title: "Se ditt resultat online", body: "Du registrerar provkoden och f\u00e5r senare tillg\u00e5ng till ditt resultat och din rapport digitalt." },
    ],
    closingTitle: "Redo att best\u00e4lla testet?",
    closingBody: "Best\u00e4ll GutBalance och f\u00e5 en rapport som hj\u00e4lper dig att f\u00f6rst\u00e5 balansen mellan tarm, immunf\u00f6rsvar och metabolism.",
    closingPrimary: "Best\u00e4ll GutBalance",
    confirmTitle: "Du g\u00e5r nu vidare till Zinzino",
    confirmDescription: "N\u00e4sta steg sker hos Zinzino, d\u00e4r best\u00e4llning och leverans hanteras.",
    confirmConfirmLabel: "OK, g\u00e5 vidare",
    confirmCancelLabel: "Stanna kvar",
  },
  en: {
    heroEyebrow: "GutBalance",
    heroTitle: "Get a clearer view of your gut health",
    heroBody:
      "GutBalance helps you understand how the gut, immune system, and metabolism work together. The test focuses on function and gives you a simpler path to useful insights.",
    heroPrimary: "Order GutBalance",
    supportEyebrow: "Home test",
    supportTitle: "Easier than you think",
    supportBody:
      "GutBalance is done at home with a small blood sample. You then receive a clear report with insights into the gut, immune system, and metabolism.",
    supportDetail: "It gives you a calmer starting point and a clearer sense of what is relevant for you.",
    imageAlt: "Person at home reading their health results in a calm setting",
    whyTitle: "The gut affects more than digestion",
    whyBody:
      "Your gut microbiota is linked to much more than digestion. It also affects immune function, metabolism, and the body's ability to find balance.",
    metabolismEyebrow: "What the test shows",
    metabolismTitle: "What the test helps you understand",
    metabolismBody:
      "The test shows how the body and gut bacteria work together. It gives you a clearer picture of how the gut functions in relation to immunity and metabolism.",
    researchLinks: [
      { label: "Research review on gut microbiota and tryptophan", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Study on IPA and the intestinal barrier", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Three markers that provide direction",
    markers: [
      { title: "Indole-3-propionic acid (IPA)", body: "A protective metabolite produced by gut bacteria and linked to intestinal resilience." },
      { title: "Tryptophan (TRP)", body: "An essential amino acid from the diet that acts as a starting point for several important processes in the body." },
      { title: "Kynurenine (KYN)", body: "A metabolite associated with immune activation and the body's stress response." },
    ],
    benefitsTitle: "More than just numbers",
    benefits: [
      "A clear gut health index that summarizes the balance in your results.",
      "Insights into the balance between protective and stress-related pathways.",
      "Personalized nutrition and lifestyle guidance based on your results.",
      "A dry blood spot home test, with no stool sample required.",
    ],
    processTitle: "A simple home test",
    processSteps: [
      { title: "Take the sample in the morning", body: "For best accuracy, the sample is taken fasting in the morning after at least ten hours without food." },
      { title: "Place blood on the card", body: "The sample is collected at home with a simple finger prick and placed on the test card." },
      { title: "Send the sample in", body: "Once the card has dried, you send it to the lab in the envelope provided." },
      { title: "View your results online", body: "You register your sample code and later access your results and report online." },
    ],
    closingTitle: "Ready to order the test?",
    closingBody: "Order GutBalance and receive a report that helps you understand the balance between gut health, immunity, and metabolism.",
    closingPrimary: "Order GutBalance",
    confirmTitle: "You are now continuing to Zinzino",
    confirmDescription: "The next step takes place at Zinzino, where ordering and delivery are handled.",
    confirmConfirmLabel: "OK, continue",
    confirmCancelLabel: "Stay here",
  },
  no: {
    heroEyebrow: "GutBalance",
    heroTitle: "F\u00e5 et tydeligere bilde av tarmhelsen din",
    heroBody:
      "GutBalance hjelper deg med \u00e5 forst\u00e5 hvordan tarm, immunforsvar og metabolisme henger sammen. Testen fokuserer p\u00e5 funksjon og gir deg en enklere vei til nyttige innsikter.",
    heroPrimary: "Bestill GutBalance",
    supportEyebrow: "Hjemmetest",
    supportTitle: "Enklere enn du tror",
    supportBody:
      "GutBalance gj\u00f8res hjemme med en liten blodpr\u00f8ve. Du f\u00e5r deretter en tydelig rapport med innsikt i tarm, immunforsvar og metabolisme.",
    supportDetail: "Det gir deg en roligere start og et tydeligere bilde av hva som er relevant for deg.",
    imageAlt: "Person hjemme som leser helseresultatene sine i rolige omgivelser",
    whyTitle: "Tarmen p\u00e5virker mer enn magen",
    whyBody:
      "Tarmmikrobiotaen din er knyttet til langt mer enn ford\u00f8yelse. Den p\u00e5virker ogs\u00e5 immunforsvar, metabolisme og kroppens evne til \u00e5 finne balanse.",
    metabolismEyebrow: "Hva testen viser",
    metabolismTitle: "Hva testen hjelper deg med \u00e5 forst\u00e5",
    metabolismBody:
      "Testen viser hvordan kroppen og tarmbakteriene samspiller. Den gir et tydeligere bilde av hvordan tarmen fungerer i forhold til immunforsvar og metabolisme.",
    researchLinks: [
      { label: "Forskningsoversikt om tarmmikrobiota og tryptofan", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Studie om IPA og tarmbarrieren", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Tre mark\u00f8rer som gir retning",
    markers: [
      { title: "Indol-3-propionsyre (IPA)", body: "En beskyttende metabolitt som dannes av tarmbakterier og kobles til tarmens motstandskraft." },
      { title: "Tryptofan (TRP)", body: "En essensiell aminosyre fra kosten som fungerer som utgangspunkt for flere viktige prosesser i kroppen." },
      { title: "Kynurenin (KYN)", body: "En metabolitt knyttet til immunaktivering og kroppens stressrespons." },
    ],
    benefitsTitle: "Mer enn bare tall",
    benefits: [
      "En tydelig tarmhelseindeks som oppsummerer balansen i resultatene dine.",
      "Innsikt i balansen mellom beskyttende og belastende signalveier.",
      "Personlige kostholds- og livsstilsr\u00e5d basert p\u00e5 resultatene dine.",
      "En hjemmetest med t\u00f8rket blod, uten avf\u00f8ringspr\u00f8ve.",
    ],
    processTitle: "Enkel test hjemme",
    processSteps: [
      { title: "Ta pr\u00f8ven om morgenen", body: "For best mulig n\u00f8yaktighet tas pr\u00f8ven fastende om morgenen, etter minst ti timer uten mat." },
      { title: "Drypp blod p\u00e5 kortet", body: "Pr\u00f8ven tas hjemme med et enkelt fingerstikk og samles opp p\u00e5 testkortet." },
      { title: "Send inn pr\u00f8ven", body: "N\u00e5r kortet har t\u00f8rket, sender du det videre til laboratoriet i den vedlagte konvolutten." },
      { title: "Se resultatet ditt p\u00e5 nett", body: "Du registrerer pr\u00f8vekoden og f\u00e5r senere tilgang til resultatet og rapporten din digitalt." },
    ],
    closingTitle: "Klar til \u00e5 bestille testen?",
    closingBody: "Bestill GutBalance og f\u00e5 en rapport som hjelper deg med \u00e5 forst\u00e5 balansen mellom tarm, immunforsvar og metabolisme.",
    closingPrimary: "Bestill GutBalance",
    confirmTitle: "Du g\u00e5r n\u00e5 videre til Zinzino",
    confirmDescription: "Neste steg skjer hos Zinzino, der bestilling og levering h\u00e5ndteres.",
    confirmConfirmLabel: "OK, g\u00e5 videre",
    confirmCancelLabel: "Bli her",
  },
  da: {
    heroEyebrow: "GutBalance",
    heroTitle: "F\u00e5 et tydeligere billede af din tarmbalance",
    heroBody:
      "GutBalance hj\u00e6lper dig med at forst\u00e5, hvordan tarm, immunforsvar og stofskifte h\u00e6nger sammen. Testen fokuserer p\u00e5 funktion og giver dig en enklere vej til nyttig indsigt.",
    heroPrimary: "Bestil GutBalance",
    supportEyebrow: "Hjemmetest",
    supportTitle: "Enklere end du tror",
    supportBody:
      "GutBalance laves hjemme med en lille blodpr\u00f8ve. Derefter f\u00e5r du en tydelig rapport med indsigt i tarm, immunforsvar og stofskifte.",
    supportDetail: "Det giver dig en roligere start og et tydeligere billede af, hvad der er relevant for dig.",
    imageAlt: "Person der sidder hjemme og l\u00e6ser sine sundhedsresultater i rolige omgivelser",
    whyTitle: "Tarmen p\u00e5virker mere end maven",
    whyBody:
      "Din tarmmikrobiota er knyttet til meget mere end ford\u00f8jelse. Den p\u00e5virker ogs\u00e5 immunforsvar, stofskifte og kroppens evne til at finde balance.",
    metabolismEyebrow: "Hvad testen viser",
    metabolismTitle: "Hvad testen hj\u00e6lper dig med at forst\u00e5",
    metabolismBody:
      "Testen viser, hvordan kroppen og tarmbakterierne arbejder sammen. Det giver et tydeligere billede af, hvordan tarmen fungerer i forhold til immunforsvar og stofskifte.",
    researchLinks: [
      { label: "Forskningsoversigt om tarmmikrobiota og tryptofan", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Studie om IPA og tarmbarrieren", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Tre mark\u00f8rer der giver retning",
    markers: [
      { title: "Indol-3-propionsyre (IPA)", body: "En beskyttende metabolit, som dannes af tarmbakterier og kobles til tarmens modstandskraft." },
      { title: "Tryptofan (TRP)", body: "En essentiel aminosyre fra kosten, som fungerer som udgangspunkt for flere vigtige processer i kroppen." },
      { title: "Kynurenin (KYN)", body: "En metabolit, der er knyttet til immunaktivering og kroppens stressrespons." },
    ],
    benefitsTitle: "Mere end bare tal",
    benefits: [
      "Et tydeligt tarmsundhedsindeks, som opsummerer balancen i dine resultater.",
      "Indsigt i balancen mellem beskyttende og belastende signalveje.",
      "Personlige kost- og livsstilsr\u00e5d baseret p\u00e5 dine resultater.",
      "En hjemmetest med t\u00f8rblod, uden aff\u00f8ringspr\u00f8ve.",
    ],
    processTitle: "En enkel test derhjemme",
    processSteps: [
      { title: "Tag pr\u00f8ven om morgenen", body: "For bedst mulig n\u00f8jagtighed tages pr\u00f8ven fastende om morgenen efter mindst ti timer uden mad." },
      { title: "L\u00e6g blod p\u00e5 kortet", body: "Pr\u00f8ven tages hjemme med et enkelt stik i fingeren og samles op p\u00e5 testkortet." },
      { title: "Send pr\u00f8ven ind", body: "N\u00e5r kortet er t\u00f8rret, sender du det videre til laboratoriet i den vedlagte kuvert." },
      { title: "Se dit resultat online", body: "Du registrerer din pr\u00f8vekode og f\u00e5r senere adgang til resultatet og rapporten digitalt." },
    ],
    closingTitle: "Klar til at bestille testen?",
    closingBody: "Bestil GutBalance og f\u00e5 en rapport, der hj\u00e6lper dig med at forst\u00e5 balancen mellem tarm, immunforsvar og stofskifte.",
    closingPrimary: "Bestil GutBalance",
    confirmTitle: "Du g\u00e5r nu videre til Zinzino",
    confirmDescription: "N\u00e6ste skridt sker hos Zinzino, hvor bestilling og levering h\u00e5ndteres.",
    confirmConfirmLabel: "OK, g\u00e5 videre",
    confirmCancelLabel: "Bliv her",
  },
  fi: {
    heroEyebrow: "GutBalance",
    heroTitle: "Saat selke\u00e4mm\u00e4n kuvan suolistosi hyvinvoinnista",
    heroBody:
      "GutBalance auttaa ymm\u00e4rt\u00e4m\u00e4\u00e4n, miten suolisto, immuunij\u00e4rjestelm\u00e4 ja aineenvaihdunta liittyv\u00e4t toisiinsa. Testi keskittyy toimintaan ja antaa yksinkertaisemman tien hy\u00f6dyllisiin oivalluksiin.",
    heroPrimary: "Tilaa GutBalance",
    supportEyebrow: "Kotitesti",
    supportTitle: "Helpompaa kuin luulet",
    supportBody:
      "GutBalance tehd\u00e4\u00e4n kotona pienell\u00e4 verin\u00e4ytteell\u00e4. Sen j\u00e4lkeen saat selke\u00e4n raportin, jossa on n\u00e4kemyksi\u00e4 suolistosta, immuunipuolustuksesta ja aineenvaihdunnasta.",
    supportDetail: "Se antaa rauhallisemman alun ja selke\u00e4mm\u00e4n kuvan siit\u00e4, mik\u00e4 on juuri sinulle olennaista.",
    imageAlt: "Kotona rauhallisessa ymp\u00e4rist\u00f6ss\u00e4 omia terveystuloksiaan lukeva henkil\u00f6",
    whyTitle: "Suolisto vaikuttaa muuhunkin kuin vatsaan",
    whyBody:
      "Suolistomikrobistosi liittyy paljon muuhunkin kuin ruoansulatukseen. Se vaikuttaa my\u00f6s immuunipuolustukseen, aineenvaihduntaan ja kehon kykyyn l\u00f6yt\u00e4\u00e4 tasapaino.",
    metabolismEyebrow: "Mitä testi näyttää",
    metabolismTitle: "Mitä testi auttaa ymmärtämään",
    metabolismBody:
      "Testi näyttää, miten keho ja suolistobakteerit toimivat yhdessä. Se antaa selkeämmän kuvan siitä, miten suolisto toimii suhteessa immuunipuolustukseen ja aineenvaihduntaan.",
    researchLinks: [
      { label: "Tutkimuskatsaus suolistomikrobiotasta ja tryptofaanista", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Tutkimus IPA:sta ja suoliston suojamuurista", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Kolme suuntaa antavaa markkeria",
    markers: [
      { title: "Indoli-3-propionihappo (IPA)", body: "Suojaava metaboliitti, jota suolistobakteerit muodostavat ja joka liittyy suoliston kestävyyteen." },
      { title: "Tryptofaani (TRP)", body: "Välttämätön aminohappo ravinnosta, joka toimii lähtökohtana useille tärkeille prosesseille kehossa." },
      { title: "Kynureniini (KYN)", body: "Metaboliitti, joka liittyy immuunijärjestelmän aktivoitumiseen ja kehon stressivasteeseen." },
    ],
    benefitsTitle: "Enemmän kuin pelkkiä lukuja",
    benefits: [
      "Selkeä suolistoterveysindeksi, joka kokoaa tulostesi tasapainon yhteen.",
      "Näkemyksiä suojaavien ja kuormittavien signalointireittien tasapainosta.",
      "Henkilökohtaiset ravinto- ja elämäntapaohjeet tulostesi perusteella.",
      "Kotitesti kuivaverinäytteestä ilman ulostenäytettä.",
    ],
    processTitle: "Yksinkertainen testi kotona",
    processSteps: [
      { title: "Ota näyte aamulla", body: "Parhaan tarkkuuden saamiseksi näyte otetaan paastotilassa aamulla vähintään kymmenen tunnin yön yli paaston jälkeen." },
      { title: "Tiputa verta kortille", body: "Näyte otetaan kotona yksinkertaisella sormenpääpistolla ja kerätään testikortille." },
      { title: "Lähetä näyte eteenpäin", body: "Kun kortti on kuivunut, lähetät sen laboratorioon mukana tulevassa kirjekuoressa." },
      { title: "Katso tulokset verkossa", body: "Rekisteröit näytekoodin ja saat myöhemmin tulokset ja raportin nähtäväksi digitaalisesti." },
    ],
    closingTitle: "Valmis tilaamaan testin?",
    closingBody: "Tilaa GutBalance ja saat raportin, joka auttaa ymmärtämään suoliston, immuunipuolustuksen ja aineenvaihdunnan välistä tasapainoa.",
    closingPrimary: "Tilaa GutBalance",
    confirmTitle: "Siirryt nyt Zinzinoon",
    confirmDescription: "Seuraava vaihe tapahtuu Zinzinolla, jossa tilaus ja toimitus hoidetaan.",
    confirmConfirmLabel: "OK, jatka",
    confirmCancelLabel: "Pysy täällä",
  },
  de: {
    heroEyebrow: "GutBalance",
    heroTitle: "Ein klarerer Blick auf Ihre Darmgesundheit",
    heroBody:
      "GutBalance hilft Ihnen zu verstehen, wie Darm, Immunsystem und Stoffwechsel zusammenhängen. Der Test konzentriert sich auf die Funktion und bietet einen einfacheren Weg zu nützlichen Erkenntnissen.",
    heroPrimary: "GutBalance bestellen",
    supportEyebrow: "Heimtest",
    supportTitle: "Einfacher als gedacht",
    supportBody:
      "GutBalance wird zu Hause mit einer kleinen Blutprobe durchgeführt. Anschließend erhalten Sie einen klaren Bericht mit Einblicken in Darm, Immunsystem und Stoffwechsel.",
    supportDetail: "So erhalten Sie einen ruhigeren Einstieg und ein klareres Bild davon, was für Sie relevant ist.",
    imageAlt: "Person zu Hause in ruhiger Umgebung mit Gesundheitsbericht in der Hand",
    whyTitle: "Der Darm beeinflusst mehr als nur die Verdauung",
    whyBody:
      "Ihre Darmmikrobiota ist mit weit mehr als nur der Verdauung verbunden. Sie beeinflusst auch das Immunsystem, den Stoffwechsel und die Fähigkeit des Körpers, ins Gleichgewicht zu kommen.",
    metabolismEyebrow: "Was der Test zeigt",
    metabolismTitle: "Was der Test Ihnen hilft zu verstehen",
    metabolismBody:
      "Der Test zeigt, wie Körper und Darmbakterien zusammenwirken. Er vermittelt ein klareres Bild davon, wie der Darm im Verhältnis zu Immunsystem und Stoffwechsel funktioniert.",
    researchLinks: [
      { label: "Forschungsübersicht zu Darmmikrobiota und Tryptophan", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Studie zu IPA und der Darmbarriere", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Drei Marker, die Orientierung geben",
    markers: [
      { title: "Indol-3-propionsäure (IPA)", body: "Ein schützender Metabolit, der von Darmbakterien gebildet wird und mit der Widerstandskraft des Darms verbunden ist." },
      { title: "Tryptophan (TRP)", body: "Eine essentielle Aminosäure aus der Ernährung, die als Ausgangspunkt für mehrere wichtige Prozesse im Körper dient." },
      { title: "Kynurenin (KYN)", body: "Ein Metabolit, der mit Immunaktivierung und der Stressreaktion des Körpers verbunden ist." },
    ],
    benefitsTitle: "Mehr als nur Zahlen",
    benefits: [
      "Ein klarer Darmgesundheitsindex, der das Gleichgewicht Ihrer Ergebnisse zusammenfasst.",
      "Einblicke in die Balance zwischen schützenden und belastenden Signalwegen.",
      "Persönliche Ernährungs- und Lebensstilhinweise auf Basis Ihrer Ergebnisse.",
      "Ein Heimtest mit Trockenblut, ohne Stuhlprobe.",
    ],
    processTitle: "Ein einfacher Test für zu Hause",
    processSteps: [
      { title: "Probe am Morgen entnehmen", body: "Für die beste Genauigkeit wird die Probe morgens nüchtern nach mindestens zehn Stunden ohne Nahrung entnommen." },
      { title: "Blut auf die Karte geben", body: "Die Probe wird zu Hause mit einem einfachen Fingerstich entnommen und auf die Testkarte aufgetragen." },
      { title: "Probe einsenden", body: "Sobald die Karte getrocknet ist, senden Sie sie im mitgelieferten Umschlag an das Labor." },
      { title: "Ergebnis online ansehen", body: "Sie registrieren den Probencode und erhalten später online Zugriff auf Ihr Ergebnis und Ihren Bericht." },
    ],
    closingTitle: "Bereit, den Test zu bestellen?",
    closingBody: "Bestellen Sie GutBalance und erhalten Sie einen Bericht, der hilft, das Gleichgewicht zwischen Darm, Immunsystem und Stoffwechsel besser zu verstehen.",
    closingPrimary: "GutBalance bestellen",
    confirmTitle: "Sie wechseln jetzt zu Zinzino",
    confirmDescription: "Der nächste Schritt findet bei Zinzino statt, wo Bestellung und Lieferung abgewickelt werden.",
    confirmConfirmLabel: "OK, weiter",
    confirmCancelLabel: "Hier bleiben",
  },
  fr: {
    heroEyebrow: "GutBalance",
    heroTitle: "Une vision plus claire de votre santé intestinale",
    heroBody:
      "GutBalance vous aide à comprendre comment l'intestin, le système immunitaire et le métabolisme interagissent. Le test se concentre sur la fonction et offre un accès plus simple à des informations utiles.",
    heroPrimary: "Commander GutBalance",
    supportEyebrow: "Test à domicile",
    supportTitle: "Plus simple que vous ne le pensez",
    supportBody:
      "GutBalance se réalise à domicile à partir d'un petit échantillon de sang. Vous recevez ensuite un rapport clair avec des informations sur l'intestin, le système immunitaire et le métabolisme.",
    supportDetail: "Cela vous donne un départ plus serein et une vision plus claire de ce qui est pertinent pour vous.",
    imageAlt: "Personne chez elle lisant ses résultats de santé dans un environnement calme",
    whyTitle: "L'intestin influence bien plus que la digestion",
    whyBody:
      "Votre microbiote intestinal est lié à bien plus que la digestion. Il influence aussi le système immunitaire, le métabolisme et la capacité du corps à retrouver son équilibre.",
    metabolismEyebrow: "Ce que le test montre",
    metabolismTitle: "Ce que le test vous aide à comprendre",
    metabolismBody:
      "Le test montre comment le corps et les bactéries intestinales fonctionnent ensemble. Il donne une image plus claire du rôle de l'intestin en lien avec l'immunité et le métabolisme.",
    researchLinks: [
      { label: "Revue scientifique sur le microbiote intestinal et le tryptophane", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Étude sur l'IPA et la barrière intestinale", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Trois marqueurs qui donnent une direction",
    markers: [
      { title: "Acide indole-3-propionique (IPA)", body: "Un métabolite protecteur produit par les bactéries intestinales et associé à la résistance de l'intestin." },
      { title: "Tryptophane (TRP)", body: "Un acide aminé essentiel issu de l'alimentation, point de départ de plusieurs processus importants dans l'organisme." },
      { title: "Kynurénine (KYN)", body: "Un métabolite lié à l'activation immunitaire et à la réponse au stress de l'organisme." },
    ],
    benefitsTitle: "Bien plus que de simples chiffres",
    benefits: [
      "Un indice clair de santé intestinale qui résume l'équilibre de vos résultats.",
      "Des informations sur l'équilibre entre voies protectrices et voies de stress.",
      "Des recommandations personnalisées en nutrition et mode de vie selon vos résultats.",
      "Un test à domicile sur sang séché, sans prélèvement de selles.",
    ],
    processTitle: "Un test simple à domicile",
    processSteps: [
      { title: "Prélevez l'échantillon le matin", body: "Pour une meilleure précision, l'échantillon est prélevé à jeun le matin après au moins dix heures sans manger." },
      { title: "Déposez le sang sur la carte", body: "Le prélèvement se fait à domicile avec une simple piqûre au doigt et se dépose sur la carte de test." },
      { title: "Envoyez l'échantillon", body: "Une fois la carte sèche, vous l'envoyez au laboratoire dans l'enveloppe fournie." },
      { title: "Consultez votre résultat en ligne", body: "Vous enregistrez votre code d'échantillon et accédez ensuite à votre résultat et à votre rapport en ligne." },
    ],
    closingTitle: "Prêt à commander le test ?",
    closingBody: "Commandez GutBalance et recevez un rapport qui vous aide à mieux comprendre l'équilibre entre l'intestin, l'immunité et le métabolisme.",
    closingPrimary: "Commander GutBalance",
    confirmTitle: "Vous allez maintenant poursuivre vers Zinzino",
    confirmDescription: "La suite se déroule chez Zinzino, où la commande et la livraison sont gérées.",
    confirmConfirmLabel: "OK, continuer",
    confirmCancelLabel: "Rester ici",
  },
  it: {
    heroEyebrow: "GutBalance",
    heroTitle: "Una visione più chiara della salute intestinale",
    heroBody:
      "GutBalance ti aiuta a capire come intestino, sistema immunitario e metabolismo siano collegati. Il test si concentra sulla funzione e offre un percorso più semplice verso informazioni utili.",
    heroPrimary: "Ordina GutBalance",
    supportEyebrow: "Test a casa",
    supportTitle: "Più semplice di quanto pensi",
    supportBody:
      "GutBalance si esegue a casa con un piccolo campione di sangue. Ricevi poi un report chiaro con indicazioni su intestino, sistema immunitario e metabolismo.",
    supportDetail: "Ti offre una partenza più tranquilla e un quadro più chiaro di ciò che è rilevante per te.",
    imageAlt: "Persona a casa che legge i propri risultati di salute in un ambiente tranquillo",
    whyTitle: "L'intestino influisce su più della digestione",
    whyBody:
      "Il tuo microbiota intestinale è collegato a molto più della digestione. Influisce anche sul sistema immunitario, sul metabolismo e sulla capacità del corpo di ritrovare equilibrio.",
    metabolismEyebrow: "Cosa mostra il test",
    metabolismTitle: "Cosa ti aiuta a capire il test",
    metabolismBody:
      "Il test mostra come corpo e batteri intestinali collaborano. Offre un quadro più chiaro di come funziona l'intestino in relazione a sistema immunitario e metabolismo.",
    researchLinks: [
      { label: "Rassegna scientifica su microbiota intestinale e triptofano", href: "https://pubmed.ncbi.nlm.nih.gov/37898179/" },
      { label: "Studio su IPA e barriera intestinale", href: "https://pubmed.ncbi.nlm.nih.gov/33356219/" },
    ],
    markersTitle: "Tre marcatori che danno direzione",
    markers: [
      { title: "Acido indol-3-propionico (IPA)", body: "Un metabolita protettivo prodotto dai batteri intestinali e associato alla resistenza dell'intestino." },
      { title: "Triptofano (TRP)", body: "Un amminoacido essenziale introdotto con l'alimentazione, punto di partenza per diversi processi importanti dell'organismo." },
      { title: "Kynurenina (KYN)", body: "Un metabolita legato all'attivazione immunitaria e alla risposta allo stress del corpo." },
    ],
    benefitsTitle: "Più di semplici numeri",
    benefits: [
      "Un chiaro indice di salute intestinale che riassume l'equilibrio dei risultati.",
      "Indicazioni sull'equilibrio tra vie protettive e vie di stress.",
      "Consigli personalizzati su alimentazione e stile di vita in base ai risultati.",
      "Un test domiciliare su sangue secco, senza campione fecale.",
    ],
    processTitle: "Un test semplice da fare a casa",
    processSteps: [
      { title: "Preleva il campione al mattino", body: "Per la massima precisione, il campione va prelevato al mattino a digiuno dopo almeno dieci ore senza cibo." },
      { title: "Metti il sangue sulla card", body: "Il campione si raccoglie a casa con una semplice puntura del dito e si deposita sulla card del test." },
      { title: "Invia il campione", body: "Una volta asciutta, la card viene spedita al laboratorio nella busta fornita." },
      { title: "Consulta il risultato online", body: "Registri il codice del campione e successivamente accedi online al risultato e al report." },
    ],
    closingTitle: "Pronto a ordinare il test?",
    closingBody: "Ordina GutBalance e ricevi un report che ti aiuta a capire meglio l'equilibrio tra intestino, sistema immunitario e metabolismo.",
    closingPrimary: "Ordina GutBalance",
    confirmTitle: "Stai per passare a Zinzino",
    confirmDescription: "Il passaggio successivo avviene su Zinzino, dove vengono gestiti ordine e consegna.",
    confirmConfirmLabel: "OK, continua",
    confirmCancelLabel: "Resta qui",
  },
};

const platformHomePath = (lang: Lang) => (lang === "sv" ? "/" : `/${lang}`);
const gutPrimaryCtaClass = "btn-primary min-h-12 gap-2 text-center";

const GutBalancePage = ({ lang: explicitLang }: GutBalancePageProps) => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = explicitLang ?? resolveLang(lang);
  const copy = pageCopyByLang[currentLang];

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-foreground">
      <section className="bg-[radial-gradient(circle_at_top,rgba(235,244,239,0.9),rgba(247,244,236,0.96)_42%,rgba(238,233,223,1)_100%)] px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-10">
        <div className="container-wide mx-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link to={platformHomePath(currentLang)} className="transition-opacity hover:opacity-85" aria-label="InsideBalance">
              <InsideBalanceLogo alt="InsideBalance" variant="full" className="h-32 sm:h-36 md:h-40 lg:h-44" />
            </Link>
            <LanguageSwitcher lang={currentLang} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex rounded-full border border-black/5 bg-white/84 px-4 py-2 font-serif text-sm font-semibold tracking-tight text-foreground/75 shadow-[0_12px_30px_rgba(31,41,55,0.05)]">
                {copy.heroEyebrow}
              </span>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">{copy.heroTitle}</h1>
              <p className="mx-auto mt-6 max-w-2xl text-[1.0625rem] leading-8 text-foreground/70 md:text-lg">{copy.heroBody}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.35rem] border border-black/5 bg-white/78 px-4 py-4 text-sm leading-6 text-foreground/70 shadow-[0_14px_35px_rgba(31,41,55,0.04)]">
                  {copy.supportEyebrow}
                </div>
                <div className="rounded-[1.35rem] border border-black/5 bg-white/78 px-4 py-4 text-sm leading-6 text-foreground/70 shadow-[0_14px_35px_rgba(31,41,55,0.04)]">
                  {copy.markersTitle}
                </div>
                <div className="rounded-[1.35rem] border border-black/5 bg-white/78 px-4 py-4 text-sm leading-6 text-foreground/70 shadow-[0_14px_35px_rgba(31,41,55,0.04)]">
                  {copy.processTitle}
                </div>
              </div>
              <div className="mx-auto mt-8 max-w-sm">
                <TrackedOutboundButton
                  lang={currentLang}
                  destinationType="test"
                  fallbackHref={getZinzinoGutTestUrl(currentLang)}
                  preferFallbackHref
                  className={gutPrimaryCtaClass}
                  pendingLabel={pendingLabelByLang[currentLang]}
                  errorMessages={{ generic: genericErrorByLang[currentLang] }}
                  confirmTitle={copy.confirmTitle}
                  confirmDescription={copy.confirmDescription}
                  confirmConfirmLabel={copy.confirmConfirmLabel}
                  confirmCancelLabel={copy.confirmCancelLabel}
                >
                  <>
                    {copy.heroPrimary}
                    <ArrowRight className="h-4 w-4" />
                  </>
                </TrackedOutboundButton>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
              <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 shadow-[0_24px_55px_rgba(31,41,55,0.08)]">
                <div className="h-[280px] md:h-full md:min-h-[320px]">
                  <img src={gutBalanceHeroImage} alt={copy.imageAlt} className="h-full w-full object-cover object-[center_22%]" />
                </div>
              </div>
              <div className="flex h-full items-center rounded-[1.75rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(240,246,242,0.9))] p-6 text-center shadow-[0_20px_45px_rgba(31,41,55,0.06)]">
                <div className="w-full">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.supportEyebrow}</p>
                  <h2 className="mt-3 font-serif text-[1.7rem] font-semibold tracking-tight text-foreground md:text-[1.95rem]">{copy.supportTitle}</h2>
                  <p className="mx-auto mt-4 max-w-xl text-[1rem] leading-7 text-foreground/70">{copy.supportBody}</p>
                  <p className="mx-auto mt-4 max-w-xl text-[0.98rem] leading-7 text-foreground/70">{copy.supportDetail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#ddd5c7] bg-[linear-gradient(180deg,rgba(238,231,218,1),rgba(244,239,229,1))] p-9 text-center shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.35rem]">{copy.whyTitle}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-8 text-foreground/70">{copy.whyBody}</p>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,246,242,0.84))] p-8 text-center shadow-[0_20px_50px_rgba(31,41,55,0.06)]">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{copy.metabolismEyebrow}</p>
            <h2 className="mt-3 font-serif text-[2rem] font-semibold tracking-tight md:text-[2.3rem]">{copy.metabolismTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-8 text-foreground/70">{copy.metabolismBody}</p>
            <div className="mt-6 space-y-3 border-t border-black/5 pt-5">
              {copy.researchLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm font-medium text-foreground/72 underline decoration-[#c7baa5] underline-offset-4 transition hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,rgba(247,244,236,1),rgba(240,246,242,0.7))] px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{copy.markersTitle}</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {copy.markers.map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-[hsl(var(--primary)/0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,246,0.84))] p-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
                <h3 className="font-serif text-[1.55rem] font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-4 text-[1.01rem] leading-7 text-foreground/68">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto rounded-[2rem] border border-black/5 bg-[linear-gradient(135deg,rgba(236,230,218,1),rgba(246,242,234,1))] p-8 md:p-10 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
          <div className="mb-6 text-center">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.3rem]">{copy.benefitsTitle}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {copy.benefits.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/84 px-5 py-4 shadow-[0_10px_25px_rgba(31,41,55,0.04)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-[1.01rem] leading-7 text-foreground/78">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,rgba(247,244,236,1),rgba(236,243,238,0.82))] px-4 py-14 md:px-6 md:py-18">
        <div className="container-wide mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{copy.processTitle}</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.processSteps.map((step, index) => (
              <article key={step.title} className="rounded-[1.75rem] border border-black/5 bg-white/88 p-7 shadow-[0_18px_40px_rgba(31,41,55,0.05)]">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{index + 1}</p>
                <h3 className="mt-3 text-[1.35rem] font-semibold tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-4 text-[1.01rem] leading-7 text-foreground/68">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-14">
        <div className="container-wide mx-auto">
          <div className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.88))] px-6 py-8 text-center shadow-[0_28px_68px_hsl(var(--primary)/0.22)] md:px-10 md:py-10">
            <div className="absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative">
              <h2 className="font-serif text-[2rem] font-semibold tracking-tight text-white md:text-[2.35rem]">{copy.closingTitle}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-8 text-white">{copy.closingBody}</p>
            </div>
            <div className="relative mx-auto mt-6 max-w-sm">
            <TrackedOutboundButton
              lang={currentLang}
              destinationType="test"
              fallbackHref={getZinzinoGutTestUrl(currentLang)}
              preferFallbackHref
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-center text-base font-medium text-foreground shadow-[0_18px_40px_rgba(31,41,55,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#faf7f1]"
              pendingLabel={pendingLabelByLang[currentLang]}
              errorMessages={{ generic: genericErrorByLang[currentLang] }}
              confirmTitle={copy.confirmTitle}
              confirmDescription={copy.confirmDescription}
              confirmConfirmLabel={copy.confirmConfirmLabel}
              confirmCancelLabel={copy.confirmCancelLabel}
              >
                <>
                  {copy.closingPrimary}
                  <ArrowRight className="h-4 w-4" />
                </>
              </TrackedOutboundButton>
            </div>
          </div>
        </div>
      </section>

      <FooterSection lang={currentLang} brandName="GutBalance" taglineOverride={gutFooterTaglineByLang[currentLang]} />
    </main>
  );
};

export default GutBalancePage;
