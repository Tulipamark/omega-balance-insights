# First Result Engine Spec

## Syfte

Detta dokument översätter `first-result-engine.md` till byggbar produktlogik.

Målet är att beskriva minsta fungerande version av ett system som hjälper en ny
teammedlem att nå sitt första resultat snabbare.

## MVP-mål

Minsta fungerande version ska:

- visa ett tydligt första mål
- visa nästa steg direkt i partnerläget
- hjälpa användaren att följa upp leads
- visa enkel progression mot första resultat

MVP ska inte:

- automatisera hela onboardingresan
- kräva avancerad AI-logik
- kräva fullständig lead scoring
- kräva komplicerad routing

## Kärnflöde

### Steg 1 - Ny teammedlem öppnar partnerläget

Systemet ska visa:

- var personen är nu
- vad som räknas som första resultat
- ett enda tydligt nästa steg

### Steg 2 - Första aktivitet registreras

Systemet ska kunna markera att personen:

- har kontaktat någon
- har fått respons
- har följt upp
- har nått första resultat

### Steg 3 - Uppföljning prioriteras

Systemet ska peka ut:

- vilka leads som är nya
- vilka som är svarade
- vilka som behöver uppföljning

### Steg 4 - Första resultat uppnås

När ett första resultat finns ska systemet:

- markera det tydligt
- visa ny fas
- uppdatera nästa steg

## Triggerlogik

### Trigger 1 - Ingen första aktivitet inom 24 timmar

Om användaren inte har någon registrerad aktivitet:

- visa tydligare `nästa steg`
- visa enkel påminnelse i partnerläget

### Trigger 2 - Nytt lead finns

Om nytt lead kommer in:

- visa leadet högt upp
- markera att kontakt ska ske först

### Trigger 3 - Lead har svarat

Om lead svarar eller markeras som varmt:

- flytta det högre i listan
- föreslå uppföljning som nästa steg

### Trigger 4 - Första resultat uppnått

Om första resultat registreras:

- visa tydlig bekräftelse
- byt fokus från första resultat till nästa milstolpe

## UI-komponenter

### 1. Next Step Card

Visar:

- nuvarande fas
- nästa steg
- varför det spelar roll

### 2. First Result Progress

Visar enkel progression:

- ingen aktivitet
- första aktivitet
- uppföljning igång
- första resultat

### 3. Lead Status List

Varje lead ska kunna visas med enkel status:

- ny
- kontaktad
- svarat
- uppföljning
- resultat

### 4. Första 7 dagar-ruta

Visar:

- vad som är viktigast just nu
- vad som redan är gjort
- vad som återstår

## Datamodell för MVP

MVP kan börja enkelt och stödja följande fält/logik:

### Teammedlem

- `created_at`
- `first_result_at` (nullable)

### Lead

- `created_at`
- `type`
- `status`
- `updated_at`

### Härledd logik

Systemet kan härleda:

- dagar sedan start
- antal leads
- antal leads med svar eller aktivitet
- om första resultat finns

## Första 60 sekunderna i partnerläget

När en ny teammedlem öppnar sidan ska den se:

1. En tydlig rubrik för var personen är just nu
2. Ett kort som säger vad första resultat betyder
3. En tydlig `nästa steg`-ruta
4. En enkel checklista för första veckan
5. De mest relevanta leadsen först

Det ska inte krävas att användaren:

- tolkar många KPI:er
- läser långa texter
- väljer mellan tio olika vägar

## KPI för MVP

Mät:

- tid till första resultat
- andel teammedlemmar som når första resultat
- antal första aktiviteter inom 24 timmar

## Beslutsregel

Om användaren inte når sitt första resultat tillräckligt snabbt ska vi inte
först anta att användaren är problemet.

Vi ska först fråga:

- var blev flödet otydligt?
- var blev det för mycket friktion?
- vad gjorde de som faktiskt lyckades?

## Nästa byggsteg efter MVP

När MVP fungerar kan vi lägga till:

- varmare lead-prioritering
- bättre påminnelselogik
- mer finmaskig progression
- bättre koppling mellan Growth Compass och First Result Engine
