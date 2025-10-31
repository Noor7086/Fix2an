import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

const locales = ['en', 'sv']

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
	params: { locale },
}: {
	params: { locale: string }
}): Promise<Metadata> {
	const isSwedish = locale === 'sv'

	return {
		title: isSwedish ? 'Fixa2an - Hitta din verkstad' : 'Fixa2an - Find your workshop',
		description: isSwedish
			? 'Få erbjudanden från verifierade verkstäder för din bilreparation. Enkelt, snabbt och säkert.'
			: 'Get offers from verified workshops for your car repair. Easy, fast and secure.',
		keywords: isSwedish
			? 'verkstad, bilreparation, service, inspektion, Sverige'
			: 'workshop, car repair, service, inspection, Sweden',
		authors: [{ name: 'Fixa2an' }],
		openGraph: {
			title: isSwedish ? 'Fixa2an - Hitta din verkstad' : 'Fixa2an - Find your workshop',
			description: isSwedish
				? 'Få erbjudanden från verifierade verkstäder för din bilreparation.'
				: 'Get offers from verified workshops for your car repair.',
			type: 'website',
			locale: isSwedish ? 'sv_SE' : 'en_US',
		},
	}
}

export default async function RootLayout({
	children,
	params: { locale },
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	// Validate that the incoming `locale` parameter is valid
	if (!locales.includes(locale)) {
		notFound()
	}

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages()

	return (
		<html lang={locale}>
			<body className={inter.className}>
				<NextIntlClientProvider messages={messages}>
					<AuthProvider>
						{children}
						<Toaster />
					</AuthProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
