import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

type FastifyRequestWithUser = FastifyRequest & { user: { id: number } };
export const CurrentUser = createParamDecorator((_, context: ExecutionContext): number | undefined => {
	return context.switchToHttp().getRequest<FastifyRequestWithUser>().user?.id;
});
