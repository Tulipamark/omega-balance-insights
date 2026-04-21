import type { ClaimText, LangRecord } from "@/content/v4-types";

export type GutBalanceV4Content = {
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primaryCta: string;
    trustRow: ClaimText[];
  };
  problem: {
    title: string;
    body: ClaimText;
  };
  product: {
    eyebrow: string;
    title: string;
    body: ClaimText;
    points: ClaimText[];
  };
  science: {
    title: string;
    body: ClaimText;
    markers: { title: string; body: ClaimText }[];
  };
  omegaLink: {
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };
  faqTitle: string;
  faq: { question: string; answer: string }[];
};

export const gutBalanceV4Content: LangRecord<GutBalanceV4Content> = {
  sv: {
    hero: {
      eyebrow: "GutBalance",
      title: "Ett sakligare sätt att börja förstå tarmhälsa",
      body: "GutBalance fokuserar på mätbara signaler kopplade till tarm, immunförsvar och metabolism. Upplägget är gjort för att kännas tydligt och modernt, inte alternativt eller svepande.",
      primaryCta: "Beställ GutBalance",
      trustRow: [
        { text: "Blodbaserat hemmatest", verification: "verified" },
        { text: "Digital rapport", verification: "verified" },
        { text: "Utan avföringsprov", verification: "verified" },
      ],
    },
    problem: {
      title: "Varför tarmhälsa känns relevant just nu",
      body: {
        text: "Modern kost och låg fiberandel nämns ofta i diskussionen om tarmhälsa. På den här sidan ska problemet beskrivas sakligt och utan att överdriva vad test eller produkt kan lova.",
        verification: "required",
        note: "Keep this framed as contextual copy until final source-backed wording is approved.",
      },
    },
    product: {
      eyebrow: "Vad ZinoBiotic+ gör",
      title: "Produktdelen ska beskrivas sakligt",
      body: {
        text: "ZinoBiotic+ ska här beskrivas som ett komplement i upplägget, inte som en garanti om viss effekt.",
        verification: "placeholder",
        note: "Replace with approved product wording before go-live.",
      },
      points: [
        { text: "Produktcopy hålls som placeholder tills godkänd dokumentation är låst.", verification: "placeholder" },
        { text: "Alla effektpåståenden om tarm, immunförsvar eller metabolism kräver verifiering.", verification: "required" },
        { text: "Sidan ska kännas saklig, inte alternativhälsig.", verification: "verified" },
      ],
    },
    science: {
      title: "Tre markörer som ger riktning, inte löften",
      body: {
        text: "GutBalance presenterar markörer och rapportering som ett sätt att skapa tydligare orientering. Formuleringarna ska hållas nära underlaget och inte lova mer än datan stödjer.",
        verification: "verified",
      },
      markers: [
        { title: "IPA", body: { text: "Beskrivs som en skyddande metabolit producerad av tarmbakterier.", verification: "required", note: "Needs approved phrasing from source pack." } },
        { title: "TRP", body: { text: "Används som markör i rapporten och ska beskrivas neutralt.", verification: "verified" } },
        { title: "KYN", body: { text: "Presenteras som del av rapportens bild av belastande och skyddande signalvägar.", verification: "required" } },
      ],
    },
    omegaLink: {
      title: "GutBalance och omega-balans kompletterar varandra",
      body: "GutBalance är inte tänkt att konkurrera med OmegaBalance. För många är omega-balansen den tydligaste startpunkten, medan GutBalance fungerar som ett kompletterande nästa steg.",
      primaryCta: "Gå till OmegaBalance",
      secondaryCta: "Fortsätt till GutBalance hos Zinzino",
    },
    faqTitle: "Vanliga frågor",
    faq: [
      { question: "Är GutBalance alternativhälsa?", answer: "Nej. Sidan ska beskriva testet sakligt och modernt, utan formuleringar om att \"läka tarmen\" eller liknande." },
      { question: "Vad mäter GutBalance?", answer: "GutBalance fokuserar på tre markörer som används för att ge en tydligare bild av tarm, immunförsvar och metabolism." },
      { question: "Behöver jag börja här?", answer: "Inte nödvändigtvis. För många är OmegaBalance den naturliga första vägen in, medan GutBalance fungerar som komplement." },
      { question: "Var sker beställningen?", answer: "Beställningen sker hos Zinzino när du går vidare från InsideBalance." },
      { question: "Är alla påståenden om produkten slutligt verifierade här?", answer: "Nej. Produktcopy och vissa funktionspåståenden ska behandlas som placeholders eller VERIFY_CLAIM tills de är godkända mot dokumentationen." },
    ],
  },
  en: {
    hero: {
      eyebrow: "GutBalance",
      title: "A more grounded way to understand gut health",
      body: "GutBalance focuses on measurable signals related to the gut, immunity, and metabolism. The goal is clarity and credibility, not alternative-health language.",
      primaryCta: "Order GutBalance",
      trustRow: [
        { text: "Blood-based home test", verification: "verified" },
        { text: "Digital report", verification: "verified" },
        { text: "No stool sample", verification: "verified" },
      ],
    },
    problem: {
      title: "Why gut health feels relevant right now",
      body: {
        text: "Modern diet patterns and low fiber intake are often part of the gut-health discussion. This page should frame the problem clearly without exaggerating what the test or product can promise.",
        verification: "required",
      },
    },
    product: {
      eyebrow: "What ZinoBiotic+ does",
      title: "The product section must stay factual",
      body: {
        text: "ZinoBiotic+ should be presented here as a supporting part of the setup, not as a guaranteed outcome.",
        verification: "placeholder",
      },
      points: [
        { text: "Product copy remains placeholder until approved documentation is locked.", verification: "placeholder" },
        { text: "Any effect claims about gut health, immunity, or metabolism require verification.", verification: "required" },
        { text: "The page should feel modern and credible, not alternative-health driven.", verification: "verified" },
      ],
    },
    science: {
      title: "Three markers that provide direction rather than promises",
      body: {
        text: "GutBalance presents markers and reporting as a clearer way to orient yourself. The wording should stay close to the source material and avoid overstating outcomes.",
        verification: "verified",
      },
      markers: [
        { title: "IPA", body: { text: "Presented as a protective metabolite produced by gut bacteria.", verification: "required" } },
        { title: "TRP", body: { text: "Used as a report marker and described neutrally.", verification: "verified" } },
        { title: "KYN", body: { text: "Shown as part of the report's picture of stress-related and protective pathways.", verification: "required" } },
      ],
    },
    omegaLink: {
      title: "GutBalance and omega balance support the same funnel",
      body: "GutBalance is not meant to compete with OmegaBalance. For many people, omega balance is the clearest place to begin, while GutBalance works as a complementary next step.",
      primaryCta: "Go to OmegaBalance",
      secondaryCta: "Continue to GutBalance on Zinzino",
    },
    faqTitle: "FAQ",
    faq: [
      { question: "Is GutBalance alternative health?", answer: "No. The page should describe the test in a modern, factual way, without language about \"healing the gut\" or similar." },
      { question: "What does GutBalance measure?", answer: "GutBalance focuses on three markers used to provide a clearer picture of the gut, immunity, and metabolism." },
      { question: "Do I need to begin here?", answer: "Not necessarily. For many people, OmegaBalance is the more natural starting point, while GutBalance acts as a complement." },
      { question: "Where does ordering happen?", answer: "Ordering happens through Zinzino once you continue from InsideBalance." },
      { question: "Are all product claims fully verified here?", answer: "No. Product copy and some functional claims must be treated as placeholders or VERIFY_CLAIM until approved against documentation." },
    ],
  },
};

