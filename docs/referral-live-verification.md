# Referral Live Verification

Den här checklistan är byggd för drift, inte för teori. Varje punkt ska markeras som `Godkänd`, `Underkänd` eller `Blockerad`.

## Nuvarande avgränsning

- `PER8421` är nu verifierad live end-to-end med riktiga länkar och riktig dataskrivning.
- `JORGEN` är för närvarande blockerad eftersom han ännu saknar konto / användarrad i `public.users`.
- `consultation` är inte blockerande för nuvarande live-MVP eftersom den CTA:n inte ligger i aktivt funnel-flöde just nu.
- Målet just nu är:
  - bevisa att motorn fungerar live med `PER8421`
  - förbereda systemet för fler affiliates när `JORGEN` får konto
  - inte låta Jörgens saknade konto blockera verifieringen av `PER8421`

## Låst

Rör inte dessa delar om inget konkret fel hittas under live-test.

### `src/lib/referral.ts`

- Ansvar:
  - Läser `?ref=`
  - Sparar referral i `localStorage` / cookie
  - Skapar och återanvänder `session_id`
  - Triggar `trackVisit`
- Godkänd när:
  - `ref` läses korrekt från URL
  - samma `ref` överlever navigation
  - samma `session_id` återanvänds
- Bevis:
  - browser devtools `localStorage`
  - browser devtools `Application > Cookies`
  - rader i `public.referral_visits`

### `src/components/TrackedOutboundButton.tsx`

- Ansvar:
  - Hämtar aktiv referral
  - Hämtar eller skapar `session_id`
  - Skickar klick till edge innan redirect
  - Fallbackar bara när referral saknas eller inte kan routas
- Godkänd när:
  - `ref`, `type`, `session_id` skickas i request
  - redirect går till rätt destination
  - fel eller fallback sker kontrollerat
- Bevis:
  - browser devtools `Network`
  - rader i `public.outbound_clicks`

### `supabase/functions/track-click-and-redirect/index.ts`

- Ansvar:
  - Tar emot `ref`, `type`, `session_id`
  - Slår upp partner via `referral_code`
  - Validerar `status`
  - Hämtar rätt destinationsfält
  - Loggar klick i `outbound_clicks`
- Godkänd när:
  - giltig referral ger rätt destination
  - ogiltig referral ger `partner_not_found`
  - icke-verifierad partner ger `partner_not_verified`
  - fel CTA-typ aldrig går till fel länk
- Bevis:
  - edge logs
  - `public.outbound_clicks`
  - faktisk redirect i browsern

### `supabase/migrations/20260320_patch_schema_drift.sql`

- Ansvar:
  - säkrar målbilden för `public.partners`
  - säkrar `public.referral_visits`
  - säkrar `public.outbound_clicks`
- Notering:
  - live-projektet ligger fortfarande på ett äldre schema än målbilden
  - verifieringen ovan bevisar ändå att den nuvarande live-tabellen räcker för aktiv MVP
- Bevis:
  - queryresultat i Supabase SQL editor

## Måste Verifieras Live

Kör varje test och fyll i status.

### Test 1: `?ref=PER8421` end-to-end

- Ansvariga filer:
  - `src/lib/referral.ts`
  - `src/components/TrackedOutboundButton.tsx`
  - `supabase/functions/track-click-and-redirect/index.ts`
- Test:
  - öppna `/?ref=PER8421` eller `/{lang}?ref=PER8421`
  - klicka hero-CTA för `test`
  - klicka closing CTA för `test`
  - `shop` testas först när den CTA:n finns i aktivt UI
  - `partner` testas först när den CTA:n finns i aktivt UI
  - `consultation` testas bara om den CTA:n återaktiveras i flödet
- Förväntat:
  - `ref=PER8421` lever kvar
  - samma `session_id` används
  - rätt `zinzino_test_url` används för båda aktiva `test`-CTA:erna
  - klick loggas korrekt
- Bevis:
  - `public.referral_visits`
  - `public.outbound_clicks`
  - faktisk redirect-url
- Teknisk status:
  - [x] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad
- Live-status:
  - [x] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad

### Test 2: `?ref=JORGEN` tekniskt end-to-end

- Ansvariga filer:
  - `src/lib/referral.ts`
  - `src/components/TrackedOutboundButton.tsx`
  - `supabase/functions/track-click-and-redirect/index.ts`
- Test:
  - blockerad tills `JORGEN` har en riktig rad i `public.users`
- Förväntat:
  - ingen körning sker innan konto finns
- Bevis:
  - användarrad i `public.users`
  - därefter partnerrad i `public.partners`
- Teknisk status:
  - [ ] Godkänd
  - [ ] Underkänd
  - [x] Blockerad
- Live-status:
  - [x] Ej live-verifierad ännu
  - [ ] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad

### Test 3: Referral överlever navigation

- Ansvariga filer:
  - `src/lib/referral.ts`
- Test:
  - landa med `?ref=PER8421`
  - navigera mellan flera sidor
  - klicka CTA från annan sida än landningssidan
- Förväntat:
  - referral tappas inte
  - `session_id` återanvänds
  - klick loggas med samma `ref` och `session_id`
- Bevis:
  - `localStorage`
  - `public.outbound_clicks`
