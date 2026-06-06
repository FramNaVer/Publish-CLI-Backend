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

    const { projectName, database, auth, includeCI } = choices;
    const projectPath = path.join(process.cwd(), projectName);

    const spinner = ora(`Generating ${projectName}...`).start();

    try {
        await copyTemplate(path.join(TEMPLATES_DIR, "base"), projectPath);
        spinner.text = "Scaffolding project structure...";

        await copyTemplate(
            path.join(TEMPLATES_DIR, "database", database),
            path.join(projectPath, "prisma"),
        );
        spinner.text = "Configuring database...";

        for (const provider of auth) {
            await copyTemplate(
                path.join(TEMPLATES_DIR, "auth", provider),
                path.join(projectPath, "src"),
            );
        }
        spinner.text = "Configuring auth...";

        const packageJson = buildPackageJson(projectName, auth);
        await writeFile(
            path.join(projectPath, "package.json"),
            JSON.stringify(packageJson, null, 2),
        );

        const envContent = buildEnvFile(database, auth);
        await writeFile(path.join(projectPath, ".env.example"), envContent);
        spinner.text = "Writing config files...";

        if (includeCI) {
            await copyTemplate(
                path.join(TEMPLATES_DIR, "ci"),
                path.join(projectPath, ".github", "workflows"),
            );
            spinner.text = "Setting up CI...";
        }

        spinner.succeed(chalk.green(`Created ${projectName} successfully!`));
        printNextSteps(projectName, database);
    } catch (err) {
        spinner.fail(chalk.red("Something went wrong"));
        throw err;
    }
}

function printDryRun(choices: UserChoices) {
    const { projectName, database, auth, includeCI } = choices;
    const oauthProviders = auth.filter((a) => a !== "local");

    console.log(chalk.bold.yellow("\n  Dry run — no files will be created\n"));
    console.log(chalk.bold(`  ${projectName}/`));

    const lines = [
        "  ├── main.ts",
        "  ├── package.json",
        "  ├── tsconfig.json",
        "  ├── .gitignore",
        "  ├── .env.example",
        "  ├── prisma/",
        `  │   ├── schema.prisma         ${chalk.gray(`(${database})`)}`,
        "  │   └── prisma.config.ts",
        "  ├── src/",
        "  │   ├── domain/",
        "  │   ├── application/",
        `  │   │   └── use-cases/        ${chalk.gray(`(${auth.join(", ")})`)}`,
        "  │   ├── infrastructure/",
    ];

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

    if (auth.includes("local")) console.log(chalk.gray("  + bcrypt"));
    if (oauthProviders.length > 0) console.log(chalk.gray("  + passport"));
    if (auth.includes("google")) console.log(chalk.gray("  + passport-google-oauth20"));
    if (auth.includes("github")) console.log(chalk.gray("  + passport-github2"));

    console.log();
}

function buildPackageJson(projectName: string, auth: string[]) {
    const deps: Record<string, string> = {
        "@prisma/adapter-pg": "^7.8.0",
        "@prisma/client": "^7.8.0",
        express: "^5.2.1",
        jsonwebtoken: "^9.0.3",
        pg: "^8.21.0",
        dotenv: "^16.0.0",
        cors: "^2.8.5",
        zod: "^3.23.0",
    };

    const devDeps: Record<string, string> = {
        "@types/express": "^5.0.6",
        "@types/jsonwebtoken": "^9.0.10",
        "@types/node": "^22.0.0",
        "@types/pg": "^8.0.0",
        "@types/cors": "^2.8.17",
        prisma: "^7.8.0",
        "ts-node": "^10.9.2",
        typescript: "^6.0.3",
        vitest: "^4.0.0",
    };

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

function buildEnvFile(database: string, auth: string[]): string {
    const lines = ["# Generated by create-my-backend", ""];

    lines.push("JWT_SECRET=your-secret-here", "");

    if (database === "postgresql") {
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

function printNextSteps(projectName: string, database: string) {
    console.log(`
${chalk.bold("Next steps:")}

  ${chalk.cyan(`cd ${projectName}`)}
  ${chalk.cyan("npm install")}
  ${chalk.cyan("cp .env.example .env")}   ${chalk.gray("← fill in real values")}
  ${database === "postgresql"
        ? chalk.cyan("npx prisma migrate dev --name init")
        : chalk.cyan("npx prisma db push")
    }
  ${chalk.cyan("npm run dev")}
`);
}
