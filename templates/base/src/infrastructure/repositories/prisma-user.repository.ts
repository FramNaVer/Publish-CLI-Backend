import { PrismaClient, User } from "../../../generated/prisma";
import { UserEntity, Role } from "../../domain/entities/user.entities";
import { UserRepository, CreateUserData, LinkOAuthData } from "../../domain/repositories/user.repository";

export class PrismaUserRepository implements UserRepository {
    constructor(private prisma: PrismaClient) {}

    private toEntity(user: User): UserEntity {
        return { ...user, role: user.role as Role };
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user ? this.toEntity(user) : null;
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user ? this.toEntity(user) : null;
    }

    async findPasswordHashByUserId(userId: string) {
        const record = await this.prisma.userPassword.findUnique({ where: { userId } });
        return record?.passwordHash ?? null;
    }

    async create(data: CreateUserData) {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                displayName: data.displayName,
                avatarUrl: data.avatarUrl,
                ...(data.passwordHash && {
                    passwordHash: { create: { passwordHash: data.passwordHash } },
                }),
                ...(data.provider && data.providerUserId && {
                    oauthProviders: {
                        create: {
                            provider: data.provider,
                            providerUserId: data.providerUserId,
                            accessToken: "",
                        },
                    },
                }),
            },
        });
        return this.toEntity(user);
    }

    async linkOAuthProvider(userId: string, data: LinkOAuthData) {
        await this.prisma.userOAuthProvider.upsert({
            where: {
                provider_providerUserId: {
                    provider: data.provider,
                    providerUserId: data.providerUserId,
                },
            },
            create: {
                userId,
                provider: data.provider,
                providerUserId: data.providerUserId,
                accessToken: data.accessToken ?? "",
            },
            update: { accessToken: data.accessToken ?? "" },
        });
    }
}
