import passport from "passport";
import { Strategy as GithubStrategy, Profile as GithubProfile } from "passport-github2";
import { GithubLoginUseCase } from "../../application/use-cases/github-login.use-case";

export function setupGithubPassport(githubLoginUseCase: GithubLoginUseCase) {
    passport.use(
        new GithubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
                callbackURL: process.env.GITHUB_CALLBACK_URL!,
                scope: ["user:email"],
            },
            async (_accessToken: string, _refreshToken: string, profile: GithubProfile, done: (err: any, user?: any) => void) => {
                try {
                    const result = await githubLoginUseCase.execute({
                        githubId: profile.id,
                        email: profile.emails?.[0]?.value ?? null,
                        displayName: profile.displayName,
                        avatarUrl: profile.photos?.[0]?.value,
                    });
                    done(null, result);
                } catch (err) {
                    done(err);
                }
            }
        )
    );
}
