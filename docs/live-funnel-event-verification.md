# Live Funnel Event Verification

Senast uppdaterad: 2026-03-26

## Status Just Nu

- `track-funnel-event` är deployad till Supabase-projektet `gnnelrwnqbkwvzqyfsnm`
- migration för `funnel_events` är applicerad
- live smoke test mot funktionen är genomfört
- funktionen svarade med:
  - `ok: true`
  - `event_id: b591ced6-233e-4765-885e-faa734464ac9`

Det betyder att live-ingestion fungerar.

Det som återstår är att visuellt bekräfta i admin att eventen också läses och visas rätt i den inloggade dashboarden.

## Vad Som Är Bekräftat

- event kan skickas till produktion
- event skrivs via deployad edge function
- databasen och migrationsspåret är i fas

## Vad Som Återstår

- bekräfta att admin ser eventen i:
  - `Mikroevent i funneln`
  - `Event per steg`
  - `Senaste funnel-händelser`

## Manuell Verifiering

### 1. Skapa riktiga events

Gör ett enkelt testflöde i site eller localhost:

1. öppna en referral-länk
2. klicka på hero-CTA
3. börja fylla i kundformuläret
4. skicka formuläret

Gör även ett partnerflöde:

1. öppna partnerlandningen
2. klicka på partner-CTA
3. börja fylla i partnerformuläret
4. skicka eller trigga ett avsiktligt fel

### 2. Öppna admin

Gå till admin och kontrollera:

- att `Landningar` ökar
- att `CTA-klick` ökar
- att `Formstarter` ökar
- att `Skickade formulär` eller `Submit-fel` ökar

### 3. Kontrollera eventlogg

I admin, kontrollera att senaste event visar:

- rätt `event`
- rätt `sida`
- rätt `referral`
- rimlig `detalj`

## Om Något Ser Fel Ut

Kontrollera i den här ordningen:

1. att referral-länken faktiskt används
2. att `session_id` skapas och återanvänds
3. att eventet finns i `Senaste funnel-händelser`
4. att admin är inloggad med rätt roll
5. att eventnamnet finns i mappningen i `AdminDashboardPage.tsx`

## Nästa Steg Efter Godkänd Verifiering

1. bygg tidsmått mellan stegen
2. visa ledtid i admin
3. stärk attributionen mellan visit, click, event och lead
