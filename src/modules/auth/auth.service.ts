import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions, type JwtVerifyOptions } from '@nestjs/jwt';
import { TokenType } from '@/shared/enums/auth.enum';
import { env } from '@/config/env.config';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class AuthService {
	private readonly blockedTokens: Set<string> = new Set();

	public addBlockedToken(tokenId: string): void {
		this.blockedTokens.add(tokenId);
	}

	public isBlockedToken(tokenId: string): boolean {
		return this.blockedTokens.has(tokenId);
	}

	constructor(private readonly jwtService: JwtService) {}
	private readonly JWT_SECRET: Record<TokenType, string> = {
		[TokenType.ACCESS]: env.JWT_ACCESS_SECRET,
		[TokenType.REFRESH]: env.JWT_REFRESH_SECRET,
	};
	private readonly JWT_EXP: Record<TokenType, number> = {
		[TokenType.ACCESS]: env.JWT_ACCESS_EXP,
		[TokenType.REFRESH]: env.JWT_REFRESH_EXP,
	};

	public async generateAuthTokens(userId: number) {
		const tokenId = Bun.randomUUIDv7();
		return Promise.all([
			this.signPayload({ userId, tokenId }, TokenType.ACCESS),
			this.signPayload({ userId, tokenId }, TokenType.REFRESH),
		]);
	}

	public async signPayload(payload: { userId: number; tokenId: string }, type: TokenType): Promise<string> {
		const options = { secret: this.JWT_SECRET[type], expiresIn: this.JWT_EXP[type] } satisfies JwtSignOptions;
		return this.jwtService.signAsync(payload, options);
	}

	public async verifyToken(token: string, type: TokenType) {
		try {
			const options = { secret: this.JWT_SECRET[type] } satisfies JwtVerifyOptions;
			return (await this.jwtService.verifyAsync(token, options)) as { userId: number; tokenId: string };
		} catch {
			return undefined;
		}
	}

	public extractTokenFromHeader(request: FastifyRequest): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	public extractTokenFromCookie(request: FastifyRequest, type: TokenType): string | undefined {
		return request.cookies[type];
	}

	public async revokeToken(token: string): Promise<void> {
		const payload = await this.jwtService.decode(token);
		if (payload?.tokenId) this.addBlockedToken(payload.tokenId);
	}
}
