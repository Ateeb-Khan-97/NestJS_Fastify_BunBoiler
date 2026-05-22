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

await $`bun build --compile --minify-whitespace --minify-syntax --target bun --outfile dist/server dist/main.js`
await $`rm -rf dist/main.js`

console.log('Built successfully!');
