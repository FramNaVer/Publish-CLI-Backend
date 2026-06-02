#!/usr/bin/env node
import { program } from "commander";
import { runCLI } from "./cli";

program
    .name("create-my-backend")
    .description("Generate a backend project with Clean Architecture")
    .argument("[project-name]", "ชื่อโปรเจกต์")
    .action(async (projectName?: string) => {
        await runCLI(projectName);
    });

program.parse();