gutBalanceV4Content.no = {
  hero: { eyebrow: "GutBalance", title: "En mer saklig måte å begynne å forstå tarmhelse på", body: "GutBalance fokuserer på målbare signaler knyttet til tarm, immunforsvar og metabolisme. Opplegget er laget for å føles tydelig og moderne, ikke alternativt eller svevende.", primaryCta: "Bestill GutBalance", trustRow: [{ text: "Blodbasert hjemmetest", verification: "verified" }, { text: "Digital rapport", verification: "verified" }, { text: "Uten avføringsprøve", verification: "verified" }] },
  problem: { title: "Hvorfor tarmhelse kjennes relevant akkurat nå", body: { text: "Moderne kosthold og lavt fiberinntak nevnes ofte i diskusjonen om tarmhelse. Denne siden skal beskrive problemet saklig og uten å overdrive hva test eller produkt kan love.", verification: "required", note: "Keep this framed as contextual copy until final source-backed wording is approved." } },
  product: { eyebrow: "Hva ZinoBiotic+ gjør", title: "Produktdelen skal beskrives saklig", body: { text: "ZinoBiotic+ skal her beskrives som et komplement i opplegget, ikke som en garanti for en bestemt effekt.", verification: "placeholder", note: "Replace with approved product wording before go-live." }, points: [{ text: "Produktcopy holdes som placeholder til godkjent dokumentasjon er låst.", verification: "placeholder" }, { text: "Alle effektpåstander om tarm, immunforsvar eller metabolisme krever verifisering.", verification: "required" }, { text: "Siden skal føles saklig, ikke alternativhelsepreget.", verification: "verified" }] },
  science: { title: "Tre markører som gir retning, ikke løfter", body: { text: "GutBalance presenterer markører og rapportering som en måte å skape tydeligere orientering på. Formuleringene skal ligge tett på underlaget og ikke love mer enn dataene støtter.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Beskrives som en beskyttende metabolitt produsert av tarmbakterier.", verification: "required" } }, { title: "TRP", body: { text: "Brukes som markør i rapporten og skal beskrives nøytralt.", verification: "verified" } }, { title: "KYN", body: { text: "Presenteres som del av rapportens bilde av belastende og beskyttende signalveier.", verification: "required" } }] },
  omegaLink: { title: "GutBalance og omega-balanse utfyller hverandre", body: "GutBalance er ikke ment å konkurrere med OmegaBalance. For mange er omega-balansen det tydeligste startpunktet, mens GutBalance fungerer som et komplementært neste steg.", primaryCta: "Gå til OmegaBalance", secondaryCta: "Fortsett til GutBalance hos Zinzino" },
  faqTitle: "Vanlige spørsmål",
  faq: [{ question: "Er GutBalance alternativhelse?", answer: "Nei. Siden skal beskrive testen saklig og moderne, uten formuleringer om å \"hele tarmen\" eller lignende." }, { question: "Hva måler GutBalance?", answer: "GutBalance fokuserer på tre markører som brukes for å gi et tydeligere bilde av tarm, immunforsvar og metabolisme." }, { question: "Trenger jeg å begynne her?", answer: "Ikke nødvendigvis. For mange er OmegaBalance den naturlige første veien inn, mens GutBalance fungerer som et supplement." }, { question: "Hvor skjer bestillingen?", answer: "Bestillingen skjer hos Zinzino når du går videre fra InsideBalance." }, { question: "Er alle påstander om produktet endelig verifisert her?", answer: "Nei. Produktcopy og enkelte funksjonspåstander skal behandles som placeholders eller VERIFY_CLAIM til de er godkjent mot dokumentasjonen." }],
};

