# create-my-backend

CLI สำหรับสร้าง backend project ด้วย Clean Architecture พร้อม Prisma, Express, และ TypeScript

## Quick Start

```bash
npx create-my-backend my-app
```

หรือไม่ใส่ชื่อก็ได้ CLI จะถามเอง:

```bash
npx create-my-backend
```

## Usage

```bash
# สร้างโปรเจกต์ใหม่
npx create-my-backend my-app

# ดูก่อนว่าจะสร้างอะไรบ้าง (ยังไม่สร้างไฟล์จริง)
npx create-my-backend my-app --dry-run
```

## Options

| Option | Description |
|--------|-------------|
| `[project-name]` | ชื่อโปรเจกต์ (ถ้าไม่ใส่จะถามทีหลัง) |
| `--dry-run` | แสดง file tree และ dependencies ที่จะสร้าง โดยไม่สร้างไฟล์จริง |

## Prompts

CLI จะมีถามคำถาม 4 ข้อ:

| คำถาม | ตัวเลือก |
|-------|---------|
| ชื่อโปรเจกต์ | free text |
| Database | PostgreSQL (Neon / Supabase), SQLite |
| Auth provider | Local (email + password), Google OAuth, GitHub OAuth |
| GitHub Actions CI/CD | Yes / No |

## Generated Project Structure

```
my-app/
├── main.ts                         # Express server entry point
├── package.json                    # Dependencies ตาม options ที่เลือก
├── tsconfig.json
├── .gitignore
├── .env.example                    # Template env vars
├── prisma/
│   ├── schema.prisma               # Schema ตาม database ที่เลือก
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
│   │   └── config/                 # passport configs (ถ้าเลือก OAuth)
│   └── presentation/
│       ├── controllers/auth.controller.ts
│       ├── routes/auth.route.ts
│       ├── validators/auth.validator.ts
│       └── middleware/error.middleware.ts
└── .github/
    └── workflows/ci.yml            # (ถ้าเลือก CI)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | สมัครสมาชิกด้วย email + password |
| POST | `/api/auth/login` | เข้าสู่ระบบด้วย email + password |

## Environment Variables

```env
JWT_SECRET=your-secret-here

# PostgreSQL
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
DIRECT_URL=postgresql://user:password@host/db?sslmode=require

# Google OAuth (ถ้าเลือก)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth (ถ้าเลือก)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
```

## Next Steps After Generation

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
