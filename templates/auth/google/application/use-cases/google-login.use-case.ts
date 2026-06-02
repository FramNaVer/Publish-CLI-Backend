import { UserRepository } from "../../domain/repositories/user.repository";
import { generateToken } from "../utils/jwt.util";

export class GoogleLoginUseCase {
    constructor(private userRepo: UserRepository) {}

    async execute(profile: { googleId: string; email: string; displayName: string; avatarUrl?: string }) {
        let user = await this.userRepo.findByEmail(profile.email);

        if (!user) {
            user = await this.userRepo.create({
                email: profile.email,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                provider: "GOOGLE",
                providerUserId: profile.googleId,
            });
        } else {
            await this.userRepo.linkOAuthProvider(user.id, {
                provider: "GOOGLE",
                providerUserId: profile.googleId,
            });
        }

        const token = generateToken(user.id);
        return { token, user };
    }
}
