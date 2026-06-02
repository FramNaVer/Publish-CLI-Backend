import { UserRepository } from "../../domain/repositories/user.repository";
import { generateToken } from "../utils/jwt.util";

export class GithubLoginUseCase {
    constructor(private userRepo: UserRepository) {}

    async execute(profile: { githubId: string; email: string | null; displayName: string; avatarUrl?: string }) {
        if (!profile.email) {
            throw new Error("GitHub login requires an email address");
        }

        let user = await this.userRepo.findByEmail(profile.email);

        if (!user) {
            user = await this.userRepo.create({
                email: profile.email,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                provider: "GITHUB",
                providerUserId: profile.githubId,
            });
        } else {
            await this.userRepo.linkOAuthProvider(user.id, {
                provider: "GITHUB",
                providerUserId: profile.githubId,
            });
        }

        const token = generateToken(user.id);
        return { token, user };
    }
}
