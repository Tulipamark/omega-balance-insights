import type { Lang } from "@/lib/i18n";

export const funnelHeroCopy: Record<Lang, { headline: string; supporting: string; trust: string }> = {
  sv: {
    headline: "Testa din Omega-balans på 2 minuter",
    supporting: "De flesta vet inte hur deras omega-6/omega-3-balans faktiskt ser ut. Det här enkla hemmatestet ger dig svart på vitt.",
    trust: "Enkelt hemmatest • Tydligt resultat • Tar bara några minuter",
  },
  en: {
    headline: "Test your Omega balance in 2 minutes",
    supporting: "Most people do not know what their omega-6/omega-3 balance actually looks like. This simple home test gives you a clear answer.",
    trust: "Simple home test • Clear result • Only takes a few minutes",
  },
  no: {
    headline: "Test Omega-balansen din på 2 minutter",
    supporting: "De fleste vet ikke hvordan omega-6/omega-3-balansen deres faktisk ser ut. Denne enkle hjemmetesten gir deg et tydelig svar.",
    trust: "Enkel hjemmetest • Tydelig resultat • Tar bare noen minutter",
  },
  da: {
    headline: "Test din Omega-balance på 2 minutter",
    supporting: "De fleste ved ikke, hvordan deres omega-6/omega-3-balance faktisk ser ud. Denne enkle hjemmetest giver dig et klart svar.",
    trust: "Enkel hjemmetest • Tydeligt resultat • Tager kun få minutter",
  },
  fi: {
    headline: "Testaa Omega-tasapainosi 2 minuutissa",
    supporting: "Useimmat eivät tiedä, miltä heidän omega-6/omega-3-tasapainonsa oikeasti näyttää. Tämä helppo kotitesti antaa sinulle selvän vastauksen.",
    trust: "Helppo kotitesti • Selkeä tulos • Vie vain muutaman minuutin",
  },
  de: {
    headline: "Teste deine Omega-Balance in 2 Minuten",
    supporting: "Die meisten wissen nicht, wie ihr Omega-6/Omega-3-Verhältnis tatsächlich aussieht. Dieser einfache Heimtest gibt dir eine klare Antwort.",
    trust: "Einfacher Heimtest • Klares Ergebnis • Dauert nur wenige Minuten",
  },
  fr: {
    headline: "Testez votre équilibre oméga en 2 minutes",
    supporting: "La plupart des gens ne savent pas à quoi ressemble réellement leur équilibre oméga-6/oméga-3. Ce test simple à domicile vous donne une réponse claire.",
    trust: "Test simple à domicile • Résultat clair • Seulement quelques minutes",
  },
  it: {
    headline: "Testa il tuo equilibrio Omega in 2 minuti",
    supporting: "La maggior parte delle persone non sa davvero com'è il proprio equilibrio Omega-6/Omega-3. Questo semplice test da casa ti dà una risposta chiara.",
    trust: "Semplice test da casa • Risultato chiaro • Richiede solo pochi minuti",
  },
};

export const trustItemsByLang: Record<Lang, string[]> = {
  sv: ["Blodbaserat test", "Enkelt att göra hemma", "Personliga resultat"],
  en: ["Blood-based test", "Easy to do at home", "Personal results"],
  no: ["Blodbasert test", "Enkelt å gjøre hjemme", "Personlige resultater"],
  da: ["Blodbaseret test", "Let at lave derhjemme", "Personlige resultater"],
  fi: ["Veripohjainen testi", "Helppo tehdä kotona", "Henkilökohtaiset tulokset"],
  de: ["Blutbasierter Test", "Einfach zu Hause", "Persönliche Ergebnisse"],
  fr: ["Test sanguin", "Simple à faire chez soi", "Résultats personnalisés"],
  it: ["Test basato sul sangue", "Facile da fare a casa", "Risultati personalizzati"],
};

