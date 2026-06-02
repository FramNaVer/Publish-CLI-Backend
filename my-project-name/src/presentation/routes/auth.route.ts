import { Router } from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma";
import { PrismaUserRepository } from "../../infrastructure/repositories/prisma-user.repository";
import { AuthController } from "../controllers/auth.controller";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const router = Router();

const userRepo = new PrismaUserRepository(prisma);
const authController = new AuthController(userRepo);

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
