# Systematisk To Do

## Syfte

Det här dokumentet är den praktiska huvudlistan för nästa produktpass.

Det ska hjälpa oss att hålla isär:

- vad som redan är klart
- vad som är kritiskt men inte färdigt
- vad som är nästa logiska steg
- vad som kan vänta

Målet är inte att samla allt möjligt.

Målet är att fokusera på det som faktiskt flyttar projektet mot verklig användning.

## Statusnyckel

- `Klart` = tillräckligt på plats för nu
- `Pågår` = aktivt spår som redan är inne i produkten men behöver skärpas
- `Nästa` = bör tas snart
- `Senare` = viktigt, men inte först

---

## 1. Produktens sanning

### 1.1 Omega är teamlager ovanpå Zinzino

Status: `Klart`

Det ska vara sant att:

- Omega inte framstår som ZZ-backoffice
- Zinzino äger officiell struktur, rank, kvalificering och kompensation
- Omega äger trafik, attribution, leads, onboardingstöd och teamstöd

Verifierat:

- portal-lifecycle är definierad
- admincopy och partnervy lutar åt rätt håll
- payout-/pseudo-ZZ-spår har städats bort från centrala ytor

Behåll fokus:

- inget nytt UI ska antyda officiell ZZ-sanning som vi inte äger

---

## 2. Inflöde och attribution

### 2.1 Omega-länk som primär väg in

Status: `Klart`

Det ska vara sant att:

- partnern delar Omega-länken utåt
- referralkod fångas via `?ref=` och slug
- session återanvänds genom flödet

Verifierat:

- referral- och lead-capture-tester passerar
- build och lint passerar

### 2.2 Redirect till rätt ZZ-destination

Status: `Klart`

Det ska vara sant att:

- rätt referral går till rätt partner
- rätt CTA-typ går till rätt destinationslänk
- ogiltig eller saknad routing faller tydligt

Verifierat:

- edge-funktioner finns
- lead-capture-test passerar
- live-verification-dokument finns

### 2.3 Link safety

Status: `Klart`

Det ska vara sant att:

- ZZ-länkar valideras tidigt
- felaktiga länkar stoppas innan redirect-läge

Verifierat:

- `updatePartnerZzLinks` kräver giltig `https://`
- test finns för giltig länk, `http://` och trasig URL

---

## 3. Lead capture

### 3.1 Kundleads och partnerleads hålls isär

Status: `Klart`

Det ska vara sant att:

- kundintresse och partnerintresse sparas som olika typer
- referral attribution följer med in

Verifierat:

- `upsert-lead` skiljer på leadtyper
- partner- och kundflöde använder samma attributlager

### 3.2 Fel ska synas tydligt

Status: `Pågår`

Det ska vara sant att:

- användaren får begripligt felmeddelande
- språket är rent och inte trasigt

Redan gjort:

- flera felmeddelanden i lead capture och outbound-knappar är städade

Kvar:

- fortsätta fånga språkliga glapp och teckenkodningsspår när de dyker upp

---

## 4. Kandidat till teammedlem

### 4.1 Ingen blir teammedlem för tidigt

Status: `Klart`

Det ska vara sant att:

- ingen blir teammedlem före aktiv ZZ-join
- ingen blir teammedlem före bekräftad vilja att bygga med oss

Verifierat:

- admin-UI visar blockerare
- review sparar både `zinzino_verified` och `team_intent_confirmed`
- onboarding-funktionen kräver båda

### 4.2 Admin ska förstå varför någon inte är redo

Status: `Pågår`

Det ska vara sant att:

- blockerare är lätta att läsa
- nästa steg är tydligt
- språket inte blir för internt eller för vagt

Redan gjort:

- blockerare visas i dialog
- check före teammedlem finns

Kvar:

- finjustera copy om något fortfarande känns oklart i faktisk användning

---

## 5. Teammedlem till kärna

### 5.1 Kärna ska vara stöd, inte prestige

Status: `Pågår`

Det ska vara sant att:

- kärna betyder tätare stöd, rytm och access
- kärna inte blir ett fake-ranksystem

Redan gjort:

