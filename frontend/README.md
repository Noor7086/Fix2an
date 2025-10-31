# FIX2AN Frontend (Next.js)

This is the original project, moved under `frontend/` in the monorepo.

---

# Fixa2an - Verkstadsplattform

En komplett webbplattform för att koppla samman kunder med verifierade verkstäder för bilreparationer. Kunder laddar upp sina inspektionsrapporter och får erbjudanden från verkstäder i sitt område.

## 🚀 Funktioner

### För kunder

- **Enkel uppladdning**: Ladda upp inspektionsrapport (JPG, PNG, PDF)
- **Automatiska erbjudanden**: Få erbjudanden från verifierade verkstäder inom 30km
- **Transparenta priser**: Jämför priser, tider och recensioner
- **Säker betalning**: Betala via Klarna Checkout
- **Spårning**: Följ dina ärenden från förfrågan till slutförande

### För verkstäder

- **Verifierad status**: "Fixa2an Verified" badge för förtroende
- **Automatiska notifieringar**: Få förfrågningar direkt i din dashboard
- **Enkel hantering**: Skicka erbjudanden och hantera bokningar
- **Statistik**: Se din prestanda och omsättning

### För administratörer

- **Verkstadsgodkännande**: Granska och godkänn nya verkstäder
- **Systemövervakning**: Se statistik och hantera användare
- **Rapporter**: Generera månadsrapporter för provisioner

## 🛠️ Teknisk stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Databas**: PostgreSQL
- **Autentisering**: NextAuth.js
- **Filuppladdning**: AWS S3
- **E-post**: Nodemailer med anpassade mallar
- **Betalningar**: Klarna Checkout
- **UI-komponenter**: Radix UI + shadcn/ui
- **AI/Analytics**: Tesseract.js, ML-Matrix, ML-Regression, PDF-Parse

## 📋 Förutsättningar

- Node.js 18+
- PostgreSQL 14+
- AWS S3 bucket
- E-postserver (Gmail/SendGrid/Postmark)
- Klarna-konto (för betalningar)

## 🚀 Installation

1. **Klona repot**

   ```bash
   git clone <repository-url>
   cd fixa2an/frontend
   ```

2. **Installera dependencies**

   ```bash
   npm install
   ```

3. **Konfigurera miljövariabler**

   ```bash
   cp ../env.example .env.local
   ```

   Fyll i variablerna i `.env.local`.

4. **Sätt upp databasen**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Starta utvecklingsservern**

   ```bash
   npm run dev
   ```

6. **Öppna i webbläsaren**
   `http://localhost:3000`

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Autentiseringssidor
│   ├── admin/             # Admin panel
│   ├── workshop/          # Verkstadsfunktioner
│   ├── upload/            # Filuppladdning
│   └── my-cases/          # Kundens ärenden
├── components/            # React-komponenter
│   └── ui/               # UI-komponenter (shadcn/ui)
├── lib/                  # Hjälpfunktioner
│   ├── auth.ts           # NextAuth konfiguration
│   ├── db.ts             # Prisma klient
│   ├── email.ts          # E-postmallar
│   ├── klarna.ts         # Klarna integration
│   ├── upload.ts         # Filuppladdning
│   └── utils.ts          # Hjälpfunktioner
└── prisma/
    └── schema.prisma     # Databasschema
```

## 🔧 Utveckling

### Databas

```bash
# Generera Prisma klient
npm run db:generate

# Pusha schema ändringar
npm run db:push

# Öppna Prisma Studio
npm run db:studio
```

### Linting

```bash
npm run lint
```

### Bygga för produktion

```bash
npm run build
npm start
```

## Säkerhet, design, AI och övrigt

Se detaljerna i denna fil (innehållet är oförändrat från originalet).
