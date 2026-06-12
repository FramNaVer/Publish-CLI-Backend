import inquirer from "inquirer";
import chalk from "chalk";
import { generateProject } from "./generator";

export interface UserChoices {
    projectName: string;
    database: "postgresql" | "sqlite";
    auth: ("local" | "google" | "github")[];
    includeDocker: boolean;
    includeCI: boolean;
}

export async function runCLI(projectName?: string, dryRun = false) {
    console.log(chalk.bold.cyan("\n create-my-backend\n"));

    const answers = await inquirer.prompt<UserChoices>([
        {
            type: "input",
            name: "projectName",
            message: "Project name:",
            default: projectName ?? "my-backend",
            when: !projectName,
        },
        {
            type: "select",
            name: "database",
            message: "Select database:",
            choices: [
                { name: "PostgreSQL (Neon / Supabase)", value: "postgresql" },
                { name: "SQLite  (local dev / prototype)", value: "sqlite" },
            ],
        },
        {
            type: "checkbox",
            name: "auth",
            message: "Select auth providers: (space to select)",
            choices: [
                { name: "Local  (email + password)", value: "local", checked: true },
                { name: "Google OAuth", value: "google" },
                { name: "GitHub OAuth", value: "github" },
            ],
            validate: (input) => input.length > 0 || "Select at least one provider",
        },
        {
            type: "confirm",
            name: "includeDocker",
            message: "Include Docker Compose for local development?",
            default: true,
            when: (answers) => answers.database === "postgresql",
        },
        {
            type: "confirm",
            name: "includeCI",
            message: "Include GitHub Actions CI/CD?",
            default: true,
        },
    ]);

    const choices: UserChoices = {
        ...answers,
        projectName: projectName ?? answers.projectName,
        // the Docker prompt is skipped for sqlite, leaving the answer undefined
        includeDocker: answers.includeDocker ?? false,
    };

    await generateProject(choices, dryRun);
}
