import fs from "fs-extra";
import path from "path";

// copy ทั้ง folder จาก template ไปยัง destination
export async function copyTemplate(templatePath: string, destPath: string) {
    await fs.copy(templatePath, destPath, { overwrite: false });
}

// เขียนไฟล์ใหม่ สร้าง directory ให้อัตโนมัติถ้าไม่มี
export async function writeFile(filePath: string, content: string) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf-8");
}

// แทนที่ placeholder ใน string เช่น {{projectName}} → "my-backend"
export function renderTemplate(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
        (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
        template
    );
}

// สร้าง directory เปล่าๆ
export async function ensureDir(dirPath: string) {
    await fs.ensureDir(dirPath);
}
