import { build, $ } from 'bun';

await $`rm -rf dist`;

const optionalRequirePackages = [
	'class-transformer',
	'class-validator',
	'class-transformer/storage',
	'@nestjs/microservices',
	'@nestjs/websockets',
	'@fastify/static',
	'@nestjs/platform-express',
	'@fastify/view',
	'@nestjs/sequelize',
	'@nestjs/mongoose',
	'@nestjs/typeorm',
	'@mikro-orm/core',
];

const result = await build({
	entrypoints: ['./src/main.ts'],
	outdir: './dist',
	target: 'bun',
	minify: { syntax: true, whitespace: true },
	external: optionalRequirePackages.filter((pkg) => {
		try {
			require(pkg);
			return false;
		} catch (_) {
			return true;
		}
	}),
});

if (!result.success) {
	console.log(result.logs[0]);
	process.exit(1);
}

console.log('Built successfully!');
