# Top 10 Execution List

## Syfte

Det här är den korta, prioriterade listan jag kan beta av i ordning utan att vänta på ny styrning mellan varje liten uppgift.

Den är inte till för strategi.

Den är till för execution.

Varje punkt ska helst:

- göra flödet sannare
- göra produkten lättare att använda
- minska risk före skarpare användning

## Statusnyckel

- `Klar` = tillräckligt bra för nu
- `Pågår` = aktivt spår som jag ska fortsätta på utan att invänta ny prompt
- `Nästa` = nästa punkt att ta direkt efter pågående
- `Sedan` = viktig, men inte före de öppna punkterna

---

## 1. Manuellt UI-pass end-to-end

Status: `Pågår`

Det här ska gås igenom:

- Omega-länk in
- lead capture
- admin review
- kandidat -> teammedlem
- redirect till rätt ZZ-destination

Redan gjort:

- teknisk verifiering av lead capture
- bygg, lint och riktade tester
- skärpt kandidat -> teammedlem-regel i både UI och backend
- säkrare ZZ-länkvalidering

Kvar:

- ett riktigt kort manuellt browserpass

## 2. Finjustera partnerflödet efter verklig friktion

Status: `Pågår`

Redan gjort:

- `Fokus just nu`
- `Den här veckan`
- progress mot första resultat
- snabbåtgärder i partneröversikten
- bättre tomläge i prioriterade leads
- tydligare leadstatus
- filter för `Alla`, `Brådskande`, `Aktiva`, `Nya`
- kompakt nulägesrad för leads

Kvar:

- fortsätta justera när verklig användning visar konkret friktion

## 3. Skärp kandidat -> teammedlem-copy

Status: `Klar`

Klart nu:

- tydligare språk i admindialogen
- tydligare blockerare
- tydligare skillnad mellan kandidat, verifierad ZZ-join och redo teammedlem
- tydligare språk om när portalåtkomst faktiskt ska skapas

## 4. Förfina första-resultat-logiken i partnervyn

Status: `Pågår`

Redan gjort:

- fasstyrd första 30 dagar-logik
- `Fokus just nu`
- `Nästa handling`
- veckoplan

Kvar:

- finjustera copy och växlingar efter verklig användning

## 5. Skärp leadprioriteringen ytterligare

Status: `Pågår`

Redan gjort:

- `Läge`
- `Brådskande`
- prioriterad uppföljningsyta
- filterspår
- kompakt kösammanfattning
- adminsortering som lyfter mest relevanta partneransökningar först

Kvar:

- eventuellt ännu hårdare standardsortering
- eventuellt ännu tydligare handling per leadnivå

## 6. Gör kärna-lagret mer praktiskt

Status: `Pågår`

Ska förtydliga hur `kärna` fungerar som stödlager:

- tätare rytm
- närmare support
- privat grupp / Zoom

Redan gjort:

- enkel kärna-/avvakta-signal i admin
- nästa steg i kärnan visas nu mer konkret som stöduppgifter

Kvar:

- finjustera det mot verkligt arbetssätt när ni börjar använda kärnlagret mer aktivt

Målet:

- kärna ska kännas användbart, inte symboliskt

## 7. Fortsätt trimma lågnyttiga ytor

Status: `Pågår`

Redan gjort:

- flera adminblock har krympts eller flyttats till dialog
- partneröversikten har blivit mer handlingsdriven
- lågnyttig metriktung yta har fortsatt trimmas

Kvar:

- fortsätta kapa eller krympa UI som tar plats men inte hjälper beslut eller handling

Målet:

- lättare admin
- lättare partnerläge

## 8. Märk upp kvarvarande mock/tolkning ännu tydligare där det behövs

Status: `Sedan`

Ska gå igenom ytor där användaren annars kan övertolka datan.

Målet:

- ingen falsk säkerhet

## 9. Utöka testtäckningen där den ger mest skydd

Status: `Pågår`

Redan gjort:

- riktade tester för lead capture
- riktade tester för ZZ-länkvalidering
- referraltest som skyddar mot dubbelspårning av samma landning
- utökad fokuserad testsvit som fortsatt går grönt

Kvar:

- fortsätta lägga tester på kritiska flöden som lätt kan regressa
- lägga till fler tester först när de skyddar verkliga arbetsflöden, inte bara smådetaljer

## 10. Förbered första lilla verkliga användningstillfället

Status: `Sedan`

När ovanstående sitter bättre:

- kör första lilla riktiga användningen
- följ upp var det fastnar
- förbättra efter faktisk signal

Målet:

- gå från intern produkt till verklig användning stegvis

---

## Vad jag ska göra utan ny puff

När jag jobbar vidare själv ska jag i första hand:

1. fortsätta på högsta punkt som står som `Pågår`
2. när den inte kan drivas längre utan riktig användarsignal, ta första punkt som står som `Nästa`
3. verifiera varje pass med lint, test eller tydlig kontroll
4. bara därefter röra nästa punkt

## Nästa automatiska ordning

Det här är ordningen jag ska fortsätta i utan att du behöver starta om mig mellan varje steg:

1. fortsätta förbättra partnerflödet
2. fortsätta förbättra leadprioritering
3. göra kärna-lagret mer praktiskt
4. fortsätta trimma lågnyttiga ytor
5. utöka testtäckningen där det ger mest skydd

## Inte på denna lista

Det här ska inte tränga sig före topp 10 just nu:

- fake payout-logik
- duplicerat ZZ-träd
- ny stor strategiexpansion
- tung dashboard-BI
- funktioner som ser imponerande ut men inte hjälper vardagsanvändning
