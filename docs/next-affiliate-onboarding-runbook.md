# Next Affiliate Onboarding Runbook

Det här är minsta säkra processen för nästa riktiga affiliate.

## Mål

Få in en ny affiliate utan att upprepa felen vi såg innan `PER8421` blev verifierad.

## Körordning

1. Skapa konto i auth
- affiliaten måste ha ett riktigt konto först
- utan konto blir spåret blockerat direkt

2. Skapa eller bekräfta rad i `public.users`
- måste peka på rätt `auth_user_id`
- sätt:
  - `name`
  - `email`
  - `role = 'partner'`
  - `referral_code`

3. Skapa eller bekräfta rad i `public.partners`
- måste peka på rätt `users.id`
- sätt minst:
  - `user_id`
  - `referral_code`
  - `status`
  - `zinzino_test_url`
  - `zinzino_shop_url`
  - `zinzino_partner_url`
- sätt `consultation_url` när den CTA:n används aktivt igen
- sätt `market_code` när live-DB stöder det eller när marknadsstyrning används skarpt

4. Verifiera constraints innan test
- referral-koden måste följa DB-formatet
- om partner-raden redan finns får `referral_code` normalt inte ändras
- `verified` kräver kompletta live-länkar

5. Kör smoke test
- öppna `/{lang}?ref=KOD`
- klicka varje aktiv CTA i UI
- verifiera redirect
- verifiera dataskrivning i:
  - `public.referral_visits`
  - `public.outbound_clicks`

6. Klassificera affiliaten
- `tekniskt klar`: setup finns och routing kan testas
- `liveklar`: routing är verifierad med riktiga länkar i verkligt flöde

## Måste-ha data

### `public.users`

- `auth_user_id`
- `name`
- `email`
- `role = 'partner'`
- `referral_code`

### `public.partners`

- `user_id`
- `referral_code`
- `status`
- `zinzino_test_url`
- `zinzino_shop_url`
- `zinzino_partner_url`
- `verified_at` när status blir `verified`

## Acceptanskriterier

### Tekniskt klar

- konto finns i auth
- rad finns i `public.users`
- rad finns i `public.partners`
- referral-koden löser till rätt partner
- minst en CTA kan testas utan fel

### Liveklar

- `status = 'verified'`
- alla aktiva destinationslänkar fungerar
- live smoke test är godkänt
- eventdata skrivs korrekt i databasen
- affiliate är införd i [live-referral-registry.md](./live-referral-registry.md)

## Stoppskyltar

Stoppa onboarding direkt om:

- konto saknas i auth
- `public.users` saknas
- `public.partners` pekar på fel användare
- referral-koden bryter formatkrav
- live-länkar saknas men status ändå sätts till `verified`
