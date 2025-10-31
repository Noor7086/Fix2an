import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
	// A list of all locales that are supported
	locales: ['en', 'sv'],

	// Used when no locale matches
	defaultLocale: 'en',

	// Disable Accept-Language based detection to avoid flicker/auto-switching
	localeDetection: false,
})

export const config = {
	// Match only internationalized pathnames
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
