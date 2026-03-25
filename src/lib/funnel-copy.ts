import type { Lang } from "@/lib/i18n";

export const funnelHeroCopy: Record<Lang, { headline: string; supporting: string; trust: string }> = {
  sv: {
    headline: "Få ett tydligt mått på din omega-balans\noch se om det du gör faktiskt syns i resultatet",
    supporting: "Ett enkelt blodtest visar din uppmätta balans mellan omega-6 och omega-3, baserat på dina egna värden.",
    trust: "Ett enkelt sätt att få ett tydligt mätresultat.",
  },
  en: {
    headline: "See where your omega balance actually stands",
    supporting: "A simple blood test gives you a personal measurement of your omega-6 to omega-3 balance, based on your own values.",
    trust: "A simple test. A clear result.",
  },
  no: {
    headline: "Få et tydelig mål på omega-balansen din",
    supporting: "En enkel blodtest viser den målte balansen mellom omega-6 og omega-3, basert på dine egne verdier.",
    trust: "En enkel test. Et tydelig resultat.",
  },
  da: {
    headline: "Få et tydeligt mål for din omega-balance",
    supporting: "En enkel blodtest viser din målte balance mellem omega-6 og omega-3, baseret på dine egne værdier.",
    trust: "En enkel test. Et tydeligt resultat.",
  },
  fi: {
    headline: "Näe missä omega-tasapainosi oikeasti on",
    supporting: "Yksinkertainen veritesti antaa henkilökohtaisen mittauksen omega-6:n ja omega-3:n tasapainosta omien arvojesi perusteella.",
    trust: "Yksinkertainen testi. Selkeä tulos.",
  },
  de: {
    headline: "Klare Messung deiner Omega-Balance",
    supporting: "Ein einfacher Bluttest zeigt dein gemessenes Verhältnis zwischen Omega-6 und Omega-3 auf Basis deiner eigenen Werte.",
    trust: "Ein klarer Ablauf. Ein nachvollziehbares Ergebnis.",
  },
  fr: {
    headline: "Comprenez clairement votre équilibre oméga",
    supporting: "Un simple test sanguin vous donne une mesure personnelle de votre équilibre entre oméga-6 et oméga-3, à partir de vos propres valeurs.",
    trust: "Une démarche simple. Un résultat clair.",
  },
  it: {
    headline: "Capisci con chiarezza il tuo equilibrio Omega",
    supporting: "Un semplice test del sangue ti dà una misurazione personale del tuo equilibrio tra Omega-6 e Omega-3, basata sui tuoi valori.",
    trust: "Un percorso semplice. Un risultato chiaro.",
  },
};

export const trustItemsByLang: Record<Lang, string[]> = {
  sv: ["Blodbaserat test", "Enkelt att göra hemma", "Personligt mätresultat"],
  en: ["Blood-based test", "Easy to do at home", "Personal measurement result"],
  no: ["Blodbasert test", "Enkelt å gjøre hjemme", "Personlig måleresultat"],
  da: ["Blodbaseret test", "Let at lave derhjemme", "Personligt måleresultat"],
  fi: ["Veripohjainen testi", "Helppo tehdä kotona", "Henkilökohtainen mittaustulos"],
  de: ["Blutbasierter Test", "Einfach zu Hause", "Persönliches Messergebnis"],
  fr: ["Test sanguin", "Simple à faire chez soi", "Résultat de mesure personnel"],
  it: ["Test basato sul sangue", "Facile da fare a casa", "Risultato di misurazione personale"],
};

export const insightCopyByLang: Record<
  Lang,
  { title: string; body: string; points: string[]; closingTitle: string; closingBody: string }
> = {
  sv: {
    title: "Många har aldrig mätt sin omega-balans",
    body: "Det är vanligt att utgå från kost eller känsla, men utan ett mätresultat är det svårt att veta hur balansen faktiskt ser ut.",
    points: ["Blodbaserat test", "Enkelt att göra hemma", "Personligt mätresultat"],
    closingTitle: "Redo att ta nästa steg?",
    closingBody: "Börja med testet och få ett tydligt mätresultat för din omega-balans.",
  },
  en: {
    title: "Most people have never measured their omega balance",
    body: "It is easy to go by diet, habits, or guesswork. Without a measurement result, it is hard to know where your balance actually stands.",
    points: ["Blood-based test", "Easy to do at home", "Personal measurement result"],
    closingTitle: "Ready to take the next step?",
    closingBody: "Start with the test and get a clear result for your omega balance.",
  },
  no: {
    title: "Mange har aldri målt omega-balansen sin",
    body: "Det er lett å gå ut fra kosthold, vaner eller følelse. Uten et måleresultat er det vanskelig å vite hvor balansen faktisk ligger.",
    points: ["Blodbasert test", "Enkelt å gjøre hjemme", "Personlig måleresultat"],
    closingTitle: "Klar for neste steg?",
    closingBody: "Start med testen og få et tydelig måleresultat for omega-balansen din.",
  },
  da: {
    title: "Mange har aldrig målt deres omega-balance",
    body: "Det er let at gå ud fra kost, vaner eller fornemmelse. Uden et måleresultat er det svært at vide, hvor balancen faktisk ligger.",
    points: ["Blodbaseret test", "Let at lave derhjemme", "Personligt måleresultat"],
    closingTitle: "Klar til næste skridt?",
    closingBody: "Start med testen og få et tydeligt måleresultat for din omega-balance.",
  },
  fi: {
    title: "Useimmat eivät ole koskaan mitanneet omega-tasapainoaan",
    body: "On helppo nojata ruokavalioon, tapoihin tai tuntemukseen. Ilman mittaustulosta on kuitenkin vaikea tietää, missä tasapaino oikeasti on.",
    points: ["Veripohjainen testi", "Helppo tehdä kotona", "Henkilökohtainen mittaustulos"],
    closingTitle: "Valmis seuraavaan askeleeseen?",
    closingBody: "Aloita testillä ja saat selkeän tuloksen omega-tasapainostasi.",
  },
  de: {
    title: "Viele haben ihre Omega-Balance noch nie gemessen",
    body: "Oft orientiert man sich an Ernährung oder Gewohnheiten. Ohne Messergebnis ist es jedoch schwer nachzuvollziehen, wie das Verhältnis tatsächlich aussieht.",
    points: ["Blutbasierter Test", "Einfach zu Hause", "Persönliches Messergebnis"],
    closingTitle: "Bereit für den nächsten Schritt?",
    closingBody: "Starte mit dem Test und erhalte ein klares Messergebnis für deine Omega-Balance.",
  },
  fr: {
    title: "Beaucoup n'ont jamais mesuré leur équilibre oméga",
    body: "Il est facile de se fier à l'alimentation, aux habitudes ou au ressenti. Sans résultat de mesure, il est difficile de savoir où se situe réellement l'équilibre.",
    points: ["Test sanguin", "Simple à faire chez soi", "Résultat de mesure personnel"],
    closingTitle: "Prêt pour la prochaine étape ?",
    closingBody: "Commencez par le test et obtenez un résultat clair pour votre équilibre oméga.",
  },
  it: {
    title: "Molte persone non hanno mai misurato il proprio equilibrio Omega",
    body: "È facile basarsi su alimentazione, abitudini o sensazioni. Senza un risultato di misurazione è difficile capire dove si trovi davvero l'equilibrio.",
    points: ["Test basato sul sangue", "Facile da fare a casa", "Risultato di misurazione personale"],
    closingTitle: "Pronto per il prossimo passo?",
    closingBody: "Inizia con il test e ottieni un risultato chiaro per il tuo equilibrio Omega.",
  },
};
