'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { User, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
	const { data: session } = useSession()
	const router = useRouter()
	const t = useTranslations('navigation')
	const tCommon = useTranslations('common')
	const locale = useLocale()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const handleLogout = async () => {
		await signOut({ redirect: false })
		router.push(`/${locale}`)
	}

	return (
		<header className="bg-white shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Link href={`/${locale}`} className="text-2xl font-bold text-primary">
							Fixa2an
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex space-x-8 items-center">
						{session ? (
							<>
								<Link href={`/${locale}/my-cases`} className="text-gray-600 hover:text-primary">
									{t('my_cases')}
								</Link>
								<Link href={`/${locale}/upload`} className="text-gray-600 hover:text-primary">
									{t('upload')}
								</Link>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 text-gray-600">
										<User className="w-4 h-4" />
										<span className="text-sm">{session.user?.name || session.user?.email}</span>
									</div>
									<Button variant="outline" size="sm" onClick={handleLogout}>
										<LogOut className="w-4 h-4 mr-2" />
										{t('logout')}
									</Button>
								</div>
							</>
						) : (
							<>
								<Link href={`/${locale}/auth/signin`} className="text-gray-600 hover:text-primary">
									{t('login')}
								</Link>
								<Link href={`/${locale}/auth/signup`} className="text-gray-600 hover:text-primary">
									{t('register')}
								</Link>
							</>
						)}
						<LanguageSwitcher />
					</nav>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center gap-2">
						<LanguageSwitcher />
						<Button
							variant="outline"
							size="sm"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							<Menu className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden pb-4 space-y-3 border-t mt-4 pt-4">
						{session ? (
							<>
								<Link
									href={`/${locale}/my-cases`}
									className="block text-gray-600 hover:text-primary py-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									{t('my_cases')}
								</Link>
								<Link
									href={`/${locale}/upload`}
									className="block text-gray-600 hover:text-primary py-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									{t('upload')}
								</Link>
								<div className="flex items-center gap-2 text-gray-600 py-2">
									<User className="w-4 h-4" />
									<span className="text-sm">{session.user?.name || session.user?.email}</span>
								</div>
								<Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
									<LogOut className="w-4 h-4 mr-2" />
									{t('logout')}
								</Button>
							</>
						) : (
							<>
								<Link
									href={`/${locale}/auth/signin`}
									className="block text-gray-600 hover:text-primary py-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									{t('login')}
								</Link>
								<Link
									href={`/${locale}/auth/signup`}
									className="block text-gray-600 hover:text-primary py-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									{t('register')}
								</Link>
							</>
						)}
					</div>
				)}
			</div>
		</header>
	)
}


