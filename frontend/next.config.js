const withNextIntl = require('next-intl/plugin')(
	// This is the default (also the `src` folder is supported out of the box)
	'./src/i18n.ts',
)

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['localhost', 's3.amazonaws.com', 'fixa2an.s3.eu-north-1.amazonaws.com'],
	},
	env: {
		NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
		_next_intl_trailing_slash: 'false',
	},
}

module.exports = withNextIntl(nextConfig)