- enkel kärna-/avvakta-signal finns i admin
- dokumentation finns för team engagement levels

Kvar:

- tydligare kriterier i praktisk användning
- ev. tydligare koppling till privata gruppen och Zoom-calls

---

## 6. Partnerns vardag

### 6.1 Första resultat

Status: `Pågår`

Det ska vara sant att:

- partnern snabbt förstår vad som är viktigast nu
- systemet hjälper mot första kontakt, första respons och första resultat

Redan gjort:

- `Dina första 30 dagar`
- `Fokus just nu`
- progress mot första resultat
- leadstatus med nästa handling

Kvar:

- fortsätta förfina faslogiken när vi ser verklig användning

### 6.2 Leads ska vara handlingsbara

Status: `Pågår`

Det ska vara sant att:

- partnern kan se vad som är nytt, aktivt och brådskande
- rätt leads flyter upp först

Redan gjort:

- filter för `Alla`, `Brådskande`, `Aktiva`, `Nya`
- `Läge` och `Brådskande`
- prioriterad lista för först att följa upp

Kvar:

- ev. ännu tydligare standardsortering om verklig användning visar behov
- ev. ännu skarpare text per leadnivå

### 6.3 Partnern äger sina egna ZZ-länkar

Status: `Klart`

Det ska vara sant att:

- partnern själv kan lägga in och ändra sina länkar
- admin inte blir flaskhals

Verifierat:

- stöd finns i partnerläget
- stöd finns även i admin
- validering sker i datalagret

---

## 7. Admin som arbetsyta

### 7.1 Admin ska vara lätt att skanna

Status: `Pågår`

Det ska vara sant att:

- stora block bara finns kvar om de hjälper beslut
- admin känns som arbetsyta, inte dashboardshow

Redan gjort:

- tillväxtkompass krympt
- tillväxtprognos krympt
- lågnyttiga block borttagna

Kvar:

- fortsätta trimma när något känns stort men svagt

### 7.2 Mock vs verkligt ska synas

Status: `Klart`

Det ska vara sant att:

- scenario, demo och intern tolkning är uppmärkta där det behövs

Verifierat:

- truth labels finns i känsliga adminblock

---

## 8. Live readiness

### 8.1 Minsta trygghet före verklig användning

Status: `Pågår`

Det ska vara sant att:

- länkar routar rätt
- leads sparas rätt
- attribution överlever
- teamåtkomst är avsiktlig
- mock inte ser ut som facit

Redan gjort:

- `live-readiness-light.md` finns
- liten sharp usage-pass-checklista finns
- build, lint och fokuserade tester passerar

Kvar:

- manuellt UI-pass i browsern mot hela kedjan

---

## 9. Test och verifiering

### 9.1 Tekniska verifieringar

Status: `Klart`

Verifierat nu:

- `npm run lint`
- `npm run build`
- `lead-capture.test.tsx`
- `zz-links.test.ts`

### 9.2 Manuell verifiering

Status: `Nästa`

Nästa manuella pass ska gå igenom:

- spara ZZ-länk
- skapa eller simulera partnerlead
- granska lead i admin
- försök skapa teammedlem för tidigt
- verifiera ZZ-join och build intent
- skapa teammedlem igen
- kontrollera att rätt redirect går till rätt destination

---

## 10. Prioriterad ordning just nu

### Nu

1. Kör ett kort manuellt UI-pass end-to-end
2. Fånga verklig friktion i partner- och adminflödet
3. Justera bara det som faktiskt stör användning

### Sedan

1. Finjustera första-resultat-logiken
2. Finjustera kandidat till teammedlem-kopian
3. Finjustera kärna-logiken som stödlager

### Inte nu

- fake payout-logik
- duplicerat ZZ-träd
- stor BI-yta
- ny stor strategi ovanpå nuvarande motor

---

## Enkel framstegssignal

Vi rör oss framåt på rätt sätt när detta är sant:

- partnern vet vad nästa steg är
- admin vet varför någon är blockerad eller redo
- rätt referral går till rätt destination
- teammedlemskap är avsiktligt
- systemet känns lättare att använda än tidigare
