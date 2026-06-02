import bcrypt from "bcrypt";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { generateToken } from "../../utils/jwt.util";

export class LoginUseCase {
    constructor(private userRepo: UserRepository) {}

    async execute({ email, password }: { email: string; password: string }) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new Error("Invalid email or password");

        const passwordHash = await this.userRepo.findPasswordHashByUserId(user.id);
        if (!passwordHash) throw new Error("Invalid email or password");

        const isValid = await bcrypt.compare(password, passwordHash);
        if (!isValid) throw new Error("Invalid email or password");

        const token = generateToken(user.id);
        return { token, user };
    }
}
