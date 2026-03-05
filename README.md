<div align="center">

# Mock API Generator

**Design JSON schemas, generate fake data, and spin up a mock REST API — all in the browser.**

*Concevez des schemas JSON, generez des donnees factices et lancez une API REST mock — tout dans le navigateur.*

[English](#english) | [Francais](#francais)

</div>

---

## English

### What is Mock API Generator?

Mock API Generator lets you define resources with JSON Schema, auto-generate realistic fake data using Faker.js, and instantly serve them through an in-browser REST API powered by MSW (Mock Service Worker). Test endpoints, filter, sort, paginate, and export to OpenAPI, Postman, or Insomnia.

### Features

- **Schema Editor** — Define your API resources with JSON Schema
- **Fake Data Generation** — Auto-generate realistic data with Faker.js and json-schema-faker
- **In-Browser Mock API** — MSW intercepts fetch requests and serves your mock data
- **Full REST Support** — GET, POST, PUT, DELETE with filtering, sorting, and pagination
- **Endpoint Tester** — Built-in HTTP client to test your mock endpoints
- **Request Logs** — See all intercepted requests in real time
- **Seed Control** — Reproducible data generation with configurable seeds
- **Export Formats** — Export to OpenAPI 3.0, Postman Collection, or Insomnia
- **Schema Examples** — Pre-built schemas to get started quickly
- **Resizable Panels** — Customizable workspace layout
- **Dark / Light Mode** — Theme toggle
- **Bilingual UI** — Full English & French interface

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI |
| State | Zustand |
| Mock Server | MSW (Mock Service Worker) |
| Fake Data | @faker-js/faker + json-schema-faker |
| Validation | AJV + ajv-formats |
| Layout | react-resizable-panels |
| i18n | next-intl |

### Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Francais

### Qu'est-ce que Mock API Generator ?

Mock API Generator vous permet de definir des ressources avec JSON Schema, de generer automatiquement des donnees realistes avec Faker.js, et de les servir instantanement via une API REST dans le navigateur grace a MSW (Mock Service Worker). Testez les endpoints, filtrez, triez, paginez, et exportez en OpenAPI, Postman ou Insomnia.

### Fonctionnalites

- **Editeur de Schema** — Definissez vos ressources API avec JSON Schema
- **Generation de Donnees Factices** — Generation automatique avec Faker.js et json-schema-faker
- **API Mock dans le Navigateur** — MSW intercepte les requetes fetch et sert vos donnees
- **Support REST Complet** — GET, POST, PUT, DELETE avec filtrage, tri et pagination
- **Testeur d'Endpoints** — Client HTTP integre pour tester vos endpoints mock
- **Logs de Requetes** — Visualisez toutes les requetes interceptees en temps reel
- **Controle de Seed** — Generation reproductible avec seeds configurables
- **Formats d'Export** — Export en OpenAPI 3.0, Collection Postman ou Insomnia
- **Schemas Exemples** — Schemas pre-construits pour demarrer rapidement
- **Panneaux Redimensionnables** — Layout d'espace de travail personnalisable
- **Mode Sombre / Clair** — Bascule de theme
- **Interface Bilingue** — Anglais et francais complets

### Demarrage Rapide

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

<div align="center">

**Built with Next.js, TypeScript & Tailwind CSS**

</div>
