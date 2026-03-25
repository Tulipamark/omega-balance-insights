# GDPR Gap List

## Syfte

Det här dokumentet är en praktisk gap-lista för OmegaBalance-portalen.

Det är inte ett juridiskt utlåtande.

Det är ett arbetsunderlag för att gå från:

- tekniskt rimlig grund

till:

- tydligare juridisk och operativ trygghet

## Vad som redan finns

- obligatoriskt acceptsteg före partnerdashboard
- separata portalsidor för villkor och integritetspolicy
- versionsnummer för villkor, integritet och portalnotis
- tidsstämplar för accept
- lagring av user agent
- uttrycklig bekräftelse på att portalen är ett internt teamlager och inte officiell Zinzino-plattform

## Det som fortfarande saknas eller behöver skärpas

### 1. Rättslig grund per behandling

Vi behöver definiera rättslig grund för varje huvudflöde, inte bara lägga in checkboxar.

Exempel:

- lead capture
- partneronboarding
- portalinloggning
- attribution och tracking
- adminuppföljning

Fråga som måste besvaras:

- bygger detta på samtycke, avtal, berättigat intresse eller rättslig förpliktelse?

Viktigt:

- samma rättsliga grund ska inte användas slentrianmässigt för allt

### 2. Transparens i policytexterna

Nuvarande texter är en bra grund, men behöver sannolikt bli mer exakta för portalen.

Det som bör framgå tydligare:

- vilka kategorier av personuppgifter som behandlas
- varför de behandlas
- vilken rättslig grund som används
- vilka mottagare eller kategorier av mottagare som kan få tillgång
- hur länge uppgifterna sparas
- vilka rättigheter användaren har
- hur användaren kontaktar er i dataskyddsfrågor

### 3. Återkallelse och ändrade versioner

Om ni bygger på samtycke i någon del måste det vara lätt att återkalla.

Dessutom behöver vi en tydlig modell för:

- vad som händer när villkor/policy uppdateras
- när användaren måste godkänna igen
- hur äldre godkännanden visas eller sparas

### 4. Dataminimering

Vi behöver gå igenom om vi lagrar mer än vad som faktiskt behövs.

Särskilt värt att granska:

- lead details
- adminanteckningar
- user agent
- trackingdata
- partnerrelaterad attribution

Målet:

- bara spara sådant som verkligen behövs för portalens syfte

### 5. Lagringstid och radering

Vi behöver en faktisk policy för:

- hur länge leads sparas
- hur länge inaktiva partneruppgifter sparas
- hur länge loggar/tracking sparas
- när uppgifter anonymiseras eller raderas

### 6. Roller och ansvar

Vi behöver beskriva rollerna tydligare:

- ni är personuppgiftsansvariga för OmegaBalance-portalen
- Zinzino ansvarar för sin egen plattform och sina egna villkor/policys

Detta bör framgå tydligare i både villkor och integritetspolicy.

### 7. Flerspråkighet

Om portalen används på flera språk måste villkor och integritetspolicy finnas på språk användaren faktiskt förstår.

Det betyder:

- svenska först är okej internt
- men skarp användning i andra språkversioner kräver riktiga språkversioner
- inte bara halvfärdiga eller sena översättningar

### 8. Bevisbarhet

Vi sparar nu:

- tid
- version
- user agent

Det är bra.

Men om ni vill stärka spårbarheten senare kan ni överväga:

- IP eller hashad IP
- audit-logg för när accept ändrades

Det är dock inte nödvändigt för första versionen.

### 9. Rättigheter och processer

Det räcker inte att skriva att användaren har rättigheter.

Vi behöver också veta operativt:

- hur någon begär registerutdrag
- hur rättelse görs
- hur radering hanteras
- vem som ansvarar internt

### 10. Juridisk slutgranskning

Innan skarp drift i flera marknader bör slutversionen granskas av någon med faktisk GDPR-kompetens.

Detta gäller särskilt om ni:

- växer internationellt
- hanterar fler kategorier av trackingdata
- börjar använda fler språk
- kombinerar portaldata med affärs- eller marknadsföringslogik

## Rekommenderad ordning

### Nu

- definiera rättslig grund per huvudflöde
- skärp portalvillkor och integritetspolicy med mer exakt portaltext
- bestäm vad som faktiskt kräver om-accept vid ny version

### Snart

- definiera lagringstid
- definiera rättighetsprocesser
- definiera intern ansvarig kontakt

### Sedan

- språkversioner
- eventuell IP eller starkare audit-logg
- juridisk slutgranskning inför bredare skarp drift

## Min bedömning just nu

Teknisk grund:

- bra

Juridisk mognad:

- på väg, men inte färdig

MVP för intern användning:

- nära

Skarp, trygg användning i flera länder:

- kräver fortsatt arbete
