import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../../domain/repositories/user.repository";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { registerSchema, loginSchema } from "../validators/auth.validator";

export class AuthController {
    private registerUseCase: RegisterUseCase;
    private loginUseCase: LoginUseCase;

    constructor(userRepo: UserRepository) {
        this.registerUseCase = new RegisterUseCase(userRepo);
        this.loginUseCase = new LoginUseCase(userRepo);
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = registerSchema.parse(req.body);
            const user = await this.registerUseCase.execute(body);
            res.status(201).json({ user });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = loginSchema.parse(req.body);
            const result = await this.loginUseCase.execute(body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
