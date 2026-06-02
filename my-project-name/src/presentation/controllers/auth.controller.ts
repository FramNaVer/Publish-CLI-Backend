import { Request, Response } from "express";
import { UserRepository } from "../../domain/repositories/user.repository";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";

export class AuthController {
    private registerUseCase: RegisterUseCase;
    private loginUseCase: LoginUseCase;

    constructor(userRepo: UserRepository) {
        this.registerUseCase = new RegisterUseCase(userRepo);
        this.loginUseCase = new LoginUseCase(userRepo);
    }

    register = async (req: Request, res: Response) => {
        try {
            const { displayName, email, password } = req.body;
            const user = await this.registerUseCase.execute({ displayName, email, password });
            res.status(201).json({ user });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const result = await this.loginUseCase.execute({ email, password });
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };
}
