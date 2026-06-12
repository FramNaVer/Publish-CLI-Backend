import { Router } from "express";
import { prisma } from "../../infrastructure/database/prisma";
import { PrismaUserRepository } from "../../infrastructure/repositories/prisma-user.repository";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

const userRepo = new PrismaUserRepository(prisma);
const authController = new AuthController(userRepo);

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
