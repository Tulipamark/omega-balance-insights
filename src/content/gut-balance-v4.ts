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
        text: "Modern kost och låg fiberandel nämns ofta i diskussionen om tarmhälsa. Här används det som bakgrund till varför många vill förstå sin situation bättre, inte som ett löfte om vad ett enskilt test eller en produkt kan lösa.",
        verification: "required",
      },
    },
    product: {
      eyebrow: "Vad ZinoBiotic+ gör",
      title: "En del av den dagliga rutinen",
      body: {
        text: "I GutBalance används ZinoBiotic+ som den löpande produktdelen mellan test och uppföljning. Tanken är att göra upplägget enklare att följa över tid, med en tydligare koppling mellan daglig rutin, rapport och nästa steg.",
        verification: "verified",
      },
      points: [
        { text: "Används dagligen som komplement till test och rapport.", verification: "verified" },
        { text: "Ingår i ett upplägg med uppföljning över tid.", verification: "verified" },
        { text: "Hålls på en tydlig och saklig nivå genom hela upplägget.", verification: "verified" },
      ],
    },
    science: {
      title: "Tre markörer som ger riktning, inte löften",
      body: {
        text: "GutBalance presenterar markörer och rapportering som ett sätt att skapa tydligare orientering. Formuleringarna hålls nära underlaget och ska inte lova mer än datan stödjer.",
        verification: "verified",
      },
      markers: [
        { title: "IPA", body: { text: "Indol-3-propionsyra beskrivs som en skyddande metabolit som produceras av tarmbakterier och kopplas till tarmens motståndskraft.", verification: "required" } },
        { title: "TRP", body: { text: "Tryptofan är en essentiell aminosyra från kosten som används som markör i rapporten och beskrivs neutralt.", verification: "verified" } },
        { title: "KYN", body: { text: "Kynurenin presenteras som en metabolit kopplad till immunaktivering och kroppens stressrespons.", verification: "required" } },
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
      { question: "Är GutBalance alternativhälsa?", answer: "Nej. Sidan beskriver testet sakligt och modernt, utan formuleringar om att \"läka tarmen\" eller liknande." },
      { question: "Vad mäter GutBalance?", answer: "GutBalance fokuserar på tre markörer som används för att ge en tydligare bild av tarm, immunförsvar och metabolism." },
      { question: "Behöver jag börja här?", answer: "Inte nödvändigtvis. För många är OmegaBalance den naturliga första vägen in, medan GutBalance fungerar som komplement." },
      { question: "Var sker beställningen?", answer: "Beställningen sker hos Zinzino när du går vidare från InsideBalance." },
      { question: "Hur beskrivs produkten här?", answer: "Produkten beskrivs som en del av GutBalance-upplägget tillsammans med test, rapport och uppföljning över tid. Fokus ligger på hur den används i vardagen, inte på att lova en viss individuell effekt." },
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
        text: "Modern diet patterns and low fiber intake are often part of the gut-health discussion. This is framed here as context for why people want clearer guidance, not as a promise of what a single test or product can solve.",
        verification: "required",
      },
    },
    product: {
      eyebrow: "What ZinoBiotic+ does",
      title: "A supporting part of the setup, not the whole answer",
      body: {
        text: "ZinoBiotic+ is presented here as part of the GutBalance setup alongside testing, digital reporting, and follow-up. The focus stays on how it is used in a daily routine, not on promising a specific individual outcome.",
        verification: "verified",
      },
      points: [
        { text: "The product section stays tied to a clear daily routine with testing, reporting, and follow-up over time.", verification: "verified" },
        { text: "Any effect claims about gut health, immunity, or metabolism require verification before go-live.", verification: "required" },
        { text: "The page should feel modern and credible, not alternative-health driven.", verification: "verified" },
      ],
    },
    science: {
      title: "Three markers that provide direction rather than promises",
      body: {
        text: "GutBalance presents markers and reporting as a clearer way to orient yourself. The wording stays close to the source material and should not overstate outcomes.",
        verification: "verified",
      },
      markers: [
        { title: "IPA", body: { text: "Indole-3-propionic acid is described as a protective metabolite produced by gut bacteria and linked to intestinal resilience.", verification: "required" } },
        { title: "TRP", body: { text: "Tryptophan is an essential amino acid from the diet that is used as a neutral report marker.", verification: "verified" } },
        { title: "KYN", body: { text: "Kynurenine is presented as a metabolite associated with immune activation and the body's stress response.", verification: "required" } },
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
      { question: "Is GutBalance alternative health?", answer: "No. The page describes the test in a modern, factual way, without language about \"healing the gut\" or similar." },
      { question: "What does GutBalance measure?", answer: "GutBalance focuses on three markers used to provide a clearer picture of the gut, immunity, and metabolism." },
      { question: "Do I need to begin here?", answer: "Not necessarily. For many people, OmegaBalance is the more natural starting point, while GutBalance acts as a complement." },
      { question: "Where does ordering happen?", answer: "Ordering happens through Zinzino once you continue from InsideBalance." },
      { question: "How is the product described here?", answer: "The product is presented as one part of the GutBalance setup together with testing, reporting, and follow-up over time. The focus stays on how it is used in practice, not on promising a specific individual outcome." },
    ],
  },
  no: {
    hero: { eyebrow: "GutBalance", title: "En mer saklig måte å begynne å forstå tarmhelse på", body: "GutBalance fokuserer på målbare signaler knyttet til tarm, immunforsvar og metabolisme. Opplegget er laget for å føles tydelig og moderne, ikke alternativt eller svevende.", primaryCta: "Bestill GutBalance", trustRow: [{ text: "Blodbasert hjemmetest", verification: "verified" }, { text: "Digital rapport", verification: "verified" }, { text: "Uten avføringsprøve", verification: "verified" }] },
    problem: { title: "Hvorfor tarmhelse kjennes relevant akkurat nå", body: { text: "Moderne kosthold og lavt fiberinntak nevnes ofte i diskusjonen om tarmhelse. Her brukes det som bakgrunn for hvorfor mange ønsker tydeligere veiledning, ikke som et løfte om hva én test eller ett produkt kan løse.", verification: "required" } },
    product: { eyebrow: "Hva ZinoBiotic+ gjør", title: "En støttende del av opplegget", body: { text: "ZinoBiotic+ presenteres her som del av GutBalance-opplegget sammen med test, digital rapport og oppfølging. Fokuset ligger på daglig bruk, ikke på å love en bestemt individuell effekt.", verification: "verified" }, points: [{ text: "Produktdelen knyttes til test, rapport og oppfølging over tid.", verification: "verified" }, { text: "Alle effektpåstander om tarm, immunforsvar eller metabolisme krever verifisering før go-live.", verification: "required" }, { text: "Siden skal føles saklig, ikke alternativhelsepreget.", verification: "verified" }] },
    science: { title: "Tre markører som gir retning, ikke løfter", body: { text: "GutBalance presenterer markører og rapportering som en måte å skape tydeligere orientering på. Formuleringene skal ligge tett på underlaget og ikke love mer enn dataene støtter.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Indol-3-propionsyre beskrives som en beskyttende metabolitt produsert av tarmbakterier og koblet til tarmens motstandskraft.", verification: "required" } }, { title: "TRP", body: { text: "Tryptofan er en essensiell aminosyre fra kosten som brukes som markør i rapporten og beskrives nøytralt.", verification: "verified" } }, { title: "KYN", body: { text: "Kynurenin presenteres som en metabolitt knyttet til immunaktivering og kroppens stressrespons.", verification: "required" } }] },
    omegaLink: { title: "GutBalance og omega-balanse utfyller hverandre", body: "GutBalance er ikke ment å konkurrere med OmegaBalance. For mange er omega-balansen det tydeligste startpunktet, mens GutBalance fungerer som et komplementært neste steg.", primaryCta: "Gå til OmegaBalance", secondaryCta: "Fortsett til GutBalance hos Zinzino" },
    faqTitle: "Vanlige spørsmål",
    faq: [{ question: "Er GutBalance alternativhelse?", answer: "Nei. Siden beskriver testen saklig og moderne, uten formuleringer om å \"hele tarmen\" eller lignende." }, { question: "Hva måler GutBalance?", answer: "GutBalance fokuserer på tre markører som brukes for å gi et tydeligere bilde av tarm, immunforsvar og metabolisme." }, { question: "Trenger jeg å begynne her?", answer: "Ikke nødvendigvis. For mange er OmegaBalance den naturlige første veien inn, mens GutBalance fungerer som komplement." }, { question: "Hvor skjer bestillingen?", answer: "Bestillingen skjer hos Zinzino når du går videre fra InsideBalance." }, { question: "Hvordan beskrives produktet her?", answer: "Produktet beskrives som en del av GutBalance-opplegget sammen med test, rapport og oppfølging over tid. Fokuset ligger på hvordan det brukes i hverdagen, ikke på å love en bestemt individuell effekt." }],
  },
  da: {
    hero: { eyebrow: "GutBalance", title: "En mere saglig måde at begynde at forstå tarmsundhed på", body: "GutBalance fokuserer på målbare signaler knyttet til tarm, immunforsvar og stofskifte. Setup'et er lavet til at føles tydeligt og moderne, ikke alternativt eller svævende.", primaryCta: "Bestil GutBalance", trustRow: [{ text: "Blodbaseret hjemmetest", verification: "verified" }, { text: "Digital rapport", verification: "verified" }, { text: "Uden afføringsprøve", verification: "verified" }] },
    problem: { title: "Hvorfor tarmsundhed føles relevant lige nu", body: { text: "Moderne kost og lavt fiberindtag nævnes ofte i diskussionen om tarmsundhed. Her bruges det som baggrund for, hvorfor mange ønsker tydeligere vejledning, ikke som et løfte om, hvad én test eller ét produkt kan løse.", verification: "required" } },
    product: { eyebrow: "Hvad ZinoBiotic+ gør", title: "En støttende del af setup'et", body: { text: "ZinoBiotic+ præsenteres her som del af GutBalance-setup'et sammen med test, digital rapport og opfølgning. Fokus ligger på daglig brug, ikke på at love en bestemt individuel effekt.", verification: "verified" }, points: [{ text: "Produktdelen knyttes til test, rapport og opfølgning over tid.", verification: "verified" }, { text: "Alle effektpåstande om tarm, immunforsvar eller stofskifte kræver verifikation før go-live.", verification: "required" }, { text: "Siden skal føles saglig, ikke alternativsund.", verification: "verified" }] },
    science: { title: "Tre markører der giver retning, ikke løfter", body: { text: "GutBalance præsenterer markører og rapportering som en måde at skabe tydeligere orientering på. Formuleringerne skal holdes tæt på kildematerialet og ikke love mere, end dataene understøtter.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Indol-3-propionsyre beskrives som en beskyttende metabolit produceret af tarmbakterier og koblet til tarmens modstandskraft.", verification: "required" } }, { title: "TRP", body: { text: "Tryptofan er en essentiel aminosyre fra kosten, som bruges som markør i rapporten og beskrives neutralt.", verification: "verified" } }, { title: "KYN", body: { text: "Kynurenin præsenteres som en metabolit knyttet til immunaktivering og kroppens stressrespons.", verification: "required" } }] },
    omegaLink: { title: "GutBalance og omega-balance supplerer hinanden", body: "GutBalance er ikke tænkt som en konkurrent til OmegaBalance. For mange er omega-balancen det tydeligste startpunkt, mens GutBalance fungerer som et supplerende næste skridt.", primaryCta: "Gå til OmegaBalance", secondaryCta: "Fortsæt til GutBalance hos Zinzino" },
    faqTitle: "Ofte stillede spørgsmål",
    faq: [{ question: "Er GutBalance alternativ sundhed?", answer: "Nej. Siden beskriver testen moderne og faktuelt uden formuleringer om at \"hele tarmen\" eller lignende." }, { question: "Hvad måler GutBalance?", answer: "GutBalance fokuserer på tre markører, der bruges til at give et tydeligere billede af tarm, immunforsvar og stofskifte." }, { question: "Behøver jeg at starte her?", answer: "Ikke nødvendigvis. For mange er OmegaBalance det mere naturlige startpunkt, mens GutBalance fungerer som supplement." }, { question: "Hvor sker bestillingen?", answer: "Bestillingen sker hos Zinzino, når du går videre fra InsideBalance." }, { question: "Hvordan beskrives produktet her?", answer: "Produktet beskrives som en del af GutBalance-forløbet sammen med test, rapport og opfølgning over tid. Fokus ligger på, hvordan det bruges i hverdagen, ikke på at love en bestemt individuel effekt." }],
  },
  fi: {
    hero: { eyebrow: "GutBalance", title: "Asiallisempi tapa alkaa ymmärtää suolistoterveyttä", body: "GutBalance keskittyy mitattaviin signaaleihin, jotka liittyvät suolistoon, immuunijärjestelmään ja aineenvaihduntaan. Kokonaisuus on tehty tuntumaan selkeältä ja modernilta, ei vaihtoehtohoitomaiselta tai epämääräiseltä.", primaryCta: "Tilaa GutBalance", trustRow: [{ text: "Vereen perustuva kotitesti", verification: "verified" }, { text: "Digitaalinen raportti", verification: "verified" }, { text: "Ei ulostenäytettä", verification: "verified" }] },
    problem: { title: "Miksi suolistoterveys tuntuu ajankohtaiselta juuri nyt", body: { text: "Moderni ruokavalio ja vähäinen kuidun saanti nousevat usein esiin suolistoterveyttä koskevassa keskustelussa. Tässä niitä käytetään taustana sille, miksi moni haluaa selkeämpää ohjausta, ei lupauksena siitä, mitä yksi testi tai tuote voi ratkaista.", verification: "required" } },
    product: { eyebrow: "Mitä ZinoBiotic+ tekee", title: "Tukeva osa kokonaisuutta", body: { text: "ZinoBiotic+ esitetään täällä osana GutBalance-kokonaisuutta yhdessä testin, digitaalisen raportin ja seurannan kanssa. Painotus on päivittäisessä käytössä, ei tietyn yksilöllisen lopputuloksen lupaamisessa.", verification: "verified" }, points: [{ text: "Tuoteosio sidotaan testiin, raporttiin ja seurantaan ajan yli.", verification: "verified" }, { text: "Kaikki suolistoon, immuunijärjestelmään tai aineenvaihduntaan liittyvät vaikutusväitteet vaativat vahvistuksen ennen julkaisua.", verification: "required" }, { text: "Sivun tulee tuntua asialliselta, ei vaihtoehtohoitopainotteiselta.", verification: "verified" }] },
    science: { title: "Kolme markkeria, jotka antavat suuntaa eivätkä lupauksia", body: { text: "GutBalance esittää markkerit ja raportoinnin tapana saada selkeämpi suunta. Sanamuotojen tulee pysyä lähellä lähdemateriaalia eikä liioitella lopputuloksia.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Indoli-3-propionihappoa kuvataan suolistobakteerien tuottamaksi suojaavaksi metaboliitiksi, joka liittyy suoliston kestävyyteen.", verification: "required" } }, { title: "TRP", body: { text: "Tryptofaani on ravinnosta saatava välttämätön aminohappo, jota käytetään markkerina raportissa ja kuvataan neutraalisti.", verification: "verified" } }, { title: "KYN", body: { text: "Kynureniini esitetään metaboliittina, joka liittyy immuunijärjestelmän aktivoitumiseen ja kehon stressivasteeseen.", verification: "required" } }] },
    omegaLink: { title: "GutBalance ja omega-tasapaino tukevat samaa kokonaisuutta", body: "GutBalance ei ole tarkoitettu kilpailemaan OmegaBalancen kanssa. Monille omega-tasapaino on selkein aloituspiste, kun taas GutBalance toimii täydentävänä seuraavana askeleena.", primaryCta: "Siirry OmegaBalanceen", secondaryCta: "Jatka GutBalanceen Zinzino-sivulla" },
    faqTitle: "Usein kysytyt kysymykset",
    faq: [{ question: "Onko GutBalance vaihtoehtohoitoa?", answer: "Ei. Sivu kuvaa testiä modernilla ja asiallisella tavalla ilman ilmaisuja kuten \"parantaa suolen\" tai vastaavaa." }, { question: "Mitä GutBalance mittaa?", answer: "GutBalance keskittyy kolmeen markkeriin, joiden avulla pyritään antamaan selkeämpi kuva suolistosta, immuunijärjestelmästä ja aineenvaihdunnasta." }, { question: "Pitääkö minun aloittaa tästä?", answer: "Ei välttämättä. Monille OmegaBalance on luontevampi aloituspiste, kun taas GutBalance toimii täydentävänä polkuna." }, { question: "Missä tilaus tehdään?", answer: "Tilaus tehdään Zinzino-sivulla, kun jatkat eteenpäin InsideBalancesta." }, { question: "Miten tuotetta kuvataan täällä?", answer: "Tuote kuvataan osana GutBalance-kokonaisuutta yhdessä testin, raportin ja seurannan kanssa. Painotus on siinä, miten sitä käytetään arjessa, ei tietyn yksilöllisen lopputuloksen lupaamisessa." }],
  },
  de: {
    hero: { eyebrow: "GutBalance", title: "Ein sachlicherer Weg, Darmgesundheit zu verstehen", body: "GutBalance konzentriert sich auf messbare Signale rund um Darm, Immunsystem und Stoffwechsel. Das Setup soll klar und modern wirken, nicht alternativ oder schwammig.", primaryCta: "GutBalance bestellen", trustRow: [{ text: "Blutbasierter Heimtest", verification: "verified" }, { text: "Digitaler Bericht", verification: "verified" }, { text: "Ohne Stuhlprobe", verification: "verified" }] },
    problem: { title: "Warum Darmgesundheit gerade jetzt relevant wirkt", body: { text: "Moderne Ernährungsmuster und geringe Ballaststoffzufuhr gehören oft zur Diskussion rund um Darmgesundheit. Hier wird das als Hintergrund für den Wunsch nach klarerer Orientierung beschrieben, nicht als Versprechen dessen, was ein einzelner Test oder ein Produkt lösen kann.", verification: "required" } },
    product: { eyebrow: "Was ZinoBiotic+ tut", title: "Ein unterstützender Teil des Setups", body: { text: "ZinoBiotic+ wird hier als Teil des GutBalance-Setups zusammen mit Test, digitalem Bericht und Follow-up dargestellt. Der Fokus liegt auf der täglichen Anwendung, nicht auf dem Versprechen eines bestimmten individuellen Ergebnisses.", verification: "verified" }, points: [{ text: "Der Produktteil bleibt eng an Test, Bericht und Follow-up über die Zeit gebunden.", verification: "verified" }, { text: "Alle Wirkclaims zu Darmgesundheit, Immunsystem oder Stoffwechsel benötigen Verifizierung vor dem Go-live.", verification: "required" }, { text: "Die Seite soll modern und glaubwürdig wirken, nicht alternativmedizinisch.", verification: "verified" }] },
    science: { title: "Drei Marker, die Orientierung statt Versprechen geben", body: { text: "GutBalance präsentiert Marker und Berichterstattung als klarere Form der Orientierung. Die Formulierungen sollen nah am Quellenmaterial bleiben und Ergebnisse nicht überdehnen.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "Indol-3-Propionsäure wird als schützender Metabolit beschrieben, der von Darmbakterien produziert wird und mit der Widerstandskraft des Darms zusammenhängt.", verification: "required" } }, { title: "TRP", body: { text: "Tryptophan ist eine essentielle Aminosäure aus der Ernährung und wird im Bericht als neutraler Marker verwendet.", verification: "verified" } }, { title: "KYN", body: { text: "Kynurenin wird als Metabolit dargestellt, der mit Immunaktivierung und der Stressantwort des Körpers verbunden ist.", verification: "required" } }] },
    omegaLink: { title: "GutBalance und Omega-Balance ergänzen sich", body: "GutBalance soll nicht mit OmegaBalance konkurrieren. Für viele Menschen ist die Omega-Balance der klarste Einstieg, während GutBalance als ergänzender nächster Schritt funktioniert.", primaryCta: "Zu OmegaBalance", secondaryCta: "Weiter zu GutBalance bei Zinzino" },
    faqTitle: "FAQ",
    faq: [{ question: "Ist GutBalance alternative Gesundheit?", answer: "Nein. Die Seite beschreibt den Test modern und sachlich, ohne Formulierungen wie \"den Darm heilen\" oder Ähnliches." }, { question: "Was misst GutBalance?", answer: "GutBalance konzentriert sich auf drei Marker, die ein klareres Bild von Darm, Immunsystem und Stoffwechsel geben sollen." }, { question: "Muss ich hier beginnen?", answer: "Nicht unbedingt. Für viele ist OmegaBalance der natürlichere Einstieg, während GutBalance als Ergänzung dient." }, { question: "Wo findet die Bestellung statt?", answer: "Die Bestellung erfolgt über Zinzino, wenn du von InsideBalance aus weitergehst." }, { question: "Wie wird das Produkt hier beschrieben?", answer: "Das Produkt wird als Teil des GutBalance-Setups zusammen mit Test, Bericht und Follow-up über die Zeit beschrieben. Im Fokus steht die Anwendung im Alltag, nicht das Versprechen eines bestimmten individuellen Ergebnisses." }],
  },
  fr: {
    hero: { eyebrow: "GutBalance", title: "Une manière plus factuelle de commencer à comprendre la santé intestinale", body: "GutBalance se concentre sur des signaux mesurables liés à l'intestin, à l'immunité et au métabolisme. L'objectif est que l'approche paraisse claire et moderne, non alternative ou vague.", primaryCta: "Commander GutBalance", trustRow: [{ text: "Test à domicile basé sur le sang", verification: "verified" }, { text: "Rapport numérique", verification: "verified" }, { text: "Sans échantillon de selles", verification: "verified" }] },
    problem: { title: "Pourquoi la santé intestinale paraît pertinente aujourd'hui", body: { text: "Les habitudes alimentaires modernes et un faible apport en fibres font souvent partie de la discussion sur la santé intestinale. Ici, cela sert de contexte pour expliquer pourquoi beaucoup cherchent un repère plus clair, sans promettre ce qu'un test ou un produit seul pourrait résoudre.", verification: "required" } },
    product: { eyebrow: "Ce que fait ZinoBiotic+", title: "Une partie de soutien du dispositif", body: { text: "ZinoBiotic+ est présenté ici comme une partie du dispositif GutBalance avec test, rapport numérique et suivi. L'accent porte sur l'usage quotidien, et non sur la promesse d'un résultat individuel précis.", verification: "verified" }, points: [{ text: "La section produit reste liée au test, au rapport et au suivi dans le temps.", verification: "verified" }, { text: "Toute allégation d'effet sur l'intestin, l'immunité ou le métabolisme nécessite une vérification avant mise en ligne.", verification: "required" }, { text: "La page doit paraître moderne et crédible, pas orientée santé alternative.", verification: "verified" }] },
    science: { title: "Trois marqueurs qui donnent une direction, pas des promesses", body: { text: "GutBalance présente les marqueurs et le reporting comme une manière plus claire de s'orienter. Le texte doit rester proche du matériau source et éviter de surpromettre.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "L'acide indole-3-propionique est présenté comme un métabolite protecteur produit par les bactéries intestinales et lié à la résistance de l'intestin.", verification: "required" } }, { title: "TRP", body: { text: "Le tryptophane est un acide aminé essentiel issu de l'alimentation utilisé comme marqueur neutre dans le rapport.", verification: "verified" } }, { title: "KYN", body: { text: "La kynurénine est présentée comme un métabolite lié à l'activation immunitaire et à la réponse au stress de l'organisme.", verification: "required" } }] },
    omegaLink: { title: "GutBalance et l'équilibre oméga se complètent", body: "GutBalance n'est pas destiné à concurrencer OmegaBalance. Pour beaucoup, l'équilibre oméga est le point de départ le plus clair, tandis que GutBalance agit comme étape complémentaire suivante.", primaryCta: "Aller vers OmegaBalance", secondaryCta: "Continuer vers GutBalance chez Zinzino" },
    faqTitle: "FAQ",
    faq: [{ question: "GutBalance relève-t-il de la santé alternative ?", answer: "Non. La page décrit le test de manière moderne et factuelle, sans formulations sur le fait de \"guérir l'intestin\" ou autre." }, { question: "Que mesure GutBalance ?", answer: "GutBalance se concentre sur trois marqueurs utilisés pour donner une image plus claire de l'intestin, de l'immunité et du métabolisme." }, { question: "Dois-je commencer ici ?", answer: "Pas nécessairement. Pour beaucoup, OmegaBalance est le point de départ le plus naturel, tandis que GutBalance agit comme complément." }, { question: "Où se fait la commande ?", answer: "La commande se fait via Zinzino lorsque vous poursuivez depuis InsideBalance." }, { question: "Comment le produit est-il décrit ici ?", answer: "Le produit est présenté comme une partie du dispositif GutBalance avec test, rapport et suivi dans le temps. L'accent est mis sur son usage au quotidien, non sur la promesse d'un résultat individuel précis." }],
  },
  it: {
    hero: { eyebrow: "GutBalance", title: "Un modo più concreto per iniziare a capire la salute intestinale", body: "GutBalance si concentra su segnali misurabili legati a intestino, immunità e metabolismo. L'obiettivo è che il percorso appaia chiaro e moderno, non alternativo o vago.", primaryCta: "Ordina GutBalance", trustRow: [{ text: "Test domiciliare basato sul sangue", verification: "verified" }, { text: "Report digitale", verification: "verified" }, { text: "Senza campione fecale", verification: "verified" }] },
    problem: { title: "Perché la salute intestinale sembra rilevante proprio ora", body: { text: "L'alimentazione moderna e un basso apporto di fibre fanno spesso parte della discussione sulla salute intestinale. Qui vengono usati come contesto per spiegare perché molte persone cercano un orientamento più chiaro, non come promessa di ciò che un singolo test o prodotto può risolvere.", verification: "required" } },
    product: { eyebrow: "Cosa fa ZinoBiotic+", title: "Una parte di supporto del percorso", body: { text: "ZinoBiotic+ viene presentato qui come parte del percorso GutBalance insieme a test, report digitale e follow-up. L'attenzione resta sull'uso quotidiano, non sulla promessa di un risultato individuale specifico.", verification: "verified" }, points: [{ text: "La sezione prodotto resta legata a test, report e follow-up nel tempo.", verification: "verified" }, { text: "Ogni claim su intestino, immunità o metabolismo richiede verifica prima del go-live.", verification: "required" }, { text: "La pagina deve risultare moderna e credibile, non da salute alternativa.", verification: "verified" }] },
    science: { title: "Tre marcatori che danno direzione, non promesse", body: { text: "GutBalance presenta marcatori e reportistica come un modo più chiaro per orientarsi. Il testo deve restare vicino al materiale sorgente ed evitare di sovrastimare i risultati.", verification: "verified" }, markers: [{ title: "IPA", body: { text: "L'acido indol-3-propionico viene presentato come metabolita protettivo prodotto dai batteri intestinali e collegato alla resilienza dell'intestino.", verification: "required" } }, { title: "TRP", body: { text: "Il triptofano è un amminoacido essenziale introdotto con l'alimentazione e usato come marcatore neutro nel report.", verification: "verified" } }, { title: "KYN", body: { text: "La kynurenina viene presentata come metabolita legato all'attivazione immunitaria e alla risposta allo stress del corpo.", verification: "required" } }] },
    omegaLink: { title: "GutBalance e l'equilibrio omega si completano", body: "GutBalance non è pensato per competere con OmegaBalance. Per molte persone l'equilibrio omega è il punto di partenza più chiaro, mentre GutBalance funziona come passo complementare successivo.", primaryCta: "Vai a OmegaBalance", secondaryCta: "Continua su GutBalance in Zinzino" },
    faqTitle: "FAQ",
    faq: [{ question: "GutBalance è salute alternativa?", answer: "No. La pagina descrive il test in modo moderno e fattuale, senza espressioni come \"guarire l'intestino\" o simili." }, { question: "Cosa misura GutBalance?", answer: "GutBalance si concentra su tre marcatori usati per offrire un quadro più chiaro di intestino, immunità e metabolismo." }, { question: "Devo iniziare da qui?", answer: "Non necessariamente. Per molte persone OmegaBalance è il punto di partenza più naturale, mentre GutBalance funziona come complemento." }, { question: "Dove avviene l'ordine?", answer: "L'ordine avviene tramite Zinzino quando prosegui da InsideBalance." }, { question: "Come viene descritto il prodotto qui?", answer: "Il prodotto viene presentato come una parte del percorso GutBalance insieme a test, report e follow-up nel tempo. L'attenzione è su come viene usato nella routine quotidiana, non sulla promessa di un risultato individuale specifico." }],
  },
};