gutBalanceV4Content.da = {
  hero: { eyebrow: "GutBalance", title: "En mere saglig måde at begynde at forstå tarmsundhed på", body: "GutBalance fokuserer på målbare signaler knyttet til tarm, immunforsvar og metabolisme. Setup'et er lavet til at føles tydeligt og moderne, ikke alternativt eller svævende.", primaryCta: "Bestil GutBalance", trustRow: [{ text: "Blodbaseret hjemmetest", verification: "verified" }, { text: "Digital rapport", verification: "verified" }, { text: "Uden afføringsprøve", verification: "verified" }] },
  problem: { title: "Hvorfor tarmsundhed føles relevant lige nu", body: { text: "Moderne kost og lavt fiberindtag nævnes ofte i diskussionen om tarmsundhed. Denne side skal beskrive problemet sagligt og uden at overdrive, hvad test eller produkt kan love.", verification: "required" } },
  product: { eyebrow: "Hvad ZinoBiotic+ gør", title: "Produktdelen skal holdes faktuel", body: { text: "ZinoBiotic+ skal her beskrives som et supplement i setup'et, ikke som en garanti for en bestemt effekt.", verification: "placeholder" }, points: [{ text: "Produktcopy holdes som placeholder, indtil godkendt dokumentation er låst.", verification: "placeholder" }, { text: "Alle effektpåstande om tarm, immunforsvar eller metabolisme kræver verifikation.", verification: "required" }, { text: "Siden skal føles saglig, ikke alternativsund.", verification: "verified" }] },
  science: { title: "Tre markører der giver retning, ikke løfter", body: { text: "GutBalance præsenterer markører og rapportering som en måde at skabe tydeligere orientering på. Formuleringerne skal holdes tæt på kildematerialet og ikke love mere, end dataene understøtter.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Beskrives som en beskyttende metabolit produceret af tarmbakterier.", verification: "required" } }, { title: "TRP", body: { text: "Bruges som markør i rapporten og beskrives neutralt.", verification: "verified" } }, { title: "KYN", body: { text: "Præsenteres som del af rapportens billede af belastende og beskyttende signalveje.", verification: "required" } }] },
  omegaLink: { title: "GutBalance og omega-balance supplerer hinanden", body: "GutBalance er ikke tænkt som en konkurrent til OmegaBalance. For mange er omega-balancen det tydeligste startpunkt, mens GutBalance fungerer som et supplerende næste skridt.", primaryCta: "Gå til OmegaBalance", secondaryCta: "Fortsæt til GutBalance hos Zinzino" },
  faqTitle: "Ofte stillede spørgsmål",
  faq: [{ question: "Er GutBalance alternativ sundhed?", answer: "Nej. Siden skal beskrive testen moderne og faktuelt uden formuleringer om at \"hele tarmen\" eller lignende." }, { question: "Hvad måler GutBalance?", answer: "GutBalance fokuserer på tre markører, der bruges til at give et tydeligere billede af tarm, immunforsvar og metabolisme." }, { question: "Behøver jeg at starte her?", answer: "Ikke nødvendigvis. For mange er OmegaBalance det mere naturlige startpunkt, mens GutBalance fungerer som et supplement." }, { question: "Hvor sker bestillingen?", answer: "Bestillingen sker hos Zinzino, når du går videre fra InsideBalance." }, { question: "Er alle påstande om produktet fuldt verificerede her?", answer: "Nej. Produktcopy og visse funktionspåstande skal behandles som placeholders eller VERIFY_CLAIM, indtil de er godkendt mod dokumentationen." }],
};

