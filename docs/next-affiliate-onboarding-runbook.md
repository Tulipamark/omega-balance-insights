# Next Affiliate Onboarding Runbook

Det här är minsta säkra processen för nästa riktiga affiliate eller partnerkandidat.

## Mål

Få in en ny person i rätt läge utan att blanda ihop:

- attribution
- kundstatus
- partnerstatus
- backoffice-access

## Grundregel

- En referral-länk betyder att personen kan spåras.
- En referral-länk betyder inte att personen är partner.
- Full partneraccess i OmegaBalance ges först när personen är verifierad som partner hos Zinzino.

## Statusmodell

### `customer`

- vanlig kund
- ingen särskild roll i backoffice

### `referrer`

- personen har en referral-kod eller referral-länk
- klick, leads och kunder kan attribueras till personen
- personen är fortfarande inte partner per automatik

### `partner_candidate`

- personen vill gå vidare
- eller har börjat generera inflöde
- men är ännu inte verifierad hos Zinzino

### `partner_verified`

- personen är verifierad hos Zinzino
- personen är klar för konto i OmegaBalance

### `partner_active`

- konto är skapat i OmegaBalance
- personen har backoffice-access

## Körordning

1. Bekräfta vilket läge personen är i
- kund
- referrer
- partnerkandidat
- verifierad partner

2. Skapa inte partnerkonto för tidigt
- om personen bara är `customer`, `referrer` eller `partner_candidate` ska inget partnerkonto skapas ännu

3. Verifiera Zinzino-status
- innan `Create partner account` används måste admin veta att personen faktiskt är partner hos Zinzino

4. Skapa konto i auth
- först när personen är `partner_verified`
- e-postadress används som login

5. Skapa eller bekräfta rad i `public.users`
- måste peka på rätt `auth_user_id`
- sätt minst:
  - `name`
  - `email`
  - `role = 'partner'`
  - `referral_code`

6. Skapa eller bekräfta rad i `public.partners`
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

7. Dela loginuppgifter
- admin delar loginuppgifter manuellt tills automatiskt mailflöde är stabilt

8. Kör smoke test
- öppna `/{lang}?ref=KOD`
- klicka varje aktiv CTA i UI
- verifiera redirect
- verifiera dataskrivning i:
  - `public.referral_visits`
  - `public.outbound_clicks`

9. Aktivera partnern
- när konto finns, login fungerar och routing är verifierad räknas personen som `partner_active`

## Adminregel

Admin får bara använda `Create partner account` när svaret är ja på:

- Är personen verifierad hos Zinzino?

Om svaret är nej:

- skapa inte konto

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
- Zinzino-verifiering saknas men konto ändå håller på att skapas
