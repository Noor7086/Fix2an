module.exports = {
	root: true,
	reportUnusedDisableDirectives: true,
	env: { es2021: true, node: true, browser: false },
	extends: ['plugin:prettier/recommended'],
	overrides: [
		// Frontend (Next.js)
		{
			files: ['frontend/**/*.{ts,tsx}'],
			env: { browser: true, node: true },
			extends: ['next/core-web-vitals', 'plugin:prettier/recommended'],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: './frontend/tsconfig.json',
			},
		},
		// Backend + Shared (TypeScript node)
		{
			files: ['backend/**/*.ts', 'shared/**/*.ts'],
			parser: '@typescript-eslint/parser',
			plugins: ['@typescript-eslint'],
			extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ['./backend/tsconfig.json', './shared/tsconfig.json'],
			},
			rules: {
				'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			},
		},
	],
	ignorePatterns: [
		'**/node_modules/**',
		'**/.next/**',
		'**/dist/**',
		'**/build/**',
		'**/prisma/**',
	],
}