gutBalanceV4Content.fi = {
  hero: { eyebrow: "GutBalance", title: "Asiallisempi tapa alkaa ymmärtää suolistoterveyttä", body: "GutBalance keskittyy mitattaviin signaaleihin, jotka liittyvät suolistoon, immuunijärjestelmään ja aineenvaihduntaan. Kokonaisuus on tehty tuntumaan selkeältä ja modernilta, ei vaihtoehtohoitomaiselta tai epämääräiseltä.", primaryCta: "Tilaa GutBalance", trustRow: [{ text: "Vereen perustuva kotitesti", verification: "verified" }, { text: "Digitaalinen raportti", verification: "verified" }, { text: "Ei ulostenäytettä", verification: "verified" }] },
  problem: { title: "Miksi suolistoterveys tuntuu ajankohtaiselta juuri nyt", body: { text: "Moderni ruokavalio ja vähäinen kuitujen saanti nousevat usein esiin suolistoterveyttä koskevassa keskustelussa. Tällä sivulla aihe tulee kuvata asiallisesti liioittelematta sitä, mitä testi tai tuote voi luvata.", verification: "required" } },
  product: { eyebrow: "Mitä ZinoBiotic+ tekee", title: "Tuoteosuuden on pysyttävä asiallisena", body: { text: "ZinoBiotic+ tulee esittää täällä osana kokonaisuutta tukevana elementtinä, ei varmana lopputuloksena.", verification: "placeholder" }, points: [{ text: "Tuotekopio pidetään placeholderina, kunnes hyväksytty dokumentaatio on lukittu.", verification: "placeholder" }, { text: "Kaikki vaikutusväitteet suolistosta, immuunijärjestelmästä tai aineenvaihdunnasta vaativat vahvistuksen.", verification: "required" }, { text: "Sivun tulee tuntua modernilta ja uskottavalta, ei vaihtoehtohoitopainotteiselta.", verification: "verified" }] },
  science: { title: "Kolme markkeria, jotka antavat suuntaa eivätkä lupauksia", body: { text: "GutBalance esittää markkerit ja raportoinnin tapana saada selkeämpi suunta. Sanamuotojen tulee pysyä lähellä lähdemateriaalia eikä liioitella lopputuloksia.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Esitetään suojaavana metaboliittina, jota suolistobakteerit tuottavat.", verification: "required" } }, { title: "TRP", body: { text: "Käytetään raportin markkerina ja kuvataan neutraalisti.", verification: "verified" } }, { title: "KYN", body: { text: "Esitetään osana raportin kuvaa kuormittavista ja suojaavista signalointireiteistä.", verification: "required" } }] },
  omegaLink: { title: "GutBalance ja omega-tasapaino tukevat samaa kokonaisuutta", body: "GutBalance ei ole tarkoitettu kilpailemaan OmegaBalancen kanssa. Monille omega-tasapaino on selkein aloituspiste, kun taas GutBalance toimii täydentävänä seuraavana askeleena.", primaryCta: "Siirry OmegaBalanceen", secondaryCta: "Jatka GutBalanceen Zinzino-sivulla" },
  faqTitle: "Usein kysytyt kysymykset",
  faq: [{ question: "Onko GutBalance vaihtoehtohoitoa?", answer: "Ei. Sivun tulee kuvata testi modernilla ja asiallisella tavalla ilman ilmaisuja kuten \"parantaa suolen\" tai vastaavaa." }, { question: "Mitä GutBalance mittaa?", answer: "GutBalance keskittyy kolmeen markkeriin, joiden avulla pyritään antamaan selkeämpi kuva suolistosta, immuunijärjestelmästä ja aineenvaihdunnasta." }, { question: "Pitääkö minun aloittaa tästä?", answer: "Ei välttämättä. Monille OmegaBalance on luontevampi aloituspiste, kun taas GutBalance toimii täydentävänä polkuna." }, { question: "Missä tilaus tehdään?", answer: "Tilaus tehdään Zinzino-sivulla, kun jatkat eteenpäin InsideBalancesta." }, { question: "Onko kaikki tuotetta koskeva copy täällä täysin vahvistettua?", answer: "Ei. Tuotekopio ja osa toimintaa koskevista väitteistä tulee käsitellä placeholder- tai VERIFY_CLAIM-tekstinä, kunnes ne on hyväksytty dokumentaatiota vasten." }],
};

