# Master Work Plan

Senast uppdaterad: 2026-03-26

Det här är vår gemensamma arbetsplan för att få OmegaBalance i hamn och göra projektet operativt, stabilt och mätbart.

## Hur Vi Använder Den

- Vi jobbar alltid från den här listan när vi ska välja nästa steg.
- `[x]` betyder klart.
- `[ ]` betyder kvar att göra.
- När något är klart flyttar vi det hit i stället för att låta det ligga kvar i lösa chattar eller tillfälliga anteckningar.

## Nuvarande Fokus

Målet just nu är att få hela funneln att fungera som ett operativt system:

- stabil databas och routing
- tydlig adminöverblick
- riktig eventtracking
- bättre beslutstöd för vad teamet ska göra härnäst

## Klart

### Infrastruktur Och Live-Readiness

- [x] Devmiljön fungerar igen på `localhost:8080`
- [x] `track-click-and-redirect` stödjer `consultation`
- [x] konsultationsrouting fungerar även mot äldre partnerfält
- [x] partner live-readiness och partner-RLS är uppdaterade i Supabase
- [x] migration för `funnel_events` är applicerad i databasen
- [x] edge function `track-funnel-event` är deployad

### Partner- Och Adminflöde

- [x] legal-knappen i partnervyn fungerar rätt även när admin granskar
- [x] ZZ-link readiness kräver nu fyra länkar i UI och datalager
- [x] partner- och admin-dialoger stödjer konsultationslänk
- [x] partnerfunnel finns i admin med steg, tapp och flaskhalsar
- [x] admin visar mikroevent och senaste funnel-händelser

### Growth Compass Och Affärslogik

- [x] Growth Compass är tydligare ZZ-anpassad
- [x] svenska milestones, explanations och next actions är förbättrade
- [x] scenariotester för Growth Compass finns och passerar

### Eventtracking

- [x] `landing_viewed` loggas
- [x] hero/sticky/closing CTA-events loggas
- [x] leadform start, submit och submit-fel loggas
- [x] partnerform start, submit och submit-fel loggas
- [x] klientlager för eventkö/retry finns
- [x] live smoke test mot deployad `track-funnel-event` gav giltigt `event_id`

### Kvalitet Och Verifiering

- [x] tester för funnel, referral, lead capture och partnerpage passerar
- [x] produktionbuild passerar
- [x] footertexten är uppdaterad till tryggare formulering om Zinzino

## Pågår Nu

- [ ] verifiera att riktiga funnel-events kommer in live i admin efter verkliga testflöden i inloggad adminsession
- [ ] kontrollera att alla nya event visas rätt i dashboarden med live-Supabase-data
- [ ] fortsätta rensa mojibake och språkglapp i svensk copy

## Nästa Viktigaste

### 1. Verifiera Liveflödet End-To-End

- [ ] gör ett riktigt testflöde från landning till CTA
- [ ] gör ett riktigt kundformulärsflöde
- [ ] gör ett riktigt partnerformulärsflöde
- [ ] bekräfta att events syns i admin
- [ ] bekräfta att `referral_code`, `session_id` och `utm_*` följer med korrekt

### 2. Tidsmått I Funneln

- [x] mät tid från `landing_viewed` till CTA-klick
- [x] mät tid från CTA-klick till formstart
- [x] mät tid från formstart till skickat formulär
- [ ] mät tid från partnerlead till kandidat
- [ ] mät tid från kandidat till onboarding redo
- [ ] mät tid från portalpartner till fyra länkar klara
- [ ] mät tid från fyra länkar till aktiv signal
- [x] visa ledtid i admin

### 3. Bättre Attribution

- [ ] stärk first-touch attribution
- [ ] stärk latest-touch attribution
- [ ] säkerställ stitching mellan visit, click, lead och event
- [ ] verifiera multi-step attribution i både kund- och partnerspår

## Därefter

### Operativ Förbättring

- [ ] skapa tydligare stuck-lists per steg i admin
- [ ] visa vilka leads som är klara men ännu inte onboardade
- [ ] visa vilka partners som har setup men ingen aktivitet
- [ ] visa vilka partners som rör sig mot duplicering

### UX Och Conversion

- [ ] rensa kvarvarande svensk copy och teckenkodningsfel
- [ ] förbättra mobil-UX i formulär
- [ ] förbättra felmeddelanden och fallback vid trackingfel
- [ ] se över partnerpage-copy kring varför modellen byggs inom Zinzino

### Prestanda

- [ ] börja dela upp stora dashboard-chunks
- [ ] minska buildvarningar kring JS-bundlen

## Senare Optimering

- [ ] A/B-test-infrastruktur för CTA och rubriker
- [ ] försiktig utökning av leadkvalitetsfält om datan visar behov
- [ ] mer automatiserad onboarding efter att funneln är helt observerbar
- [ ] sätt upp automatiska mejlflöden: bekräftelsemail vid nytt lead, välkomstmail efter godkännande/onboarding och utskick via Supabase + mejltjänst
- [ ] mer avancerad funnelanalys per källa, partner och marknad

## Innan Vi Kan Säga "I Hamn"

- [ ] funneln är helt verifierad live
- [ ] admin används som verkligt arbetsverktyg, inte bara översikt
- [ ] partnerresan känns färdig från login till aktivitet
- [ ] svenska copyt är rent och konsekvent
- [ ] event och funneldata används för veckovis uppföljning

## Nästa Konkreta Arbetsordning

1. Verifiera live-events i admin med riktiga testflöden
2. Bygg tidsmått mellan stegen
3. Förbättra attributionen
4. Rensa copy/UX
5. Optimera först därefter
