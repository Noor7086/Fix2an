'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { useLocale } from 'next-intl'

const languages = [
	{ code: 'sv', name: 'Svenska', flag: '🇸🇪' },
	{ code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageSwitcher() {
	const router = useRouter()
	const pathname = usePathname()
	const locale = useLocale()

	const handleLanguageChange = (newLocale: string) => {
		try {
			// Persist locale in cookie for next-intl/middleware
			document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
		} catch {}

		// Compute path without current locale prefix (first segment)
		const segments = pathname.split('/').filter(Boolean)
		const currentLocale = segments[0]
		const supported = ['en', 'sv']
		const rest = supported.includes(currentLocale) ? `/${segments.slice(1).join('/')}` : `/${segments.join('/')}`
		const target = `/${newLocale}${rest === '/' ? '' : rest}` || `/${newLocale}`

		router.push(target)
	}

	const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]

	return (
		<div className="flex items-center space-x-2">
			<Globe className="h-4 w-4 text-gray-600" />
			<Select value={locale} onValueChange={handleLanguageChange}>
				<SelectTrigger className="w-auto min-w-[120px] border-gray-300">
					<SelectValue>
						<div className="flex items-center space-x-2">
							<span>{currentLanguage.flag}</span>
							<span className="hidden sm:inline">{currentLanguage.name}</span>
						</div>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{languages.map((language) => (
						<SelectItem key={language.code} value={language.code}>
							<div className="flex items-center space-x-2">
								<span>{language.flag}</span>
								<span>{language.name}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