gutBalanceV4Content.de = {
  hero: { eyebrow: "GutBalance", title: "Ein sachlicherer Weg, Darmgesundheit zu verstehen", body: "GutBalance konzentriert sich auf messbare Signale rund um Darm, Immunsystem und Stoffwechsel. Das Setup soll klar und modern wirken, nicht alternativ oder schwammig.", primaryCta: "GutBalance bestellen", trustRow: [{ text: "Blutbasierter Heimtest", verification: "verified" }, { text: "Digitaler Bericht", verification: "verified" }, { text: "Ohne Stuhlprobe", verification: "verified" }] },
  problem: { title: "Warum Darmgesundheit gerade jetzt relevant wirkt", body: { text: "Moderne Ernährungsmuster und geringe Ballaststoffzufuhr gehören oft zur Diskussion rund um Darmgesundheit. Diese Seite soll das Thema klar einordnen, ohne zu übertreiben, was Test oder Produkt versprechen können.", verification: "required" } },
  product: { eyebrow: "Was ZinoBiotic+ tut", title: "Der Produktteil muss sachlich bleiben", body: { text: "ZinoBiotic+ soll hier als unterstützender Teil des Setups dargestellt werden, nicht als garantiertes Ergebnis.", verification: "placeholder" }, points: [{ text: "Produktcopy bleibt Placeholder, bis freigegebene Dokumentation final vorliegt.", verification: "placeholder" }, { text: "Alle Wirkclaims zu Darmgesundheit, Immunsystem oder Stoffwechsel benötigen Verifizierung.", verification: "required" }, { text: "Die Seite soll modern und glaubwürdig wirken, nicht alternativmedizinisch.", verification: "verified" }] },
  science: { title: "Drei Marker, die Orientierung statt Versprechen geben", body: { text: "GutBalance präsentiert Marker und Berichterstattung als klarere Form der Orientierung. Die Formulierungen sollen nah am Quellenmaterial bleiben und Ergebnisse nicht überdehnen.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Wird als schützender Metabolit beschrieben, der von Darmbakterien produziert wird.", verification: "required" } }, { title: "TRP", body: { text: "Wird als Marker im Bericht verwendet und neutral beschrieben.", verification: "verified" } }, { title: "KYN", body: { text: "Wird als Teil des Berichtbildes zu belastenden und schützenden Signalwegen dargestellt.", verification: "required" } }] },
  omegaLink: { title: "GutBalance und Omega-Balance ergänzen sich", body: "GutBalance soll nicht mit OmegaBalance konkurrieren. Für viele Menschen ist die Omega-Balance der klarste Einstieg, während GutBalance als ergänzender nächster Schritt funktioniert.", primaryCta: "Zu OmegaBalance", secondaryCta: "Weiter zu GutBalance bei Zinzino" },
  faqTitle: "FAQ",
  faq: [{ question: "Ist GutBalance alternative Gesundheit?", answer: "Nein. Die Seite soll den Test modern und sachlich beschreiben, ohne Formulierungen wie \"den Darm heilen\" oder Ähnliches." }, { question: "Was misst GutBalance?", answer: "GutBalance konzentriert sich auf drei Marker, die ein klareres Bild von Darm, Immunsystem und Stoffwechsel geben sollen." }, { question: "Muss ich hier beginnen?", answer: "Nicht unbedingt. Für viele ist OmegaBalance der natürlichere Einstieg, während GutBalance als Ergänzung dient." }, { question: "Wo findet die Bestellung statt?", answer: "Die Bestellung erfolgt über Zinzino, wenn du von InsideBalance aus weitergehst." }, { question: "Sind hier alle Produktclaims vollständig verifiziert?", answer: "Nein. Produktcopy und einige Funktionsclaims müssen als Placeholder oder VERIFY_CLAIM behandelt werden, bis sie gegen die Dokumentation freigegeben sind." }],
};

