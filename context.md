Mock API Generator — Implementation Plan
Context

Portfolio project: générer une API fake à partir d’un JSON Schema :

Génération d’endpoints REST (GET/POST/PATCH/DELETE)

Collections + pagination

Filtres (query params), tri, recherche

Données réalistes (faker)
Bonus :

Export Postman / Insomnia

Seed reproductible (mêmes données, mêmes réponses)

Stack (cohérent avec tes apps) :

Next.js App Router + React + TypeScript

Tailwind + shadcn/ui

next-intl (EN/FR) + next-themes

State: Zustand

JSON Schema validation: Ajv

Data generation: @faker-js/faker + json-schema-faker (JSF)

Mocking runtime (offline-first) :

Option A (recommandée “wow”): MSW (Mock Service Worker) → intercepte fetch dans le navigateur

Option B: “API server export” (Node/Express) généré en zip (bonus futur)

Project Structure

mock-api-generator/
├── src/
│ ├── app/
│ │ ├── [locale]/
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx # Workspace (schema -> routes)
│ │ │ ├── playground/page.tsx # Try it: client fetch console
│ │ │ └── exports/page.tsx # Export Postman/Insomnia/OpenAPI
│ │ ├── layout.tsx
│ │ └── globals.css
│ ├── components/
│ │ ├── ui/ # shadcn
│ │ ├── layout/ # Header, AppShell
│ │ ├── schema/ # SchemaEditor, SchemaValidator, SchemaExamples
│ │ ├── resources/ # ResourceList, ResourceEditor, FieldMapping
│ │ ├── api/ # EndpointTable, EndpointTester, ResponsePreview
│ │ ├── runtime/ # MswToggle, SeedControl, ResetDbButton
│ │ ├── exports/ # ExportDialog, PostmanExport, InsomniaExport
│ │ └── shared/ # Toasts, ThemeToggle, LanguageToggle
│ ├── stores/
│ │ ├── project-store.ts # schema, resources, endpoints, settings
│ │ ├── runtime-store.ts # enabled, seed, db snapshot, logs
│ │ └── ui-store.ts # selected endpoint, split panes
│ ├── lib/
│ │ ├── schema/
│ │ │ ├── parse.ts # parse schema -> resources model
│ │ │ ├── validate.ts # Ajv validation for schema & payloads
│ │ │ └── infer.ts # infer ids, required, defaults
│ │ ├── gen/
│ │ │ ├── faker-seed.ts # seedable faker/random
│ │ │ ├── jsf.ts # json-schema-faker config + format mapping
│ │ │ ├── db.ts # in-memory DB + indexing
│ │ │ ├── router.ts # endpoints definitions from resources
│ │ │ └── handlers.ts # MSW handlers (GET/POST/PATCH/DELETE)
│ │ ├── query/
│ │ │ ├── filter.ts # operators parsing (eq, lt, contains…)
│ │ │ ├── sort.ts # sort parsing
│ │ │ └── paginate.ts # page/pageSize/limit/offset
│ │ ├── export/
│ │ │ ├── openapi.ts # OpenAPI spec generation (recommended)
│ │ │ ├── postman.ts # Postman collection json
│ │ │ └── insomnia.ts # Insomnia export json
│ │ └── utils/
│ │ ├── storage.ts # localStorage/IndexedDB project save
│ │ ├── download.ts # file save helpers
│ │ └── debounce.ts
│ ├── hooks/
│ │ ├── useMswRuntime.ts # register/unregister MSW
│ │ ├── useEndpointTester.ts # run fetch + display response
│ │ └── usePersistedProject.ts
│ └── types/
│ ├── project.ts # Project, Resource, Endpoint, Settings
│ ├── db.ts # Record, Collection
│ └── export.ts # OpenAPI/Postman/Insomnia types
├── messages/
│ ├── en.json
│ └── fr.json
└── middleware.ts

Key Architecture Decisions
1) “Schema → Resources” : modèle clair

Tu ne veux pas servir “n’importe quel JSON Schema” de façon magique. Le plus robuste est :

l’utilisateur colle un schema racine qui décrit des resources (ou tu déduis resources via definitions/$defs)

chaque resource devient une collection REST.

Convention simple (portfolio-friendly)

$defs / definitions contient des objets “Resource”

Le nom du def = nom de la resource (User, Post…)

Chaque resource a un id (string/uuid ou integer) — auto-inféré si absent.

2) Runtime offline via MSW (effet “wow”)

Tu actives MSW → toutes les requêtes fetch('/api/...') ou https://mock.local/... sont interceptées

Les réponses viennent de ton DB in-memory, généré depuis schema

Zero backend, tout en local.

3) Seed reproductible partout

Un seul générateur pseudo-aléatoire seedé

faker.seed(seed) + un RNG unique (ou seedrandom) pour tout ce qui n’est pas faker

Résultat : mêmes datasets + mêmes orderings si seed identique.

4) Pagination / filtres : contrat stable

Support minimal mais utile :

Pagination :

page + pageSize (ou limit + offset)

renvoyer meta: {page, pageSize, total, totalPages}

Filtres (query) :

field=value (eq)

field_like=abc (contains)

