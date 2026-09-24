# Suit Bro

Personal website for **Abdul Fatah**, real estate agent, Dubai / UAE.

Static HTML, black and gold, no dependencies. Three environments built from
one source.

---

## Quick start

```bash
npm run dev
```

Open <http://localhost:3000>. Nothing to install first — Node 18+ is the only
requirement.

---

## Documentation

Everything is in [`docs/`](docs/README.md):

| # | Document | Read it when |
|---|---|---|
| 01 | [Architecture](docs/01-architecture.md) | You want to know how it fits together |
| 02 | [Environments](docs/02-environments.md) | You need dev vs staging vs production |
| 03 | [Development](docs/03-development.md) | You are about to change something |
| 04 | [Deployment](docs/04-deployment.md) | You are putting it live |
| 05 | [Content status](docs/05-content-status.md) | You need to know what is real |

Brand decisions, project history and the changelog: [`PROJECT.md`](PROJECT.md).

---

## Layout

```
public/          the site — the only place you edit
config/          one file per environment
scripts/         build.js and check.js
dist/            generated output, never committed
docs/            documentation
server.js        static file server
```

---

## The three environments

| | Base URL | Indexed | Build |
|---|---|---|---|
| development | `http://localhost:3000` | No | `npm run build:dev` |
| staging | `https://staging.suitbro.ae` | No | `npm run build:staging` |
| production | `https://suitbro.ae` | Yes | `npm run build:prod` |

Development and staging show a corner badge and make every piece of invented
content visible on the page. Production shows neither.

---

## Before releasing

```bash
npm run build:prod && npm run check
```

`check` exits non-zero if the build is not safe to ship — wrong hostnames,
missing assets, a robots policy that would let a preview get indexed, or
placeholder content in a public build.

> **Note:** the site still contains invented statistics, testimonials and
> track-record entries. See [content status](docs/05-content-status.md) before
> putting it in front of clients.
