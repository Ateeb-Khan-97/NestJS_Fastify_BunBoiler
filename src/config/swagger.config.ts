import { DocumentBuilder, type OpenAPIObject } from '@nestjs/swagger';
import type { NestJSReferenceConfiguration } from '@scalar/nestjs-api-reference';

export const SwaggerConfig = new DocumentBuilder()
	.setTitle('API Documentation')
	.setDescription('API description')
	.setVersion('1.0')
	.addBearerAuth(
		{
			description: `Please enter token in following format: Bearer <JWT>`,
			name: 'Authorization',
			bearerFormat: 'Bearer',
			scheme: 'Bearer',
			type: 'http',
			in: 'Header',
		},
		'access-token',
	)
	.build();

export const ScalarConfig = (document: OpenAPIObject): NestJSReferenceConfiguration => ({
	theme: 'saturn',
	layout: 'modern',
	content: document,
	hideModels: true,
	documentDownloadType: 'none',
	hideDarkModeToggle: true,
	hideDownloadButton: true,
	withFastify: true,
	pageTitle: 'Nest.JS API Documentation',
});