export const insightCopyByLang: Record<Lang, { title: string; body: string; points: string[]; closingTitle: string; closingBody: string }> = {
  sv: {
    title: "De flesta har en obalans mellan Omega-6 och Omega-3 - utan att veta om det.",
    body: "Det kan påverka hur du mår i vardagen och göra det svårare att förstå vad kroppen faktiskt behöver.",
    points: ["Inflammation", "Energi", "Allmän hälsa"],
    closingTitle: "Redo att ta nästa steg?",
    closingBody: "Börja med testet och få en tydligare bild av din balans.",
  },
  en: {
    title: "Most people have an imbalance between Omega-6 and Omega-3 without knowing it.",
    body: "It can affect how you feel day to day and make it harder to understand what your body actually needs.",
    points: ["Inflammation", "Energy", "Overall health"],
    closingTitle: "Ready for the next step?",
    closingBody: "Start with the test and get a clearer picture of your balance.",
  },
  no: {
    title: "De fleste har en ubalanse mellom Omega-6 og Omega-3 uten å vite det.",
    body: "Det kan påvirke hvordan du føler deg i hverdagen og gjøre det vanskeligere å forstå hva kroppen faktisk trenger.",
    points: ["Inflammasjon", "Energi", "Generell helse"],
    closingTitle: "Klar for neste steg?",
    closingBody: "Start med testen og få et tydeligere bilde av balansen din.",
  },
  da: {
    title: "De fleste har en ubalance mellem Omega-6 og Omega-3 uden at vide det.",
    body: "Det kan påvirke, hvordan du har det i hverdagen, og gøre det sværere at forstå, hvad kroppen faktisk har brug for.",
    points: ["Inflammation", "Energi", "Generel sundhed"],
    closingTitle: "Klar til næste skridt?",
    closingBody: "Start med testen og få et tydeligere billede af din balance.",
  },
  fi: {
    title: "Useimmilla on epätasapaino Omega-6:n ja Omega-3:n välillä tietämättään.",
    body: "Se voi vaikuttaa siihen, miltä sinusta tuntuu arjessa, ja vaikeuttaa ymmärtämään, mitä kehosi oikeasti tarvitsee.",
    points: ["Tulehdus", "Energia", "Yleinen terveys"],
    closingTitle: "Valmis seuraavaan askeleeseen?",
    closingBody: "Aloita testillä ja saat selkeämmän kuvan tasapainostasi.",
  },
  de: {
    title: "Die meisten Menschen haben ein Ungleichgewicht zwischen Omega-6 und Omega-3, ohne es zu wissen.",
    body: "Das kann sich auf dein tägliches Wohlbefinden auswirken und es schwieriger machen zu verstehen, was dein Körper wirklich braucht.",
    points: ["Entzündung", "Energie", "Allgemeine Gesundheit"],
    closingTitle: "Bereit für den nächsten Schritt?",
    closingBody: "Beginne mit dem Test und erhalte ein klareres Bild deiner Balance.",
  },
  fr: {
    title: "La plupart des gens ont un déséquilibre entre oméga-6 et oméga-3 sans le savoir.",
    body: "Cela peut influencer votre quotidien et rendre plus difficile la compréhension de ce dont votre corps a réellement besoin.",
    points: ["Inflammation", "Énergie", "Santé générale"],
    closingTitle: "Prêt pour la prochaine étape ?",
    closingBody: "Commencez par le test et obtenez une vision plus claire de votre équilibre.",
  },
  it: {
    title: "La maggior parte delle persone ha uno squilibrio tra Omega-6 e Omega-3 senza saperlo.",
    body: "Può influire su come ti senti ogni giorno e rendere più difficile capire di cosa il corpo abbia davvero bisogno.",
    points: ["Infiammazione", "Energia", "Salute generale"],
    closingTitle: "Pronto per il prossimo passo?",
    closingBody: "Inizia dal test e ottieni un quadro più chiaro del tuo equilibrio.",
  },
};