field_gt=10, field_gte=, field_lt=, field_lte=

q=... (full-text naive sur quelques champs string)

Tri :

sort=field ou sort=-field

5) Exports : OpenAPI d’abord, Postman/Insomnia ensuite

Le plus propre : générer OpenAPI → puis dériver Postman/Insomnia.
Même si tu fournis directement Postman/Insomnia, garde OpenAPI en interne : ça simplifie l’écosystème.

Implementation Phases
Phase 1 — Foundation

Scaffold Next.js + Tailwind + shadcn/ui + TS

Install deps: zustand, next-intl, next-themes, ajv, json-schema-faker, @faker-js/faker, uuid, zod, msw

Setup i18n + theme

Workspace layout (3 panneaux) :

gauche : Schema Editor + validation

centre : Resources + endpoints table

droite : Response preview / tester

Project persistence (localStorage) : schema + settings + seed

DoD

Coller un schema → validation Ajv OK/KO + affichage erreurs.

Phase 2 — Schema → Resources + DB Generation

parse.ts: extraire resources depuis $defs/definitions

infer.ts:

détecter champs id ou générer id (uuid/int)

defaults (ex: createdAt)

jsf.ts:

mapping formats (email, uuid, date-time, url…)

config JSF + faker

db.ts:

créer collections (ex: 50 items par resource, configurable)

index simple sur id (Map)

UI: ResourceList + count + regenerate

DoD

Un schema User → DB in-memory de 50 users générés.

Phase 3 — Endpoints REST + Pagination/Filters/Sort

router.ts: endpoints standards par resource :

GET /users (list)

GET /users/:id

POST /users (create)

PATCH /users/:id (partial update)

DELETE /users/:id

query/*:

paginate

filters operators

sort

validate.ts: valider payload POST/PATCH via Ajv (schema resource)

ResponsePreview + “try request” panel (method, path, query, body)

DoD

GET /users?page=2&pageSize=10&sort=-createdAt&email_like=gmail
renvoie items + meta corrects.

Phase 4 — Runtime MSW (offline-first)

handlers.ts: générer handlers MSW à partir des endpoints

useMswRuntime:

register service worker

toggle on/off

“Playground” page :

mini client qui fait des fetch vers les endpoints

console log + prettify JSON

Logs runtime :

liste des dernières requêtes interceptées (method, path, status, ms)

DoD

Toggle MSW ON → fetch('/api/users') renvoie ton fake API, sans backend.

Phase 5 — Bonus Seed reproductible

faker-seed.ts:

seed control unique

fonctions randInt, randPick, etc. basées sur RNG seedé

UI SeedControl:

champ seed + “randomize seed” + “regenerate DB”

Verrouiller le tri stable :

list endpoints renvoient ordre stable (id/createdAt) si seed identique

DoD

Même seed + même schema → mêmes 10 premiers items sur GET /users.

Phase 6 — Bonus Export OpenAPI + Postman/Insomnia

openapi.ts:

paths + schemas + parameters (pagination/filter/sort)

examples (1 item)

postman.ts:

collection (items = endpoints)

variables : baseUrl

exemples de query params

insomnia.ts:

workspace export (requests + env baseUrl)

ExportDialog:

Download OpenAPI JSON/YAML (option)

Download Postman Collection JSON

Download Insomnia JSON

DoD

Import Postman/Insomnia → endpoints présents, baseUrl configurable.

Phase 7 — Polish

Presets projets :

“E-commerce” (User/Product/Order)

“Blog” (User/Post/Comment)

Constraints UX :

avertir si schema trop complexe / non supporté

fallback “resource manual mapping”

Performance :

DB regenerate en worker si gros volume

cache Ajv compile (par hash schema)

Verification Checklist

App démarre, EN/FR + dark mode OK

Coller schema → erreurs Ajv visibles / schema valid -> resources listées

Générer DB → counts visibles

Endpoints list/detail/create/update/delete fonctionnent

Pagination/meta OK, filtres/sort OK

Toggle MSW ON → fetch depuis playground marche offline

Seed :

seed fixe → résultats identiques

seed change → résultats changent

Export OpenAPI/Postman/Insomnia :

import OK

variables baseUrl OK

Risques techniques (et parades)
1) JSON Schema “trop libre”

Supporter un sous-ensemble clair (object/array/primitive, required, enum, format, oneOf simple)

Afficher “Not supported” avec suggestions

Proposer un mode “Resource mapping” (manuel) si parse automatique échoue

2) Filtres complexes = scope creep

Commencer simple (eq/contains/gt/lt + q)

Ajouter operators progressivement

3) MSW en prod / déploiement

Bien isoler le runtime (toggle + warning “mocking enabled”)

Ne pas intercepter des domaines externes par défaut

4) Seed “pas vraiment stable”

Centraliser RNG

Éviter Math.random() partout

Tri stable (sinon même data mais ordre différent)

“Portfolio narrative” (pitch)

Mock API Generator transforme un JSON Schema en une API REST fake complète (endpoints, pagination, filtres, validation) exécutée localement via MSW. Bonus : seed reproductible et export OpenAPI/Postman/Insomnia pour brancher instantanément un front sans backend.