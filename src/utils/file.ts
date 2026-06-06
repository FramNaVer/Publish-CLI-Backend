import fs from "fs-extra";
import path from "path";

export async function copyTemplate(templatePath: string, destPath: string) {
    await fs.copy(templatePath, destPath, { overwrite: false });
}

export async function writeFile(filePath: string, content: string) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf-8");
}

export function renderTemplate(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
        (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
        template
    );
}

export async function ensureDir(dirPath: string) {
    await fs.ensureDir(dirPath);
}
