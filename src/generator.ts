import path from "path";
import ora from "ora";
import chalk from "chalk";
import { UserChoices } from "./cli";
import { writeFile, copyTemplate } from "./utils/file";

const TEMPLATES_DIR = path.join(__dirname, "../templates");

export async function generateProject(choices: UserChoices, dryRun = false) {
    if (dryRun) {
        printDryRun(choices);
        return;
    }

    const { projectName, database, auth, includeDocker, includeCI } = choices;
    const projectPath = path.join(process.cwd(), projectName);

    const spinner = ora(`Generating ${projectName}...`).start();

    try {
        await copyTemplate(path.join(TEMPLATES_DIR, "base"), projectPath);
        spinner.text = "Scaffolding project structure...";

        await copyTemplate(
            path.join(TEMPLATES_DIR, "database", database),
            projectPath,
        );
        spinner.text = "Configuring database...";

        for (const provider of auth) {
            await copyTemplate(
                path.join(TEMPLATES_DIR, "auth", provider),
                path.join(projectPath, "src"),
            );
        }
        spinner.text = "Configuring auth...";

        const packageJson = buildPackageJson(projectName, database, auth);
        await writeFile(
            path.join(projectPath, "package.json"),
            JSON.stringify(packageJson, null, 2),
        );

        const envContent = buildEnvFile(database, auth, includeDocker);
        await writeFile(path.join(projectPath, ".env.example"), envContent);
        spinner.text = "Writing config files...";

        if (includeDocker) {
            await copyTemplate(
                path.join(TEMPLATES_DIR, "docker", database),
                projectPath,
            );
            spinner.text = "Setting up Docker Compose...";
        }

        if (includeCI) {
            await copyTemplate(
                path.join(TEMPLATES_DIR, "ci"),
                path.join(projectPath, ".github", "workflows"),
            );
            spinner.text = "Setting up CI...";
        }

        spinner.succeed(chalk.green(`Created ${projectName} successfully!`));
        printNextSteps(projectName, database, includeDocker);
    } catch (err) {
        spinner.fail(chalk.red("Something went wrong"));
        throw err;
    }
}

function printDryRun(choices: UserChoices) {
    const { projectName, database, auth, includeDocker, includeCI } = choices;
    const oauthProviders = auth.filter((a) => a !== "local");

    console.log(chalk.bold.yellow("\n  Dry run — no files will be created\n"));
    console.log(chalk.bold(`  ${projectName}/`));

    const lines = [
        "  ├── main.ts",
        "  ├── package.json",
        "  ├── tsconfig.json",
        "  ├── prisma.config.ts",
        "  ├── .gitignore",
        "  ├── .env.example",
    ];

    if (includeDocker) {
        lines.push("  ├── docker-compose.yml");
    }

    lines.push(
        "  ├── prisma/",
        `  │   └── schema.prisma         ${chalk.gray(`(${database})`)}`,
        "  ├── src/",
        "  │   ├── domain/",
        "  │   ├── application/",
        `  │   │   └── use-cases/        ${chalk.gray(`(${auth.join(", ")})`)}`,
        "  │   ├── infrastructure/",
        `  │   │   ${oauthProviders.length > 0 ? "├──" : "└──"} database/          ${chalk.gray(`(${database} client)`)}`,
    );

    if (oauthProviders.length > 0) {
        lines.push(`  │   │   └── config/           ${chalk.gray(`(passport: ${oauthProviders.join(", ")})`)}`)
    }

    lines.push(
        "  │   └── presentation/",
        "  │       ├── controllers/",
        "  │       ├── routes/",
        "  │       ├── validators/",
        "  │       └── middleware/",
    );

    if (includeCI) {
        lines.push(
            "  └── .github/",
            "      └── workflows/ci.yml",
        );
    }

    lines.forEach((l) => console.log(l));

    console.log(chalk.bold("\n  Dependencies:"));

    const coreDeps = ["@prisma/client", "express", "jsonwebtoken", "dotenv", "cors", "zod"];
    console.log(chalk.gray(`  + ${coreDeps.join(", ")}`));

    if (database === "postgresql") {
        console.log(chalk.gray("  + pg, @prisma/adapter-pg"));
    } else {
        console.log(chalk.gray("  + @prisma/adapter-better-sqlite3"));
    }

    if (auth.includes("local")) console.log(chalk.gray("  + bcrypt"));
    if (oauthProviders.length > 0) console.log(chalk.gray("  + passport"));
    if (auth.includes("google")) console.log(chalk.gray("  + passport-google-oauth20"));
    if (auth.includes("github")) console.log(chalk.gray("  + passport-github2"));

    console.log();
}