gutBalanceV4Content.fr = {
  hero: { eyebrow: "GutBalance", title: "Une manière plus factuelle de commencer à comprendre la santé intestinale", body: "GutBalance se concentre sur des signaux mesurables liés à l'intestin, à l'immunité et au métabolisme. L'objectif est que l'approche paraisse claire et moderne, non alternative ou vague.", primaryCta: "Commander GutBalance", trustRow: [{ text: "Test à domicile basé sur le sang", verification: "verified" }, { text: "Rapport numérique", verification: "verified" }, { text: "Sans échantillon de selles", verification: "verified" }] },
  problem: { title: "Pourquoi la santé intestinale paraît pertinente aujourd'hui", body: { text: "Les habitudes alimentaires modernes et un faible apport en fibres font souvent partie de la discussion sur la santé intestinale. Cette page doit cadrer le sujet clairement sans exagérer ce que le test ou le produit peuvent promettre.", verification: "required" } },
  product: { eyebrow: "Ce que fait ZinoBiotic+", title: "La section produit doit rester factuelle", body: { text: "ZinoBiotic+ doit être présenté ici comme un élément de soutien du dispositif, et non comme un résultat garanti.", verification: "placeholder" }, points: [{ text: "Le texte produit reste en placeholder jusqu'à validation de la documentation.", verification: "placeholder" }, { text: "Toute allégation d'effet sur l'intestin, l'immunité ou le métabolisme nécessite une vérification.", verification: "required" }, { text: "La page doit paraître moderne et crédible, pas orientée santé alternative.", verification: "verified" }] },
  science: { title: "Trois marqueurs qui donnent une direction, pas des promesses", body: { text: "GutBalance présente les marqueurs et le reporting comme une manière plus claire de s'orienter. Le texte doit rester proche du matériau source et éviter de surpromettre.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Présenté comme un métabolite protecteur produit par les bactéries intestinales.", verification: "required" } }, { title: "TRP", body: { text: "Utilisé comme marqueur du rapport et décrit de façon neutre.", verification: "verified" } }, { title: "KYN", body: { text: "Présenté comme faisant partie du tableau du rapport sur les voies de signalisation de stress et de protection.", verification: "required" } }] },
  omegaLink: { title: "GutBalance et l'équilibre oméga se complètent", body: "GutBalance n'est pas destiné à concurrencer OmegaBalance. Pour beaucoup, l'équilibre oméga est le point de départ le plus clair, tandis que GutBalance agit comme étape complémentaire suivante.", primaryCta: "Aller vers OmegaBalance", secondaryCta: "Continuer vers GutBalance chez Zinzino" },
  faqTitle: "FAQ",
  faq: [{ question: "GutBalance relève-t-il de la santé alternative ?", answer: "Non. La page doit décrire le test de manière moderne et factuelle, sans formulations sur le fait de \"guérir l'intestin\" ou autre." }, { question: "Que mesure GutBalance ?", answer: "GutBalance se concentre sur trois marqueurs utilisés pour donner une image plus claire de l'intestin, de l'immunité et du métabolisme." }, { question: "Dois-je commencer ici ?", answer: "Pas nécessairement. Pour beaucoup, OmegaBalance est le point de départ le plus naturel, tandis que GutBalance agit comme complément." }, { question: "Où se fait la commande ?", answer: "La commande se fait via Zinzino lorsque vous poursuivez depuis InsideBalance." }, { question: "Toutes les allégations produit sont-elles entièrement vérifiées ici ?", answer: "Non. Le texte produit et certaines allégations fonctionnelles doivent être traités comme placeholders ou VERIFY_CLAIM jusqu'à validation documentaire." }],
};

