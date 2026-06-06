#!/usr/bin/env node
import { program } from "commander";
import { runCLI } from "./cli";

program
    .name("create-my-backend")
    .description("Generate a backend project with Clean Architecture")
    .argument("[project-name]", "ชื่อโปรเจกต์")
    .option("--dry-run", "แสดง file tree ที่จะ generate โดยไม่สร้างไฟล์จริง")
    .action(async (projectName: string | undefined, options: { dryRun: boolean }) => {
        await runCLI(projectName, options.dryRun);
    });

program.parse();