function buildPackageJson(projectName: string, database: string, auth: string[]) {
    const deps: Record<string, string> = {
        "@prisma/client": "^7.8.0",
        express: "^5.2.1",
        jsonwebtoken: "^9.0.3",
        dotenv: "^16.0.0",
        cors: "^2.8.5",
        zod: "^3.23.0",
    };

    const devDeps: Record<string, string> = {
        "@types/express": "^5.0.6",
        "@types/jsonwebtoken": "^9.0.10",
        "@types/node": "^22.0.0",
        "@types/cors": "^2.8.17",
        prisma: "^7.8.0",
        "ts-node": "^10.9.2",
        typescript: "^6.0.3",
        vitest: "^4.0.0",
    };

    if (database === "postgresql") {
        deps["@prisma/adapter-pg"] = "^7.8.0";
        deps["pg"] = "^8.21.0";
        devDeps["@types/pg"] = "^8.0.0";
    } else {
        deps["@prisma/adapter-better-sqlite3"] = "^7.8.0";
    }

    if (auth.includes("local")) {
        deps["bcrypt"] = "^6.0.0";
        devDeps["@types/bcrypt"] = "^6.0.0";
    }
    if (auth.includes("google")) {
        deps["passport"] = "^0.7.0";
        deps["passport-google-oauth20"] = "^2.0.0";
        devDeps["@types/passport"] = "^1.0.17";
        devDeps["@types/passport-google-oauth20"] = "^2.0.17";
    }
    if (auth.includes("github")) {
        deps["passport"] = deps["passport"] ?? "^0.7.0";
        deps["passport-github2"] = "^0.1.12";
        devDeps["@types/passport"] = devDeps["@types/passport"] ?? "^1.0.17";
        devDeps["@types/passport-github2"] = "^1.1.0";
    }

    return {
        name: projectName,
        version: "1.0.0",
        scripts: {
            dev: "ts-node main.ts",
            build: "tsc --outDir dist",
            start: "node dist/main.js",
            test: "vitest run",
            "test:watch": "vitest",
        },
        dependencies: deps,
        devDependencies: devDeps,
    };
}

function buildEnvFile(database: string, auth: string[], includeDocker: boolean): string {
    const lines = ["# Generated by create-my-backend", ""];

    lines.push("JWT_SECRET=your-secret-here", "");

    if (database === "postgresql" && includeDocker) {
        lines.push(
            "# Matches the local docker-compose.yml database",
            "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devdb",
            "",
            "# Direct URL — used for prisma migrate",
            "DIRECT_URL=postgresql://postgres:postgres@localhost:5432/devdb",
            "",
        );
    } else if (database === "postgresql") {
        lines.push(
            "# Pooler URL — used by PrismaClient at runtime",
            "DATABASE_URL=postgresql://user:password@host/db?sslmode=require",
            "",
            "# Direct URL — used for prisma migrate",
            "DIRECT_URL=postgresql://user:password@host/db?sslmode=require",
            "",
        );
    } else {
        lines.push("DATABASE_URL=file:./dev.db", "");
    }

    if (auth.includes("google")) {
        lines.push(
            "GOOGLE_CLIENT_ID=",
            "GOOGLE_CLIENT_SECRET=",
            "GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback",
            "",
        );
    }
    if (auth.includes("github")) {
        lines.push(
            "GITHUB_CLIENT_ID=",
            "GITHUB_CLIENT_SECRET=",
            "GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback",
            "",
        );
    }

    return lines.join("\n");
}

function printNextSteps(projectName: string, database: string, includeDocker: boolean) {
    const dockerStep = includeDocker
        ? `\n  ${chalk.cyan("docker compose up -d")}   ${chalk.gray("← start local database")}`
        : "";

    console.log(`
${chalk.bold("Next steps:")}

  ${chalk.cyan(`cd ${projectName}`)}
  ${chalk.cyan("npm install")}
  ${chalk.cyan("cp .env.example .env")}   ${chalk.gray("← fill in real values")}${dockerStep}
  ${database === "postgresql"
        ? chalk.cyan("npx prisma migrate dev --name init")
        : chalk.cyan("npx prisma db push")
    }
  ${chalk.cyan("npx prisma generate")}
  ${chalk.cyan("npm run dev")}
`);
}