gutBalanceV4Content.it = {
  hero: { eyebrow: "GutBalance", title: "Un modo più concreto per iniziare a capire la salute intestinale", body: "GutBalance si concentra su segnali misurabili legati a intestino, immunità e metabolismo. L'obiettivo è che il percorso appaia chiaro e moderno, non alternativo o vago.", primaryCta: "Ordina GutBalance", trustRow: [{ text: "Test domiciliare basato sul sangue", verification: "verified" }, { text: "Report digitale", verification: "verified" }, { text: "Senza campione fecale", verification: "verified" }] },
  problem: { title: "Perché la salute intestinale sembra rilevante proprio ora", body: { text: "L'alimentazione moderna e un basso apporto di fibre fanno spesso parte della discussione sulla salute intestinale. Questa pagina deve descrivere il problema in modo chiaro senza esagerare ciò che test o prodotto possono promettere.", verification: "required" } },
  product: { eyebrow: "Cosa fa ZinoBiotic+", title: "La sezione prodotto deve restare fattuale", body: { text: "ZinoBiotic+ dovrebbe essere presentato qui come parte di supporto del percorso, non come risultato garantito.", verification: "placeholder" }, points: [{ text: "La product copy resta placeholder finché la documentazione approvata non è definitiva.", verification: "placeholder" }, { text: "Ogni claim su intestino, immunità o metabolismo richiede verifica.", verification: "required" }, { text: "La pagina deve risultare moderna e credibile, non da salute alternativa.", verification: "verified" }] },
  science: { title: "Tre marcatori che danno direzione, non promesse", body: { text: "GutBalance presenta marcatori e reportistica come un modo più chiaro per orientarsi. Il testo deve restare vicino al materiale sorgente ed evitare di sovrastimare i risultati.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Presentato come metabolita protettivo prodotto dai batteri intestinali.", verification: "required" } }, { title: "TRP", body: { text: "Usato come marcatore nel report e descritto in modo neutro.", verification: "verified" } }, { title: "KYN", body: { text: "Presentato come parte del quadro del report su vie di segnalazione stressanti e protettive.", verification: "required" } }] },
  omegaLink: { title: "GutBalance e l'equilibrio omega si completano", body: "GutBalance non è pensato per competere con OmegaBalance. Per molte persone l'equilibrio omega è il punto di partenza più chiaro, mentre GutBalance funziona come passo complementare successivo.", primaryCta: "Vai a OmegaBalance", secondaryCta: "Continua su GutBalance in Zinzino" },
  faqTitle: "FAQ",
  faq: [{ question: "GutBalance è salute alternativa?", answer: "No. La pagina deve descrivere il test in modo moderno e fattuale, senza espressioni come \"guarire l'intestino\" o simili." }, { question: "Cosa misura GutBalance?", answer: "GutBalance si concentra su tre marcatori usati per offrire un quadro più chiaro di intestino, immunità e metabolismo." }, { question: "Devo iniziare da qui?", answer: "Non necessariamente. Per molte persone OmegaBalance è il punto di partenza più naturale, mentre GutBalance funziona come complemento." }, { question: "Dove avviene l'ordine?", answer: "L'ordine avviene tramite Zinzino quando prosegui da InsideBalance." }, { question: "Tutti i claim di prodotto qui sono pienamente verificati?", answer: "No. La product copy e alcuni claim funzionali devono essere trattati come placeholder o VERIFY_CLAIM fino alla validazione con la documentazione." }],
};
