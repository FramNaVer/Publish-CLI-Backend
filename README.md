# @tanadon/create-backend

CLI tool for scaffolding a production-ready Express.js backend with Clean Architecture, Prisma, and JWT authentication.

```bash
npx @tanadon/create-backend my-project
```

## Features

- **Clean Architecture** — domain, application, infrastructure, presentation layers
- **TypeScript** — strict mode enabled
- **Prisma 7** — ORM with PostgreSQL or SQLite
- **Auth** — Local (email/password), Google OAuth, GitHub OAuth
- **JWT** — authentication with jsonwebtoken
- **Vitest** — unit testing setup included
- **GitHub Actions** — CI/CD workflow (optional)
- **Docker Compose** — local PostgreSQL database (optional)

## Requirements

- Node.js >= 18
- Docker (if using Docker Compose option)

## Usage

```bash
npx @tanadon/create-backend my-project
```

You will be prompted to choose:

```
? Project name: my-project
? Select database:
  ❯ PostgreSQL (Neon / Supabase)
    SQLite (local dev / prototype)

? Select auth providers:
  ❯ ◉ Local (email + password)
    ◯ Google OAuth
    ◯ GitHub OAuth

? Include Docker Compose for local development? Yes
? Include GitHub Actions CI/CD? Yes
```

## Getting Started

After generating your project:

```bash
cd my-project
docker compose up -d        # start local PostgreSQL (if selected)
npm install                 # installs deps + runs prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Generated Project Structure

```
my-project/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── user.entities.ts        # User type definitions
│   │   └── repositories/
│   │       └── user.repository.ts      # Repository interfaces
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── register.use-case.ts
│   │   │   ├── login.use-case.ts
│   │   │   └── ...                     # OAuth use cases (if selected)
│   │   └── utils/
│   │       └── jwt.util.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── prisma-user.repository.ts
│   │   └── config/
│   │       └── passport-*.config.ts    # OAuth configs (if selected)
│   └── presentation/
│       ├── controllers/
│       │   └── auth.controller.ts
│       └── routes/
│           └── auth.route.ts
├── prisma/
│   └── schema.prisma
├── prisma.config.ts
├── main.ts
├── docker-compose.yml                  # (if selected)
└── .github/workflows/ci.yml           # (if selected)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register with email + password |
| POST | `/api/auth/login` | Login with email + password |
| GET | `/api/auth/google` | Google OAuth (if selected) |
| GET | `/api/auth/github` | GitHub OAuth (if selected) |

## Generated package.json Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm test` | Run unit tests |

## Environment Variables

```env
JWT_SECRET=your-secret-here

# PostgreSQL
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...     # used for prisma migrate

# Google OAuth (if selected)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# GitHub OAuth (if selected)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
```

## License

MIT