- Teknisk status:
  - [ ] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad
- Live-status:
  - [ ] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad

### Test 4: Fallback sker bara när den ska

- Ansvariga filer:
  - `src/components/TrackedOutboundButton.tsx`
  - `supabase/functions/track-click-and-redirect/index.ts`
- Testfall:
  - giltig `ref=PER8421`
  - ogiltig `ref=TEST123`
  - ingen `ref`
- Förväntat:
  - giltig referral -> affiliate-destination
  - ogiltig eller saknad referral -> kontrollerad fallback
  - fallback sker inte för giltig referral
- Bevis:
  - browser redirect
  - `public.outbound_clicks`
- Teknisk status:
  - [ ] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad
- Live-status:
  - [ ] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad

### Test 5: Rätt CTA går till rätt destinationsfält

- Ansvariga filer:
  - `src/components/TrackedOutboundButton.tsx`
  - `supabase/functions/track-click-and-redirect/index.ts`
- Kontroll:
  - `test` -> `zinzino_test_url`
  - `shop` -> `zinzino_shop_url` endast om CTA:n finns aktivt i UI
  - `partner` -> `zinzino_partner_url` endast om CTA:n finns aktivt i UI
  - `consultation` -> `consultation_url` endast om CTA:n används aktivt igen
- Bevis:
  - browser redirect
  - `public.outbound_clicks.destination_type`
  - `public.outbound_clicks.destination_url`
- Teknisk status:
  - [x] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad
- Live-status:
  - [x] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad

### Test 6: Faktisk dataskrivning i rätt tabeller

- Ansvariga delar:
  - `src/lib/referral.ts`
  - `supabase/functions/track-visit/index.ts`
  - `supabase/functions/track-click-and-redirect/index.ts`
- Kontroll:
  - session/visit skrivs i `public.referral_visits`
  - klick skrivs i `public.outbound_clicks`
  - `referral_code`, `session_id`, `destination_type`, `destination_url` är konsekventa
- Teknisk status:
  - [x] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad
- Live-status:
  - [x] Godkänd
  - [ ] Underkänd
  - [ ] Blockerad

## Minsta Nästa Driftsteg

### Steg A: Behåll `PER8421` som verifierad live-referens

- behåll `PER8421` som nuvarande verifierad live-affiliate
- säkerställ att länkarna fortsätter vara korrekta för aktiva CTA:er
- lägg till `JORGEN` först när han har en riktig användarrad i `public.users`

### Steg B: Rensa bort testposter

- ta bort eller markera gamla test-referrals
- se till att live-körning bara använder en tydlig sanning

### Steg C: Fortsatt live-test för `PER8421`

- minst ett fullständigt live-test för `PER8421`
- prioritera de CTA-typer som används aktivt nu: de två `test`-CTA:erna

### Steg D: Dokumentera utfall

Använd den här tabellen:

| Testnamn | Affiliate | CTA-typ | Förväntat | Faktiskt | Bevis | Teknisk status | Live-status |
|---|---|---|---|---|---|---|---|
| PER8421 end-to-end | PER8421 | test (hero) | Redirect till Pers testlänk | Bekräftad live | UI + outbound_clicks | Godkänd | Godkänd |
| PER8421 end-to-end | PER8421 | test (closing CTA) | Redirect till Pers testlänk | Bekräftad live | UI + outbound_clicks | Godkänd | Godkänd |
| PER8421 end-to-end | PER8421 | shop | Ej aktiv CTA i nuvarande funnel |  |  | Ej testad | Ej aktiv |
| PER8421 end-to-end | PER8421 | partner | Ej aktiv CTA i nuvarande funnel |  |  | Ej testad | Ej aktiv |
| PER8421 end-to-end | PER8421 | consultation | Ej aktiv CTA i nuvarande funnel |  |  | Ej blockerande | Ej blockerande |
| JORGEN tekniskt end-to-end | JORGEN | test | Blockerad tills konto finns |  |  | Blockerad | Ej live-verifierad |
| JORGEN tekniskt end-to-end | JORGEN | shop | Blockerad tills konto finns |  |  | Blockerad | Ej live-verifierad |
| JORGEN tekniskt end-to-end | JORGEN | partner | Blockerad tills konto finns |  |  | Blockerad | Ej live-verifierad |
| JORGEN tekniskt end-to-end | JORGEN | consultation | Ej aktiv CTA i nuvarande funnel |  |  | Blockerad | Ej live-verifierad |

## Körordning

1. Bekräfta att låsta filer inte ska röras.
2. Bekräfta `PER8421` som riktig affiliate.
3. Rensa bort testposter och oklara länkar.
4. Kör `?ref=PER8421` live end-to-end.
5. Testa navigation utan tappad referral.
6. Testa fallback med ogiltig och saknad referral.
7. Testa alla aktiva CTA-typer mot rätt destinationsfält.
8. Kontrollera `public.referral_visits`.
9. Kontrollera `public.outbound_clicks`.
10. Märk varje punkt `Godkänd`, `Underkänd` eller `Blockerad`.
11. Lägg till `JORGEN` först när konto finns.
12. Först därefter: adminförbättringar eller dashboard.
