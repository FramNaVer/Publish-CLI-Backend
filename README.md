# @tanadon/create-backend

CLI for scaffolding a backend project with Clean Architecture, Prisma, Express, and TypeScript.

## Quick Start

```bash
npx @tanadon/create-backend my-app
```

Or let the CLI prompt for a name:

```bash
npx @tanadon/create-backend
```

## Usage

```bash
# Create a new project
npx @tanadon/create-backend my-app

# Preview what will be generated (no files created)
npx @tanadon/create-backend my-app --dry-run
```

## Options

| Option | Description |
|--------|-------------|
| `[project-name]` | Project name (prompted if omitted) |
| `--dry-run` | Show the file tree and dependencies without creating any files |

## Prompts

| Prompt | Choices |
|--------|---------|
| Project name | free text |
| Database | PostgreSQL (Neon / Supabase), SQLite |
| Auth providers | Local (email + password), Google OAuth, GitHub OAuth |
| GitHub Actions CI/CD | Yes / No |

## Generated Project Structure

```
my-app/
├── main.ts                         # Express server entry point
├── package.json                    # Dependencies based on selected options
├── tsconfig.json
├── .gitignore
├── .env.example                    # Environment variable template
├── prisma/
│   ├── schema.prisma               # Schema for the selected database
│   └── prisma.config.ts
├── src/
│   ├── domain/
│   │   ├── entities/user.entities.ts
│   │   └── repositories/user.repository.ts
│   ├── application/
│   │   ├── use-cases/              # login, register + OAuth use cases
│   │   └── utils/jwt.util.ts
│   ├── infrastructure/
│   │   ├── repositories/prisma-user.repository.ts
│   │   └── config/                 # passport configs (if OAuth selected)
│   └── presentation/
│       ├── controllers/auth.controller.ts
│       ├── routes/auth.route.ts
│       ├── validators/auth.validator.ts
│       └── middleware/error.middleware.ts
└── .github/
    └── workflows/ci.yml            # (if CI selected)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Register with email + password |
| POST | `/api/auth/login` | Login with email + password |

## Environment Variables

```env
JWT_SECRET=your-secret-here

# PostgreSQL
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
DIRECT_URL=postgresql://user:password@host/db?sslmode=require

# Google OAuth (if selected)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth (if selected)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

## Getting Started After Generation

```bash
cd my-app
npm install
cp .env.example .env

# PostgreSQL
npx prisma migrate dev --name init

# SQLite
npx prisma db push

npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm test` | Run tests |

## Tech Stack

| Layer | Package |
|-------|---------|
| Framework | Express 5 |
| ORM | Prisma 7 |
| Validation | Zod |
| Auth | jsonwebtoken + bcrypt + passport |
| Language | TypeScript 6 |
| Test | Vitest |

## Requirements

- Node.js >= 18

## License

MIT
