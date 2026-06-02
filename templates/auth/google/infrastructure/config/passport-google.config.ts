import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { GoogleLoginUseCase } from "../../application/use-cases/google-login.use-case";

export function setupGooglePassport(googleLoginUseCase: GoogleLoginUseCase) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const result = await googleLoginUseCase.execute({
                        googleId: profile.id,
                        email: profile.emails![0].value,
                        displayName: profile.displayName,
                        avatarUrl: profile.photos?.[0].value,
                    });
                    done(null, result);
                } catch (err) {
                    done(err);
                }
            }
        )
    );
}
