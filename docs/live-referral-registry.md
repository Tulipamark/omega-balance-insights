# Live Referral Registry

Den här filen är den operativa sanningen för referral-koder i drift.

## Statusnivåer

- `live`: får användas i verklig trafik och support
- `blocked`: får inte användas ännu
- `demo`: endast för tester, mockar eller exempel

## Aktuella referral-koder

| Code | Status | Owner | Market | Purpose | Notes | Last verified |
|---|---|---|---|---|---|---|
| `PER8421` | `live` | Per admin | `SE` | Aktiv live-routing | Verifierad end-to-end mot riktig Zinzino-testlänk och databaskrivning | 2026-03-22 |
| `JORGEN` | `blocked` | Jörgen | `SE` | Nästa affiliate | Saknar konto / rad i `public.users`; ingen routing innan konto finns | - |
| `OMEGAHQ` | `demo` | Intern demo | - | Mock/demo | Får inte användas i live-support eller verklig routing | - |
| `ELIN2026` | `demo` | Intern demo | - | Mock/demo | Tidigare använd i tester; risk för förväxling | - |
| `MIKAEL88` | `demo` | Intern demo | - | Mock/demo | Tidigare använd i tester; risk för förväxling | - |
| `SAGA444` | `demo` | Intern demo | - | Mock/demo | Tidigare använd i tester; risk för förväxling | - |

## Operativa regler

- Endast `live`-koder får användas i verklig trafik, support och onboarding.
- `blocked` betyder att affiliate-spåret finns i planeringen men ännu inte får routas.
- `demo`-koder ska inte blandas in i live-verifiering, supportärenden eller nya affiliates.
- Nya koder ska vara `UPPERCASE` och följa databasens formatkrav.
- Nya koder får inte krocka med reserverade app-routes eller gamla demoidentifierare.

## Innan en kod går till `live`

1. Konto finns i auth.
2. Rad finns i `public.users`.
3. Rad finns i `public.partners`.
4. Rätt destinationslänkar är ifyllda.
5. Minst ett live smoke test är godkänt.
6. Koden läggs in här med datum och ansvarig ägare.
