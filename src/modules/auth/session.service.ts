import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionService {
	constructor(private readonly prisma: PrismaService) {}

	public async create(userId: string, tokenId: string): Promise<void> {
		await this.prisma.session.create({ data: { userId, tokenId } });
	}

	public async exists(tokenId: string): Promise<boolean> {
		const session = await this.prisma.session.findUnique({ where: { tokenId } });
		return Boolean(session);
	}

	public async delete(tokenId: string): Promise<void> {
		await this.prisma.session.deleteMany({ where: { tokenId } });
	}

	/**
	 * Atomically rotate a session: only succeeds if the old `tokenId` is still
	 * present (i.e. the refresh token has not already been used/revoked). The old
	 * record is removed and the new one stored. Returns false when the old
	 * session no longer exists, signalling a replayed or revoked refresh token.
	 */
	public async rotate(oldTokenId: string, userId: string, newTokenId: string): Promise<boolean> {
		return this.prisma.$transaction(async (tx) => {
			const deleted = await tx.session.deleteMany({ where: { tokenId: oldTokenId } });
			if (deleted.count === 0) return false;
			await tx.session.create({ data: { userId, tokenId: newTokenId } });
			return true;
		});
	}
}
