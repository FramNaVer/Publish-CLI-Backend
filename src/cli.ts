import inquirer from "inquirer";
import chalk from "chalk";
import { generateProject } from "./generator";

export interface UserChoices {
    projectName: string;
    database: "postgresql" | "sqlite";
    auth: ("local" | "google" | "github")[];
    includeCI: boolean;
}

export async function runCLI(projectName?: string) {
    console.log(chalk.bold.cyan("\n create-my-backend\n"));

    const answers = await inquirer.prompt<UserChoices>([
        {
            type: "input",
            name: "projectName",
            message: "ชื่อโปรเจกต์:",
            default: projectName ?? "my-backend",
            when: !projectName,
        },
        {
            type: "select",
            name: "database",
            message: "เลือก database:",
            choices: [
                { name: "PostgreSQL (Neon / Supabase)", value: "postgresql" },
                { name: "SQLite  (เหมาะกับ dev / prototype)", value: "sqlite" },
            ],
        },
        {
            type: "checkbox",
            name: "auth",
            message: "เลือก auth provider: (space เพื่อเลือก)",
            choices: [
                { name: "Local  (email + password)", value: "local", checked: true },
                { name: "Google OAuth", value: "google" },
                { name: "GitHub OAuth", value: "github" },
            ],
            validate: (input) => input.length > 0 || "เลือกอย่างน้อย 1 อัน",
        },
        {
            type: "confirm",
            name: "includeCI",
            message: "เพิ่ม GitHub Actions CI/CD มั้ย?",
            default: true,
        },
    ]);

    const choices: UserChoices = {
        ...answers,
        projectName: projectName ?? answers.projectName,
    };

    await generateProject(choices);
}
