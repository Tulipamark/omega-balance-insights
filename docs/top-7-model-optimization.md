# Top 7 Model Optimization

## Syfte

Det här är den skarpa arbetsordningen för att göra modellen starkare där det faktiskt påverkar:

- attribution
- partnerkonvertering
- aktivering
- duplicering
- första resultat

Den här listan är kortare än `top-10-execution-list.md` och mer direkt kopplad till själva motorn.

## 1. Referral och ägarskap måste vara bergsäkert

Status: `Pågår`

Målet:

- rätt partnerlänk ska alltid leda till rätt ägarskap
- partner- och kundintresse ska inte kunna “bli generellt” av misstag

Verkställt nu:

- kundformuläret kräver redan giltig referral-länk
- partneransökan kräver nu också giltig partnerlänk
- testskydd finns nu för partneransökan med och utan giltig referral

## 2. Partnerresan från intresse till teammedlem måste vara friktionsfri

Status: `Pågår`

Målet:

- ingen ska fastna mellan partnerlead, kandidat, ZZ-join och teammedlem

Redan starkt:

- kandidat -> teammedlem-regeln är hårdare i både UI och backend
- admin visar blockerare, nästa kontakt och kontaktform tydligare

## 3. Första partnerupplevelsen måste ge rörelse direkt

Status: `Pågår`

Målet:

- första inloggning ska snabbt leda till rätt handling

Redan starkt:

- legal acceptance före vanlig dashboard
- tre ZZ-länkar som grund
- första 30 dagar
- gör detta nu

## 4. Dupliceringslagret måste bli ännu mer praktiskt

Status: `Pågår`

Målet:

- partners ska lära sig ett arbetssätt som går att upprepa

Redan starkt:

- praktiskt arbetssätt i partnerläget
- stöd uppåt/nedåt
- publika partnersidan visar nu partnerresan tydligare

## 5. Publika partnersidan måste förklara modellen utan att bli tung

Status: `Pågår`

Målet:

- sälja in modellen vuxet
- hjälpa rätt personer att förstå om det passar dem

Verkställt nu:

- bättre struktur
- bättre språk
- mer bevisnära argument
- `Läs mer` där textmassan annars blir för tung

## 6. Första resultat måste komma snabbare

Status: `Nästa`

Målet:

- ny partner ska snabbare komma till:
  - första lead
  - första samtal
  - första test
  - första tydliga signal

## 7. Fokuserad testtäckning på kärnflöden

Status: `Pågår`

Målet:

- skydda de delar som lättast kan regressa när vi bygger vidare

Verkställt nu:

- lead capture
- referral tracking
- ZZ-länkvalidering
- partneransökan via giltig referral
