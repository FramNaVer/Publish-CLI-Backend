#!/usr/bin/env node
import { program } from "commander";
import { runCLI } from "./cli";

program
    .name("create-my-backend")
    .description("Generate a backend project with Clean Architecture")
    .argument("[project-name]", "project name")
    .option("--dry-run", "preview the file tree without creating any files")
    .action(async (projectName: string | undefined, options: { dryRun: boolean }) => {
        await runCLI(projectName, options.dryRun);
    });

program.parse();
