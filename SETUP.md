# QueerPulse local setup

Start here. This guide takes you from an empty folder to the whole QueerPulse
stack running on your machine, signed in as a platform admin, in about four
commands. Plan on 10 to 15 minutes, most of it `pnpm install` and Docker
pulling images.

QueerPulse lives in two sibling repos:

| Repo                                                                     | What it is  | Stack                                                |
| ------------------------------------------------------------------------ | ----------- | ---------------------------------------------------- |
| [`queerpulse`](https://github.com/MrValraven/queer-pulse) (this one)     | the web app | Vite, React 19, TypeScript, react-query, CSS Modules |
| [`queerpulse-backend`](https://github.com/MrValraven/queerpulse-backend) | the API     | NestJS 11, TypeORM, Postgres 16, socket.io           |

For the API on its own (every setup step, the generated `.env`, MinIO, the e2e
database), see the backend's
[SETUP.md](https://github.com/MrValraven/queerpulse-backend/blob/main/SETUP.md).

- [How the pieces fit](#how-the-pieces-fit)
- [1. Prerequisites](#1-prerequisites)
- [2. Clone both repos side by side](#2-clone-both-repos-side-by-side)
- [3. Backend](#3-backend)
- [4. Frontend](#4-frontend)
- [5. Sign in](#5-sign-in)
- [UI work without a backend (demo mode)](#ui-work-without-a-backend-demo-mode)
- [Already set up?](#already-set-up)
- [Daily workflow](#daily-workflow)
- [Checks before you hand work over](#checks-before-you-hand-work-over)
- [Read before your first PR](#read-before-your-first-pr)
- [Troubleshooting](#troubleshooting)

## How the pieces fit

```
  Browser
    │  http://localhost:5173
    ▼
  Vite dev server ............ queerpulse            :5173
    │
    │  fetch + socket.io, httpOnly cookie session, CSRF header
    ▼
  NestJS API ................. queerpulse-backend    :3000
    │                    │
    ▼                    ▼
  Postgres 16 :5432    MinIO :9000 (S3 API)  console :9001
                         ▲
                         │  the browser PUTs uploads straight here
                         │  through presigned URLs the API hands out
```

- `docker compose up` in the backend runs Postgres, MinIO and the API together
  from its `docker-compose.yml`. On the native path, the backend setup script
  starts Postgres and MinIO in Docker and the API runs on your machine.
- MinIO is a local stand-in for the Railway Bucket that production uses. It
  speaks the same S3 API, so avatars, photos and audio upload locally exactly
  as they do in production. It exists for local development only.
- The API reads its CORS allowlist from `FRONTEND_URL` in the backend `.env`
  (`http://localhost:5173` by default). A frontend served from any other
  origin gets its requests blocked.

| Port | Service                                   | Override                                                        |
| ---- | ----------------------------------------- | --------------------------------------------------------------- |
| 5173 | Vite dev server                           | a second `pnpm dev` takes the next free port, which CORS blocks |
| 3000 | NestJS API (`PORT` in the backend `.env`) | `QP_API_PORT` on the Docker path                                |
| 5432 | Postgres                                  | `QP_POSTGRES_PORT`                                              |
| 9000 | MinIO S3 API                              | `QP_MINIO_PORT`                                                 |
| 9001 | MinIO console                             | `QP_MINIO_CONSOLE_PORT`                                         |

## 1. Prerequisites

| Tool                              | Version                                                           | How to get it                                                                                                         |
| --------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Node                              | 24 (`.nvmrc` = `24`; `engines` needs `24.x`)                      | `nvm install && nvm use`, or `fnm use --install-if-missing`                                                           |
| pnpm                              | 9.15.0, pinned by `packageManager` in both `package.json` files   | `corepack enable` (corepack ships with Node)                                                                          |
| Docker Desktop or OrbStack        | Docker Compose 2.24 or newer (`docker compose version`)           | recommended: `docker compose up` runs the whole backend for you; [OrbStack](https://orbstack.dev) is lighter on macOS |
| Postgres 16 (only without Docker) | 14 or newer works, 16 recommended                                 | [Postgres.app](https://postgresapp.com) or `brew install postgresql@16`                                               |

Node and pnpm are still needed for the frontend, and for the backend's
`pnpm dev:*` scripts. Without Docker the stack still runs, with uploads
switched off: the API boots and every upload request fails with
`Object storage is not configured`.

Editor: both repos ship `.vscode/extensions.json` (ESLint and Prettier; the
frontend adds the Vitest and Playwright extensions). Accept the recommendations
when VS Code offers them. Prettier runs through ESLint in the frontend, so a
formatting slip is a lint error.

## 2. Clone both repos side by side

The setup scripts look for each other at `../queerpulse` and
`../queerpulse-backend`, so clone into those exact folder names next to each
other. The frontend repo is called `queer-pulse` on GitHub; the second argument
renames the folder.

```bash
mkdir -p ~/code/queerpulse-stack && cd ~/code/queerpulse-stack
git clone https://github.com/MrValraven/queer-pulse.git queerpulse
git clone https://github.com/MrValraven/queerpulse-backend.git queerpulse-backend
```

## 3. Backend

Start Docker Desktop or OrbStack first, then:

```bash
cd ~/code/queerpulse-stack/queerpulse-backend
docker compose up
```

That one command starts Postgres 16, MinIO and the API with hot reload. On
start, the API container installs dependencies, writes `.env` (with fresh local
secrets and `EMAIL_CODE_DEV_LOG=true`) and `.env.test` when they are missing,
creates the `queerpulse` and `queerpulse_test` databases, runs migrations on
both, seeds 32 local accounts (31 fixture members plus the dev admin
`admin@example.com`) when the database has none, creates the `queerpulse-dev`
bucket, then runs `pnpm start:dev`. Every step is safe to repeat. The first run
builds the image, so give it a few minutes.

Keep that terminal visible: your sign-in codes print there. Started with
`docker compose up -d`? Follow the log with `docker compose logs -f api`.

**Without Docker, or to run the API as a host process** (a debugger, say), use
the native path:

```bash
cd ~/code/queerpulse-stack/queerpulse-backend
nvm use               # or: fnm use
corepack enable
pnpm dev:setup
pnpm start:dev
```

`pnpm dev:setup` runs nine steps: checks Node and pnpm, runs `pnpm install`,
starts Postgres and MinIO with `docker compose` when Docker runs, writes `.env`
and `.env.test` when they are missing, creates both databases, migrates them,
seeds, creates the bucket, then runs the doctor. It is safe to re-run. On an
existing `.env` it reviews what is missing or invalid and asks about each item
(Enter accepts, `s` skips, `a` accepts all, or type your own value), backing the
file up to `.env.backup-YYYYMMDD-HHMMSS` before the first change. To see what it
would do first: `pnpm dev:setup --dry-run`. Your sign-in codes print in the
`pnpm start:dev` terminal.

Check the API is up:

```bash
curl http://localhost:3000/health/live
```

Swagger UI is at http://localhost:3000/docs outside production.

## 4. Frontend

In a second terminal:

```bash
cd ~/code/queerpulse-stack/queerpulse
nvm use               # or: fnm use
pnpm dev:setup
pnpm dev
```

`pnpm dev:setup` here runs six steps: checks Node and pnpm, runs `pnpm install`,
copies `.env.example` to `.env` when `.env` is missing (that sets
`VITE_API_URL=http://localhost:3000`), installs Playwright Chromium only when you
pass `--browsers`, reports on the `../queerpulse-backend` checkout, then runs
the doctor. Add `--browsers` now if you plan to run e2e tests:

```bash
pnpm dev:setup --browsers
```

## 5. Sign in

1. Open http://localhost:5173/auth/sign-in.
2. Enter `admin@example.com` and press **Email me a code**.
3. In the backend log, find the line below. On the Docker path that is the
   `docker compose up` output, or `docker compose logs -f api` when the stack
   runs in the background; on the native path, the `pnpm start:dev` terminal.

   ```
   [dev] sign-in code for challenge <id>: <code>
   ```

4. Type the 6-digit code and press **Check this code**.

`admin@example.com` is the platform Admin, so the admin screens open. To see
the app as an ordinary member, sign in with any seeded member instead, for
example `ana@example.com`, `tomas@example.com` or `noa@example.com` (all 31 are
in `src/database/seed.ts` in the backend).

No email leaves your machine: `EMAIL_CODE_DEV_LOG=true` in the backend `.env`
turns email codes on, logs each code in the API terminal and sends nothing. The backend
ignores that flag when `NODE_ENV=production`. Google sign-in is optional
locally; it needs real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values in
the backend `.env`.

## UI work without a backend (demo mode)

For pure UI work you can skip the backend entirely:

```bash
VITE_DEMO=1 pnpm dev
```

Every data hook then returns its colocated `*.data.ts` fixture and the app makes
no network calls.

Demo mode has exactly one switch: `VITE_DEMO=1` (see
[`src/shared/api/config.ts`](src/shared/api/config.ts) and `.env.example`).
The app never infers it from a missing or unreachable `VITE_API_URL`:

| `VITE_API_URL` | `VITE_DEMO` | Result                                                                                                |
| -------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| set            | unset       | live mode against that API (the normal local setup)                                                   |
| unset          | `1`         | standalone prototype, demo locked on                                                                  |
| set            | `1`         | live by default; platform admins get **Populate platform** in the account menu to toggle demo data on |
| unset          | unset       | a production build throws at boot; locally the doctor reports it as a failure                         |

Never set `VITE_DEMO=1` on a real deployment: it serves fabricated content as
real community data.

## Already set up?

### Moving a native backend to Docker

If your backend checkout predates `docker compose up` (a native Postgres such
as Postgres.app, a hand-kept `.env`, `pnpm start:dev` on the host), take these
steps once, in this order, in `queerpulse-backend`:

```bash
cd ~/code/queerpulse-stack/queerpulse-backend
pnpm dev:doctor        # read-only: where you stand, with a fix: line per problem
pnpm dev:setup         # reviews .env and asks about each change, after a backup
pnpm run seed          # adds the fixtures your database still lacks
pnpm dev:import-db     # copies your native database into the Docker postgres, once
docker compose up      # stop your native pnpm start:dev first: both use port 3000
```

Skip `pnpm dev:import-db` to start Docker with a fresh database and the
fixtures. When Postgres.app holds port 5432, the import offers to move the
container to a free port such as 5433 (`QP_POSTGRES_PORT` in `.env`). The
backend's
[SETUP.md](https://github.com/MrValraven/queerpulse-backend/blob/main/SETUP.md#already-using-the-repo)
explains each step.

### Run the doctors

When something feels off, run the read-only doctor in each repo. Each prints one
line per check (`ok`, `info`, `warn`, `fail`) and a `fix:` line under every
problem.

```bash
cd ~/code/queerpulse-stack/queerpulse-backend && pnpm dev:doctor
cd ~/code/queerpulse-stack/queerpulse && pnpm dev:doctor
```

Real output from a frontend doctor with the API stopped:

```
  ok    VITE_API_URL http://localhost:3000 (from .env)
  warn  backend unreachable at http://localhost:3000/health/live (ECONNREFUSED)
        fix: start it with pnpm start:dev in ../queerpulse-backend
  ok    backend FRONTEND_URL allows http://localhost:5173
```

And from a backend doctor on a database seeded before the dev admin existed:

```
  warn  no admin@example.com account (3 users in the database)
        fix: run `pnpm run seed` (idempotent: it skips rows that already exist)
```

Both doctors exit non-zero only when a check fails. Re-running `pnpm dev:setup`
is also safe at any time: it only creates what is missing, and for an existing
`.env` it asks about each missing or invalid value on a terminal, after backing
the file up to `.env.backup-YYYYMMDD-HHMMSS`. Without a terminal it prints the
lines to add; `pnpm dev:setup --update-env --yes` accepts every proposal.

Use the `dev:` names. Bare `pnpm setup` and `pnpm doctor` are pnpm's own
built-in commands (`pnpm setup` edits your shell profile).

## Daily workflow

Backend, after pulling, on the Docker path:

```bash
docker compose restart api                     # reinstalls, migrates both databases, restarts the API
docker compose logs -f api                     # sign-in codes and errors
docker compose exec api pnpm run seed          # when a pull adds new seed data
```

Backend, after pulling, on the native path:

```bash
pnpm install              # when pnpm-lock.yaml changed
pnpm start:dev            # hot reload; applies pending migrations at boot
pnpm dev:doctor           # pending migrations, missing .env keys, services
```

The API applies any pending migrations at boot by default
(`AUTO_RUN_MIGRATIONS`), in Docker as on the host. To apply them yourself:
`pnpm run migration:run` (or `docker compose exec api pnpm run migration:run`).
If a pull adds new seed data, such as the dev admin, run `pnpm run seed`: it is
idempotent and adds only what is missing. `docker compose down -v` deletes
every Docker volume, which wipes your local database and uploaded files.

Frontend, after pulling:

```bash
pnpm install              # when pnpm-lock.yaml changed
pnpm dev
```

## Checks before you hand work over

### Frontend

The frontend repo has no CI, so these local checks are the gate.

```bash
pnpm verify
```

`pnpm verify` runs, in order: `pnpm lint`, `pnpm typecheck`, `pnpm lint:a11y`,
`pnpm check:tokens`, `pnpm check:css-scale`, `pnpm test`.

| Command                                         | What it does                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm typecheck`                                | `tsc -b --noEmit`                                                                                |
| `pnpm test`                                     | Vitest suite once (includes the EN/PT catalog parity test)                                       |
| `pnpm test:e2e`                                 | Playwright; boots its own demo-mode dev server on port 5188, so it leaves your 5173 server alone |
| `VITE_API_URL=http://localhost:3000 pnpm build` | production build: gates, `vite build`, prerender                                                 |

`pnpm build` is `node scripts/build-gates.mjs && vite build && pnpm prerender`.
The gates run in parallel and stop at the first failure: `lint:a11y`, the
design-token check, the CSS-scale check, `tsc -b`, the sitemap, the robots.txt
check and `pnpm prerender:browser` (which downloads Playwright Chromium the
first time). The prerender step is a plain Node script that reads only
`process.env`, so it ignores your `.env` file; export `VITE_API_URL` on the
command line as shown above.

### Backend

CI (`.github/workflows/ci.yml`) runs lint, build, unit tests and e2e tests
against a Postgres service container on every push and PR to `main`. Run the
same locally:

```bash
pnpm run lint             # eslint --fix: it rewrites files
pnpm run build            # migration timestamp and lock-key checks, then nest build
pnpm run test             # unit tests
pnpm run test:e2e         # e2e tests on the queerpulse_test database
```

The e2e suites delete every table between tests. A guard refuses to run them
unless the database name ends in `_test` (or `TEST_DATABASE_URL` is set), and
`pnpm dev:setup` creates `queerpulse_test` and `.env.test` for exactly this.

## Read before your first PR

- [`CLAUDE.md`](CLAUDE.md) in this repo and
  [`CLAUDE.md`](https://github.com/MrValraven/queerpulse-backend/blob/main/CLAUDE.md)
  in the backend: architecture and house rules.
- [`docs/STYLE-RULES.md`](docs/STYLE-RULES.md), the short UI checklist, and
  [`docs/design-system.md`](docs/design-system.md), the full reference. Design
  tokens only, cream page backgrounds, the shared `<Button>`.
- **Dual-mode.** Every live-mode code path keeps its colocated `*.data.ts`
  mock as the demo fallback. A change that only works with a backend running is
  incomplete.
- **Both i18n catalogs.** Every user-facing string goes into
  `src/shared/i18n/catalogs/en/` and `src/shared/i18n/catalogs/pt/`;
  `parity.test.ts` fails when a key exists in only one. See
  [`src/shared/i18n/README.md`](src/shared/i18n/README.md).
- **Copy names.** User-facing text says "event" and "events" (PT "evento");
  `gathering` is the code name and appears only in keys, routes and file names.
- **Small components.** No single component over 200 lines; each component's
  mock data lives in its own colocated `*.data.ts(x)` file.
- **Links.** Use `linkToPath()` or `routes` from
  [`src/app/routeMap.ts`](src/app/routeMap.ts) for every internal link.
- **Migrations (backend).** The schema is owned by migrations; `synchronize` is
  never on. A new migration opens with the banner
  `// DO NOT RUN: authored for review only; the maintainer runs migrations.`,
  which comes off once it has run. Never rename or renumber an applied
  migration: TypeORM matches migrations by class name, so a renamed one looks
  pending and re-runs. For an "already exists" failure, diagnose the ledger with
  `pnpm run typeorm migration:show` and leave `IF NOT EXISTS` guards out.

## Troubleshooting

Run both doctors first; most rows below are a doctor line with its fix.

| Symptom                                                                                                                                   | Cause                                                                                                                | Fix                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fail  cannot reach Postgres: nothing is listening on localhost:5432`                                                                     | Docker Desktop is stopped and no native Postgres runs                                                                | Start Docker Desktop and re-run `pnpm dev:setup`, or open Postgres.app / `brew services start postgresql@16`                                                                                                                                                                                                                                                                 |
| Setup prints `something else already listens on localhost:5432 (Postgres.app?)`                                                           | Postgres.app or a Homebrew Postgres owns port 5432, so setup uses that server                                        | Keep using it (next row), or move the container: add `QP_POSTGRES_PORT=5433` to the backend `.env`, set `DATABASE_URL` there to port `5433`, then `pnpm dev:setup`. On a machine with no `.env` yet, `QP_POSTGRES_PORT=5433 pnpm dev:setup` writes the port into `DATABASE_URL`; add `QP_POSTGRES_PORT=5433` to `.env` afterwards so later runs and `docker compose` keep it |
| `role "queerpulse" does not exist on localhost:5432`                                                                                      | Native Postgres has no `queerpulse` role                                                                             | `psql -h localhost -p 5432 -d postgres -c "CREATE ROLE queerpulse LOGIN PASSWORD 'queerpulse' CREATEDB"`, then `pnpm dev:setup`                                                                                                                                                                                                                                              |
| The sign-in page shows no **Email me a code** option, or `/auth/email-code` answers 503 `email_code_unavailable`                          | `EMAIL_CODE_DEV_LOG` is off in the backend `.env` and Resend is not configured (common with a `.env` copied by hand) | Add `EMAIL_CODE_DEV_LOG=true` to the backend `.env` and restart `pnpm start:dev` (the Docker `api` turns it on by default)                                                                                                                                                                                                                                                   |
| Backend `docker compose up` stops with `bind: address already in use` for port 3000                                                       | A native `pnpm start:dev` already holds port 3000                                                                    | Stop the native API (Ctrl+C in its terminal), then `docker compose up` again                                                                                                                                                                                                                                                                                                 |
| Backend `docker compose up` stops with `bind: address already in use` for port 5432                                                       | Postgres.app or a Homebrew Postgres holds port 5432                                                                  | Add `QP_POSTGRES_PORT=5433` to the backend `.env` and run `docker compose up` again; `pnpm dev:import-db` offers this edit for you                                                                                                                                                                                                                                           |
| Every session signs out after `docker compose restart api`                                                                                | The backend `.env` lacks valid JWT secrets, so the `api` container generates temporary ones on each start            | Run `pnpm dev:setup` in the backend to save them into `.env`, then `docker compose up -d api`                                                                                                                                                                                                                                                                                |
| Requests fail with CORS errors and sign-in never completes; the address bar shows `localhost:5174`                                        | A second `pnpm dev` took the next free port, and `FRONTEND_URL` allows only `http://localhost:5173`                  | Stop the other dev server and use 5173. To keep both, add the origin to `FRONTEND_URL` (comma-separated, no trailing slash) and restart the API                                                                                                                                                                                                                              |
| Uploads fail with `Object storage is not configured`                                                                                      | The `AWS_*` keys are unset or commented out (setup ran without Docker)                                               | Start Docker and run `pnpm dev:setup` in the backend: with MinIO running, its `.env` review proposes the local MinIO block and setup creates the bucket. Restart the API. On the Docker path the `api` container sets these keys itself                                                                                                                                      |
| Doctor: `AWS_* keys still hold the .env.example placeholders: uploads off`                                                                | `.env` was copied from `.env.example` by hand                                                                        | Same fix as the row above                                                                                                                                                                                                                                                                                                                                                    |
| Boot error: `AWS_S3_FORCE_PATH_STYLE=true is for the local MinIO bucket only and is refused when NODE_ENV=production`                     | A local `.env` was copied into a production environment                                                              | Remove `AWS_S3_FORCE_PATH_STYLE` there and use the real bucket's five `AWS_*` values                                                                                                                                                                                                                                                                                         |
| The API or a migration hits a different database than `.env` names; doctor prints `DATABASE_URL comes from your shell and overrides .env` | `DATABASE_URL` is exported in your shell, and dotenv never overwrites a variable that is already set                 | `unset DATABASE_URL`, and remove the export from your shell profile                                                                                                                                                                                                                                                                                                          |
| `pnpm build` stops with `[prerender] Refusing to run: neither VITE_API_URL nor VITE_DEMO=1 is set.`                                       | `scripts/prerender.mjs` is a plain Node script that reads only `process.env`, never `.env`                           | `VITE_API_URL=http://localhost:3000 pnpm build`                                                                                                                                                                                                                                                                                                                              |
| `pnpm test:e2e` or the prerender step cannot find Chromium                                                                                | Playwright Chromium is missing or outdated                                                                           | `pnpm prerender:browser`, or `pnpm dev:setup --browsers`                                                                                                                                                                                                                                                                                                                     |
| `tsc` reports errors in a file that no longer exists                                                                                      | Stale `tsbuildinfo` from an earlier build                                                                            | `npx tsc -b --force` once                                                                                                                                                                                                                                                                                                                                                    |
| `pnpm storage:cors` skips or targets the wrong bucket                                                                                     | The script reads only `process.env`                                                                                  | `node --env-file=.env scripts/set-bucket-cors.mjs`. Local MinIO already accepts every browser origin, so this matters only for the real Railway Bucket                                                                                                                                                                                                                       |
| The API crash-loops at boot against Railway, Render or Fly Postgres                                                                       | TLS with certificate verification is the production default, and these providers fail it                             | Set `DATABASE_SSL=false` on a private network or `DATABASE_SSL_INSECURE=true` through a public proxy; prefer `DATABASE_SSL_CA` when the provider publishes a CA. See [Database TLS & connection pool](https://github.com/MrValraven/queerpulse-backend/blob/main/README.md#database-tls--connection-pool)                                                                    |
| A migration fails with "already exists", or an old migration shows as pending                                                             | The `migrations` ledger and the files disagree (often a renamed migration)                                           | `pnpm run typeorm migration:show` to see the mismatch; never rename the file back and forth                                                                                                                                                                                                                                                                                  |
| Doctor: `no admin@example.com account`                                                                                                    | The database was seeded before the dev admin was added                                                               | `pnpm run seed` (idempotent)                                                                                                                                                                                                                                                                                                                                                 |
| Backend `pnpm test:e2e` refuses to start                                                                                                  | `.env.test` is missing or its database name lacks the `_test` suffix                                                 | `pnpm dev:setup` creates `.env.test` and `queerpulse_test`                                                                                                                                                                                                                                                                                                                   |
| Setup or doctor prints `Node 20.x.x found` and the `>= 24.0.0` requirement                                                                 | An older Node is first on `PATH`                                                                                     | `nvm install && nvm use` (reads `.nvmrc`)                                                                                                                                                                                                                                                                                                                                    |
| `pnpm is not installed`, or `pnpm 10.x.x found` with the `pnpm@9.15.0` pin                                                                | Corepack is off, so whichever global pnpm sits on `PATH` runs                                                        | `corepack enable`                                                                                                                                                                                                                                                                                                                                                            |
